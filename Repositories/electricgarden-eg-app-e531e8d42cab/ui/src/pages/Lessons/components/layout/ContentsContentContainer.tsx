import styled from 'styled-components/macro';

import { ContentContainer } from './ContentContainer';

export const ContentsContentContainer = styled(ContentContainer)`
    --content-item-width: 400px;
    @media (max-width: 768px) {
        max-width: calc(var(--content-item-width) + 5px); /* single column */
    }
    @media (min-width: 769px) {
        max-width: calc(
            var(--content-item-width) * 2 + 56px
        ); /* two column; bit hacky */
    }
`;
