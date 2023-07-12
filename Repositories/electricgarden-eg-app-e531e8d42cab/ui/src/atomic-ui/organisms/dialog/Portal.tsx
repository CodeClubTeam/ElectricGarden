import { createPortal } from 'react-dom';

export type PortalProps = {
    rootId?: string;
};

export const Portal: React.FC<PortalProps> = ({ children, rootId }) => {
    const root = rootId ? document.getElementById(rootId) : document.body;
    if (!root) {
        throw new Error(`Could not find element with id for portal ${rootId}.`);
    }
    return createPortal(children, root);
};
