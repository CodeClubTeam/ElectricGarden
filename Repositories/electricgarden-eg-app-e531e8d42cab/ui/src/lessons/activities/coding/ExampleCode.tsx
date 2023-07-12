import React from 'react';
import {
    Light as SyntaxHighlighter,
    SyntaxHighlighterProps,
} from 'react-syntax-highlighter';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import { xcode } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import styled from 'styled-components/macro';

SyntaxHighlighter.registerLanguage('python', python);

type Props = Pick<
    SyntaxHighlighterProps,
    'showLineNumbers' | 'startingLineNumber'
>;

const Container = styled.div``;

export const ExampleCode: React.FC<Props> = ({ children, ...props }) => (
    <Container>
    <SyntaxHighlighter language="python" style={xcode} customStyle={{margin: "0px", backgroundColor: "#e6e6e6", borderRadius: "5px"}} {...props}>
        {children}
    </SyntaxHighlighter>
    </Container>
);
