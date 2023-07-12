import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import {
    FontAwesomeIcon,
    Props as IconProps,
} from '@fortawesome/react-fontawesome';
import React from 'react';

type Props = { message?: string } & Pick<IconProps, 'size'>;

export const Loading: React.FC<Props> = ({ children, message, ...rest }) => (
    <>
        <FontAwesomeIcon icon={faSpinner} spin {...rest} />
        {children || <> {message}</>}
    </>
);
