import React from 'react';
import styled from 'styled-components/macro';
import introSvgPath from '../../../../static/EG-landing.gif';

import { useCanAddGrowable } from '../../hooks';
import { GrowablesIntroAdd } from './GrowablesIntroAdd';

const Container = styled.div`
    max-width: 40em;
    margin: 0 auto;
`;

const IntroGraphicContainer = styled.div`
    padding-top: 2em;
    img {
        width: 100%;
    }
`;

const IntroTextContainer = styled.div`
    border: solid 2px;
    border-color: #2ed03c;
    border-radius: 3px;
    background: linear-gradient(
        242.29deg,
        rgba(113, 255, 110, 0.234) 13.16%,
        rgba(0, 168, 181, 0.132) 86.17%
    );
    text-align: center;
    color: black;
    padding: 1em;
    margin-top: 2em;
`;

export const GrowablesIntro: React.FC = () => {
    const canAddGrowable = useCanAddGrowable();
    return (
        <Container>
            <IntroTextContainer>
                <p style={{ fontWeight: 1000, fontSize: '16px' }}>
                    Add your garden and get ready to teach your class Digital
                    Technology
                </p>
                <p style={{ marginBottom: 0 }}>
                    Spinach, Pukeu or Figulaau, no matter what you call it,
                    <br />
                    the Electric Garden can help you grow it!
                </p>
            </IntroTextContainer>
            <IntroGraphicContainer>
                <img src={introSvgPath} alt="Intro" />
            </IntroGraphicContainer>
            {canAddGrowable && <GrowablesIntroAdd />}
        </Container>
    );
};
