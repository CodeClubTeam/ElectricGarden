import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import styled from 'styled-components/macro';

import { Button, PageContent, PageFooter } from '../../../atomic-ui';
import { theme } from '../../../theme';
import { GiantsListTerm4, GiantsListTerm1 } from './contents/GiantsList';
import { ContentsContentContainer, LessonsPageHeader } from './layout';

export const GiantsHome: React.FC = () => {
    const [term1, setTerm1] = useState(true);
    const [term4, setTerm4] = useState(false);
    const handleClick = () => {
        setTerm1(!term1);
        setTerm4(!term4);
    };

    const SwitchButton = styled(Button)`
        height: 40px;
        border-radius: 50%;
        margin-top: 1.6em;
        margin-right: ${(props) => (props.left ? '-560px' : '560px')};
        position: absolute;
        width: 40px;
        background-color: ${(props) => (props.active ? '#2ED03C' : 'grey')};
        pointer-events: ${(props) => (props.active ? '' : 'none')};
    `;

    return (
        <>
            <LessonsPageHeader>
                <h1>GIANTS Resources</h1>
            </LessonsPageHeader>
            <PageContent>
                <ContentsContentContainer>
                    {term1 && (
                        <>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                }}
                            >
                                <h1
                                    style={{
                                        padding: '1em',
                                        color: theme.active,
                                    }}
                                >
                                    Term 4 Resources
                                </h1>
                                <SwitchButton
                                    left={term1}
                                    active={true}
                                    onClick={handleClick}
                                >
                                    <FontAwesomeIcon icon={faCaretRight} />
                                </SwitchButton>
                                <SwitchButton
                                    left={!term1}
                                    onClick={handleClick}
                                >
                                    <FontAwesomeIcon icon={faCaretLeft} />
                                </SwitchButton>
                            </div>
                            <GiantsListTerm4 />
                        </>
                    )}
                    {term4 && (
                        <>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                }}
                            >
                                <h1
                                    style={{
                                        padding: '1em',
                                        color: theme.active,
                                    }}
                                >
                                    Term 1 Resources
                                </h1>
                                <SwitchButton
                                    left={term4}
                                    onClick={handleClick}
                                >
                                    <FontAwesomeIcon icon={faCaretRight} />
                                </SwitchButton>
                                <SwitchButton
                                    left={!term4}
                                    active={true}
                                    onClick={handleClick}
                                >
                                    <FontAwesomeIcon icon={faCaretLeft} />
                                </SwitchButton>
                            </div>
                            <GiantsListTerm1 />
                        </>
                    )}
                </ContentsContentContainer>
            </PageContent>
            <PageFooter />
        </>
    );
};
