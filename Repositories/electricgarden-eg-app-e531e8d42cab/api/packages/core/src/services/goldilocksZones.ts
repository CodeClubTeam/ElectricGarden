import {
  GoldilocksRuleDocument,
  Growable,
  SampleMetric,
  Sensor,
  Team,
} from '@eg/doc-db';
import { sendTemplateEmailToUser } from '../mailer';

type Sample = {
  timestamp: Date;
} & {
  [T in SampleMetric]?: number;
};

type Match = {
  growable: {
    title: string;
    id: string;
    teamId: string;
  };
  rule: {
    title: string;
    metric: SampleMetric;
    min: number | undefined;
    max: number | undefined;
  };
  value: number;
};

// TODO better name as it's "violations"
export const getMatchingGoldilocksZones = async (
  serial: string,
  sample: Sample,
): Promise<Match[]> => {
  const sensor = await Sensor.findOneBySerial(serial);
  if (!sensor) {
    return [];
  }

  const growables = await Growable.find({ sensor: sensor._id }).exec();

  return growables
    .map((growable) => {
      return growable.goldilocksRules
        .filter((r): r is GoldilocksRuleDocument => typeof r !== 'string')
        .filter(({ metric, min, max }) => {
          if (!(metric in sample)) {
            return false;
          }
          const value = sample[metric];
          if (value === undefined) {
            return false;
          }
          //   console.log({ serial, sample, metric, value, min, max });
          return (
            (min !== undefined && value < min) ||
            (max !== undefined && value > max)
          );
        })
        .map(({ metric, min, max, title }) => ({
          growable: {
            title: growable.title,
            id: growable.id,
            teamId: growable.teamId,
          },
          rule: {
            title,
            metric,
            min,
            max,
          },
          value: sample[metric],
        }))
        .filter((v): v is Match => v.value !== undefined);
    })
    .filter((v) => v.length > 0)
    .flat();
};

type NotificationDetails = {
  serial: string;
  growableTitle: string;
  ruleTitle: string;
  minValue?: number;
  maxValue?: number;
  value: number;
  timestamp: Date;
  metricTitle: string;
};

export const sendNotificationEmail = async (
  userId: string,
  {
    ruleTitle,
    value,
    minValue,
    maxValue,
    serial,
    metricTitle,
    growableTitle,
  }: NotificationDetails,
) =>
  sendTemplateEmailToUser({
    templateName: 'EG Goldilocks',
    userId,
    mergeVars: {
      // TODO: add properties from details as needed for template
      APP_URL: 'https://app.electricgarden.nz',
      SERIAL: serial,
      RULE_TITLE: ruleTitle,
      VALUE: value,
      HAS_MIN: minValue !== undefined,
      HAS_MAX: maxValue !== undefined,
      MIN_VALUE: minValue,
      MAX_VALUE: maxValue,
      METRIC: metricTitle,
      GROWABLE: growableTitle,
    },
  });

const SAMPLE_TYPE_TITLES_BY_NAME: Record<SampleMetric, string> = {
  probeSoilTemp: 'Soil Temperature',
  probeAirTemp: 'Air Temperature',
  probeMoisture: 'Soil Moisture',
  ambientTemp: 'Air Temperature',
  ambientHumidity: 'Ambient Humidity',
  co2: 'Carbon Dioxide level',
  light: 'Light level',
};

export const notifyForGoldilocksZones = async (
  serial: string,
  sample: Sample,
) => {
  const matches = await getMatchingGoldilocksZones(serial, sample);
  if (matches.length === 0) {
    return;
  }

  const userIds = [];
  for (const { growable } of matches) {
    const team = await Team.findById(growable.teamId).exec();
    if (team) {
      const members = team.memberships;
      for (const member of members) {
        if (member.role === 'leader') {
          userIds.push(member.userId.toHexString());
        }
      }
    }
  }

  for (const userId of userIds) {
    for (const { growable, rule, value } of matches) {
      await sendNotificationEmail(userId, {
        serial,
        timestamp: sample.timestamp,
        growableTitle: growable.title,
        ruleTitle: rule.title,
        minValue: rule.min,
        maxValue: rule.max,
        metricTitle: `${SAMPLE_TYPE_TITLES_BY_NAME[rule.metric]}`,
        value,
      });
    }
  }
};
