import React from 'react';
import { useQuery } from 'react-query';
import { getRequiredSetting } from '../../../utils';
import { HttpResponseError } from '../../../data/server/HttpResponseError';

const useMobileApi = () => {
    return {
        getInstallInfo: async (serial: string) => {
            const response = await fetch(
                `${getRequiredSetting(
                    'MOBILE_API',
                )}/device-installations-by-serial/${serial}`,
                {
                    redirect: 'follow',
                },
            );
            if (!response.ok) {
                throw new HttpResponseError(
                    response,
                    `Error fetching from mobile api`,
                );
            }
            return response.json() as Promise<{ id: number }>;
        },
    };
};

type Props = {
    serial: string;
};

export const SensorMobileDetail = ({ serial }: Props) => {
    const api = useMobileApi();
    const [notFound, setNotFound] = React.useState(false);

    const { isFetched, data, error } = useQuery(
        ['getInstallInfo', serial],
        () => api.getInstallInfo(serial),
        {
            onError: (error) => {
                if (
                    error instanceof HttpResponseError &&
                    error.response.status !== 404
                ) {
                    console.error(
                        `Non 404 response from kiosk app looking up ${serial} device`,
                    );
                }
                // ignoring error for less noise for now.
                setNotFound(true);
            },
            retry: false,
        },
    );

    if (notFound) {
        return null;
    }

    if (!isFetched || !data) {
        return <p>Checking for mobile app data...</p>;
    }

    if (error) {
        return null;
    }

    const qrCodeUrl = `${getRequiredSetting('MOBILE_UI')}/${data.id}`;
    const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
        qrCodeUrl,
    )}`;

    return (
        <div>
            <p style={{ fontWeight: 1000, fontSize: '16px' }}>
                Mobile Graph Access:
            </p>
            <p>
                <a href={qrCodeUrl} target="_blank" rel="noopener noreferrer">
                    {qrCodeUrl}
                </a>
            </p>
            <p>
                <a
                    href={qrCodeImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <img src={qrCodeImageUrl} alt="QR Code" />
                </a>
            </p>
        </div>
    );
};
