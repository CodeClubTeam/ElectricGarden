import { User } from '@eg/doc-db';
import { Mandrill, Messages } from 'mandrill-api';

import { getRequiredConfig } from './config';

export const sendTemplateEmail = async ({
  to: { email, name },
  templateName,
  subject,
  mergeVars,
}: {
  templateName: string;
  to: {
    email: string;
    name?: string;
  };
  subject?: string;
  mergeVars?: any;
}) => {
  const mandrill = new Mandrill(getRequiredConfig('MANDRILL_API_KEY'));

  return new Promise((resolve, reject) => {
    const message: Parameters<Messages['sendTemplate']>[0] = {
      // eslint-disable-next-line camelcase
      from_email: 'noreply@electricgarden.nz',
      // eslint-disable-next-line camelcase
      from_name: 'Electric Garden Team',
      to: [{ email, name, type: 'to' }],
      subject,
      // eslint-disable-next-line camelcase
      global_merge_vars: Object.entries(mergeVars).map(([name, content]) => ({
        name,
        content,
      })),
    };
    mandrill.messages.sendTemplate(
      {
        // eslint-disable-next-line camelcase
        template_name: templateName,
        // eslint-disable-next-line camelcase
        template_content: [],
        message,
      },
      resolve,
      reject,
    );
  });
};

export const sendTemplateEmailToUser = async ({
  templateName,
  userId,
  subject,
  mergeVars,
}: {
  templateName: string;
  userId: string;
  subject?: string;
  mergeVars?: any;
}) => {
  const user = await User.findById(userId).populate('_organisation').exec();
  if (!user) {
    throw new Error(`Could not find user with id ${userId} to email.`);
  }
  return sendTemplateEmail({
    to: {
      email: user.email,
      name: user.name,
    },
    subject,
    templateName,
    mergeVars: {
      FULL_NAME: user.name,
      ORGANISATION_NAME: user.organisation.name,
      ORGANISATION_ADDRESS: user.organisation.address.getFullAddress(),
      ...mergeVars,
    },
  });
};
