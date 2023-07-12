import { addDecorator } from '@storybook/react';
import React from 'react';

import { ActivityCompletionContextProvider } from '../../../../pages/Lessons/components/content/ActivityCompletion';
import { MatchTarget } from '../MatchTarget';
import { MatchingActivity } from '../MatchingActivity';
import { Image, TextBox, Para } from '../../primitives';
import airSensor from './air-sensor.png';
import egBase from './eg-base.png';
import soilProbe from './soil-probe.png';
import nzMap from './map-nz.svg';
import datataonga from './datataonga.png';

export const text = () => (
    <MatchingActivity
        unmatched={[
            <TextBox>Condensation</TextBox>,
            <TextBox>Density</TextBox>,
        ]}
        feedback={{ success: 'Yep', fail: 'Nope' }}
        targetStyles={{
            opacity: 0.5,
            border: '5px red dashed',
            borderRadius: '20px',
            background: 'black',
            color: 'green',
        }}
    >
        <MatchTarget matches={[<TextBox>Air Temp</TextBox>]}>
            <Para>Measures the temperature of the air.</Para>
        </MatchTarget>
        <MatchTarget matches={[<TextBox>Humidity</TextBox>]}>
            <Para>Measures the amount of water vapour in the air.</Para>
        </MatchTarget>
    </MatchingActivity>
);

export const textHorizontal = () => (
    <MatchingActivity
        unmatched={[
            <TextBox>Condensation</TextBox>,
            <TextBox>Density</TextBox>,
        ]}
        feedback={{ success: 'Yep', fail: 'Nope' }}
        direction={{
            candidates: 'right',
            targets: 'right',
            matches: 'down',
        }}
    >
        <MatchTarget matches={[<TextBox>Air Temp</TextBox>]}>
            <Para>Measures the temperature of the air.</Para>
        </MatchTarget>
        <MatchTarget matches={[<TextBox>Humidity</TextBox>]}>
            <Para>Measures the amount of water vapour in the air.</Para>
        </MatchTarget>
    </MatchingActivity>
);

export const images = () => (
    <MatchingActivity
        unmatched={[<TextBox>Growth</TextBox>, <TextBox>Smell</TextBox>]}
        feedback={{ success: 'Yep', fail: 'Nope' }}
        direction={{
            candidates: 'right',
            targets: 'right',
            matches: 'right',
            sets: 'up',
        }}
    >
        <MatchTarget matches={[<TextBox>Air</TextBox>]}>
            <Image src={airSensor} tooltip="Stick thing" />
        </MatchTarget>
        <MatchTarget matches={[<TextBox>Moisture</TextBox>]}>
            <Image src={soilProbe} tooltip="Blob thing" />
        </MatchTarget>
        <MatchTarget matches={[<TextBox>Light</TextBox>]}>
            <Image src={egBase} tooltip="Box thing" />
        </MatchTarget>
    </MatchingActivity>
);

export const positioned = () => (
    <MatchingActivity
        feedback={{ success: 'Yep', fail: 'Nope' }}
        direction={{
            sets: 'down',
            candidates: 'down',
            targets: 'right',
        }}
        positions={{ candidates: { left: 0, top: 0 } }}
        background={<Image src={nzMap} tooltip="NZ Map" width={400} />}
    >
        <MatchTarget
            matches={[<TextBox maxWidth={12}>Tāmaki Makau Rau</TextBox>]}
            position={{ left: 150, top: 100 }}
        >
            <Para>Auckland</Para>
        </MatchTarget>
        <MatchTarget
            matches={[<TextBox maxWidth={12}>Te Whanganui a Tara</TextBox>]}
            position={{ left: 150, top: 240 }}
        >
            <Para>Wellington</Para>
        </MatchTarget>
        <MatchTarget
            matches={[<TextBox>Ōtautahi</TextBox>]}
            position={{ left: 110, top: 330 }}
        >
            <Para>Christchurch</Para>
        </MatchTarget>
        <MatchTarget
            matches={[<TextBox>Ōtepoti</TextBox>]}
            position={{ left: 70, top: 400 }}
        >
            <Para>Dunedin</Para>
        </MatchTarget>
    </MatchingActivity>
);

