import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components/macro';

// modified from https://codesandbox.io/s/7kxj9p9qm0?from-embed

import { Portal, PortalProps } from './Portal';

const stopPropagation = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
    e.stopPropagation();

const callAll = (...fns: any[]) => (...args: any[]) =>
    fns.forEach((fn) => fn && fn(...args));

export const useDialog = (rootId?: string) => {
    const [on, setOn] = useState(false);
    const show = () => setOn(true);
    const hide = () => setOn(false);
    const toggle = () => setOn(!on);

    const getToggleProps = (props: ButtonProps = {}) => ({
        'aria-controls': 'target',
        'aria-expanded': Boolean(on),
        ...props,
        onClick: callAll(props.onClick, toggle),
    });

    const getContainerProps = (props: ContainerProps = {}) => ({
        ...props,
        rootId,
        onClick: callAll(props.onClick, toggle),
        onKeyDown: callAll(
            props.onKeyDown,
            ({ keyCode }: React.KeyboardEvent<HTMLDivElement>) =>
                keyCode === 27 && hide(),
        ),
    });

    return {
        on,
        show,
        hide,
        toggle,
        getToggleProps,
        getContainerProps,
    };
};

type ButtonProps = React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
>;

type DivProps = React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
>;

type OverlayProps = DivProps;

const Overlay = styled.div`
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1050; /* bootstrap modal is 1040 so we need to go higher to overlay overtop */
`;

const Content = styled.div`
    width: 480px;
    max-width: 100%;
    background-color: white;
    border-radius: 8px;
`;

type ContainerProps = PortalProps & OverlayProps;

const Container: React.FC<ContainerProps> = (props) => {
    const overlayEl = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (overlayEl !== null && overlayEl.current !== null) {
            overlayEl.current.focus();
        }
    });

    return (
        <Portal rootId={props.rootId}>
            <Overlay
                {...props}
                ref={overlayEl}
                aria-modal="true"
                tabIndex={-1}
                role="dialog"
            >
                <Content onClick={stopPropagation}>{props.children}</Content>
            </Overlay>
        </Portal>
    );
};

const Header = styled.header`
    padding: 1rem;
    border-bottom: 1px solid #eee;
`;

const Body = styled.div`
    padding: 1rem;
`;

const Footer = styled.footer`
    padding: 1rem;
    border-top: 1px solid #eee;
`;

export const Dialog = {
    Container,
    Header,
    Body,
    Footer,
};
