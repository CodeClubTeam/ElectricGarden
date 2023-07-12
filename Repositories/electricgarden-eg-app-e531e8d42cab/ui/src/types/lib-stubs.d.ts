declare module 'react-intercom';
declare module 'remark-react';
declare module 'remark-frontmatter';
declare module 'remark-parse-yaml';
declare module 'remark-html';
declare module 'unist-util-visit';

declare module 'victory-chart' {
    import victory = require('victory');
    export = victory.VictoryChart;
}
declare module 'victory-zoom-container' {
    import victory = require('victory');
    export = victory.VictoryZoomContainer;
}
declare module 'victory-axis' {
    import victory = require('victory');
    export = victory.VictoryAxis;
}
declare module 'victory-scatter' {
    import victory = require('victory');
    export = victory.VictoryScatter;
}
declare module 'victory-line' {
    import victory = require('victory');
    export = victory.VictoryLine;
}

declare module '@mdx-js/react' {
    import * as React from 'react';
    type ComponentType =
        | 'p'
        | 'h1'
        | 'h2'
        | 'h3'
        | 'h4'
        | 'h5'
        | 'h6'
        | 'thematicBreak'
        | 'blockquote'
        | 'ul'
        | 'ol'
        | 'li'
        | 'table'
        | 'tr'
        | 'td'
        | 'pre'
        | 'code'
        | 'em'
        | 'strong'
        | 'delete'
        | 'inlineCode'
        | 'hr'
        | 'a'
        | 'img'
        | 'wrapper';
    export type Components = {
        [key in ComponentType]?: React.ComponentType<{
            children: React.ReactNode;
        }>;
    };
    export interface MDXProviderProps {
        children: React.ReactNode;
        components: Components;
    }
    export class MDXProvider extends React.Component<MDXProviderProps> {}
}