export const positionedExternalCandidates = () => (
    <MatchingActivity
        unmatched={[]}
        feedback={{ success: 'Yep', fail: 'Nope' }}
        direction={{
            sets: 'left',
            candidates: 'down',
            targets: 'right',
            matches: 'right',
        }}
        background={<Image src={nzMap} tooltip="NZ Map" width={400} />}
    >
        <MatchTarget
            matches={[<TextBox maxWidth={12}>Tāmaki Makau Rau</TextBox>]}
            position={{ left: 150, top: 100 }}
        >
            <Para>Auckland</Para>
        </MatchTarget>
        <MatchTarget
            matches={[<TextBox maxWidth={12}>Te Whanganui a Tara</TextBox>]}
            position={{ left: 150, top: 240 }}
        >
            <Para>Wellington</Para>
        </MatchTarget>
        <MatchTarget
            matches={[<TextBox>Ōtautahi</TextBox>]}
            position={{ left: 110, top: 330 }}
        >
            <Para>Christchurch</Para>
        </MatchTarget>
        <MatchTarget
            matches={[<TextBox>Ōtepoti</TextBox>]}
            position={{ left: 70, top: 400 }}
        >
            <Para>Dunedin</Para>
        </MatchTarget>
    </MatchingActivity>
);

export const multiChoiceSingleSelect = () => (
    <MatchingActivity
        unmatched={[
            <TextBox>8</TextBox>,
            <TextBox>2</TextBox>,
            <TextBox>6</TextBox>,
            <TextBox>42</TextBox>,
        ]}
        direction={{
            sets: 'down',
            candidates: 'left',
            targets: 'right',
            matches: 'left',
        }}
        feedback={{ success: 'Yep', fail: 'Nope' }}
        randomOrder={{ candidates: true }}
    >
        <MatchTarget matches={[<TextBox>4</TextBox>]}>
            <Para>2 x 2</Para>
        </MatchTarget>
    </MatchingActivity>
);

export const multiChoiceMultiSelect = () => (
    <MatchingActivity
        unmatched={[
            <TextBox>6</TextBox>,
            <TextBox>2+3</TextBox>,
            <TextBox>1x2</TextBox>,
        ]}
        direction={{
            sets: 'down',
            candidates: 'left',
            targets: 'right',
            matches: 'left',
        }}
        feedback={{ success: 'Yep', fail: 'Nope' }}
        randomOrder={{ candidates: true }}
    >
        <MatchTarget
            matches={[
                <TextBox>2x2</TextBox>,
                <TextBox>2+2</TextBox>,
                <TextBox>3+1</TextBox>,
            ]}
        >
            <Para>4</Para>
        </MatchTarget>
    </MatchingActivity>
);

export const sets = () => (
    <MatchingActivity
        unmatched={[<TextBox>Odd One Out</TextBox>]}
        direction={{
            sets: 'down',
            candidates: 'left',
            targets: 'right',
            matches: 'left',
        }}
        feedback={{ success: 'Yep', fail: 'Nope' }}
        randomOrder={{ candidates: true }}
        mode="sets"
    >
        <MatchTarget
            matches={[<TextBox>Red</TextBox>, <TextBox>Yellow</TextBox>]}
        >
            <Para>Colours</Para>
        </MatchTarget>
        <MatchTarget matches={[<TextBox>6</TextBox>, <TextBox>1</TextBox>]}>
            <Para>Numbers</Para>
        </MatchTarget>
        <MatchTarget matches={[<TextBox>Triangle</TextBox>]}>
            <Para>Shapes</Para>
        </MatchTarget>
    </MatchingActivity>
);

export const setsWithSize = () => (
    <MatchingActivity
        unmatched={[<TextBox>Odd One Out</TextBox>]}
        direction={{
            sets: 'down',
            candidates: 'left',
            targets: 'right',
        }}
        background={
            <Image
                src={datataonga}
                tooltip="Data as taonga; drag and drop"
                width={800}
            />
        }
        feedback={{
            success: 'Kei te pai, well done!',
            fail: 'Not quite, try again!',
        }}
        randomOrder={{ candidates: true }}
        mode="sets"
        targetStyles={{
            width: 220,
            height: 180,
        }}
    >
        <MatchTarget
            matches={[<TextBox>Kokako</TextBox>, <TextBox>Convovulus</TextBox>]}
            position={{ left: 26, top: 180 }}
        ></MatchTarget>
        <MatchTarget
            matches={[<TextBox>Tiki</TextBox>, <TextBox>Jandal</TextBox>]}
            position={{ left: 289, top: 180 }}
        ></MatchTarget>
        <MatchTarget
            matches={[<TextBox>Christmas Lunch</TextBox>]}
            position={{ left: 550, top: 180 }}
            styles={{ width: 200, height: 25 }}
        ></MatchTarget>
    </MatchingActivity>
);

addDecorator((storyFn) => (
    <ActivityCompletionContextProvider>
        {storyFn()}
    </ActivityCompletionContextProvider>
));

export default {
    component: MatchingActivity,
    title: 'MatchingActivity',
};
