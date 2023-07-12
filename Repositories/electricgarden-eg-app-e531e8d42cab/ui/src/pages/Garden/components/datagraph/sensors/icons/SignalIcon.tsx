import React from 'react';
import { TrafficLightIndicator } from '../../selectors';
import { theme } from '../../../../../../theme';

type Props = {
    indicator: TrafficLightIndicator;
};

const TopBar: React.FC<React.SVGProps<SVGPathElement>> = (props) => (
    <path
        d="M9 24L11 26C15.97 21.03 24.03 21.03 29 26L31 24C24.93 17.93 15.08 17.93 9 24Z"
        {...props}
    />
);

const MiddleBar: React.FC<React.SVGProps<SVGPathElement>> = (props) => (
    <path
        d="M13 27.895L15 29.895C16.3265 28.5696 18.1249 27.8251 20 27.8251C21.8751 27.8251 23.6735 28.5696 25 29.895L27 27.895C23.14 24.035 16.87 24.035 13 27.895Z"
        {...props}
    />
);

const BottomBar: React.FC<React.SVGProps<SVGPathElement>> = (props) => (
    <path
        d="M20 35.245L17 32.245C17.3936 31.8503 17.8612 31.5372 18.376 31.3236C18.8908 31.11 19.4426 31 20 31C20.5574 31 21.1092 31.11 21.624 31.3236C22.1388 31.5372 22.6064 31.8503 23 32.245L20 35.245Z"
        {...props}
    />
);

export const SignalIcon: React.FC<Props> = ({ indicator, ...props }) => (
    <svg
        width="34"
        height="49"
        viewBox="0 0 34 49"
        fill={theme.trafficLights[indicator]}
        {...props}
    >
        <path d="M27.4963 9.01878H12.3706C9.02067 9.01878 6.27953 11.7599 6.27953 15.1099V35.2019C4.99054 35.2035 3.52442 35.2061 2.6826 35.2087L2.68637 35.1819V11.0865L2.2343 1.47178V0.416949C2.02507 0.208097 1.66931 0 1.34338 0C1.09147 0 0.816902 0.0524963 0.452827 0.416949V1.47178L0 11.0865V39.4798L1.32865 39.5648L2.00052 39.5455C2.00543 39.5467 2.00921 39.5497 2.01412 39.5508C2.03905 39.5561 4.3519 39.5595 6.27991 39.5618V42.1409C6.27991 45.4908 9.02105 48.232 12.371 48.232H27.4967C30.8466 48.232 33.5878 45.4908 33.5878 42.1409V15.1099C33.5874 11.7599 30.8466 9.01878 27.4963 9.01878Z" />

        <TopBar fill="white" opacity={0.8} />
        <MiddleBar fill="white" opacity={0.8} />
        <BottomBar fill="white" opacity={0.8} />

        {indicator !== 'green' && (
            <line
                x1="12"
                y1="18"
                x2="28"
                y2="35"
                stroke="white"
                strokeWidth="3"
                opacity={0.8}
            />
        )}
    </svg>
);
