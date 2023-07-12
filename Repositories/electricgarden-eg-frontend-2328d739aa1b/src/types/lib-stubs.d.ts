declare module 'react-intercom';
declare module 'react-moment-proptypes';

declare module 'react-moment-object' {
    import momentPropTypes = require('react-moment-proptypes');
    export = momentPropTypes.momentObj;
}
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
