import styled from 'styled-components/macro';

export const Select = styled.select`
    display: block;
    width: 100%;
    height: calc(1.5em + 0.75rem + 2px);
    padding: 0.375rem 0.75rem;

    :disabled {
        background-color: #e9ecef;
        opacity: 1;
    }
`;
