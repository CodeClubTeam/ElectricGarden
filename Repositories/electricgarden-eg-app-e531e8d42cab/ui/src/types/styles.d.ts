import 'styled-components/macro';

declare module 'styled-components' {
    export interface DefaultTheme {
        active: string;
        inactive: string;
        fg: string;
        bg: string;
        cover: {
            bg: string;
        };
        section: {
            bg: string;
            fg: string;
        };
        btn: {
            borderRadius: string;
            primary: {
                fg: string;
                bg: string;
            };
            secondary: {
                fg: string;
                bg: string;
            };
            danger: {
                fg: string;
                bg: string;
            };
            disabled: {
                fg: string;
                bg: string;
            };
        };
        scheme: {
            primary: {
                light: string;
            };
            secondary: {
                light: string;
            };
        };
        greys: {
            mid: string;
            three: string;
            four: string;
            six: string;
        };
        trafficLights: {
            red: string;
            green: string;
            orange: string;
        };
    }
}
