declare module '*.jpg';
declare module '*.png';
declare module '*.svg';
declare module '*.csv';
declare module '*.md';
declare module '*.mdx';
declare module '*.module.scss' {
    const classes: { [key: string]: string };
    export default classes;
}
