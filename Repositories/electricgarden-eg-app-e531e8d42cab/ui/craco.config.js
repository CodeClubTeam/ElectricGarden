const path = require('path');
const { loaderByName, addBeforeLoader, getLoaders } = require('@craco/craco');
const getCacheIdentifier = require('react-dev-utils/getCacheIdentifier');

module.exports = {
    webpack: {
        configure: (webpackConfig, { env }) => {
            const isEnvDevelopment = env === 'development';
            const isEnvProduction = env === 'production';

            // NOTE: .env not supported here as not passed through
            const shouldUseReactRefresh = process.env.FAST_REFRESH !== 'false';
            // also from CRA 4 https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/config/webpack.config.js
            const hasJsxRuntime = (() => {
                if (process.env.DISABLE_NEW_JSX_TRANSFORM === 'true') {
                    return false;
                }

                try {
                    require.resolve('react/jsx-runtime');
                    return true;
                } catch (e) {
                    return false;
                }
            })();

            // turn off esmodules which breaks require() needed for resolving images in markdown
            const { matches: fileLoaders } = getLoaders(
                webpackConfig,
                loaderByName('file-loader'),
            );
            for (const loader of fileLoaders) {
                loader.loader.options.esModule = false;
            }
            const { matches: urlLoaders } = getLoaders(
                webpackConfig,
                loaderByName('url-loader'),
            );
            for (const loader of urlLoaders) {
                loader.loader.options.esModule = false;
            }

            addBeforeLoader(webpackConfig, loaderByName('babel-loader'), {
                test: /\.mdx?$/,
                use: [
                    {
                        loader: require.resolve('babel-loader'),
                        options: {
                            // NOTE: COPY PASTA from CRA 4 react-scripts config just to make sure it's the same (for now anyway)
                            customize: require.resolve(
                                'babel-preset-react-app/webpack-overrides',
                            ),
                            presets: [
                                [
                                    require.resolve('babel-preset-react-app'),
                                    {
                                        runtime: hasJsxRuntime
                                            ? 'automatic'
                                            : 'classic',
                                    },
                                ],
                            ],
                            // @remove-on-eject-begin
                            babelrc: false,
                            configFile: false,
                            // Make sure we have a unique cache identifier, erring on the
                            // side of caution.
                            // We remove this when the user ejects because the default
                            // is sane and uses Babel options. Instead of options, we use
                            // the react-scripts and babel-preset-react-app versions.
                            cacheIdentifier: getCacheIdentifier(
                                isEnvProduction
                                    ? 'production'
                                    : isEnvDevelopment && 'development',
                                [
                                    'babel-plugin-named-asset-import',
                                    'babel-preset-react-app',
                                    'react-dev-utils',
                                    'react-scripts',
                                ],
                            ),
                            // @remove-on-eject-end
                            plugins: [
                                [
                                    require.resolve(
                                        'babel-plugin-named-asset-import',
                                    ),
                                    {
                                        loaderMap: {
                                            svg: {
                                                ReactComponent:
                                                    '@svgr/webpack?-svgo,+titleProp,+ref![path]',
                                            },
                                        },
                                    },
                                ],
                                isEnvDevelopment &&
                                    shouldUseReactRefresh &&
                                    require.resolve('react-refresh/babel'),
                            ].filter(Boolean),
                            // This is a feature of `babel-loader` for webpack (not Babel itself).
                            // It enables caching results in ./node_modules/.cache/babel-loader/
                            // directory for faster rebuilds.
                            cacheDirectory: true,
                            // See #6846 for context on why cacheCompression is disabled
                            cacheCompression: false,
                            compact: isEnvProduction,
                        },
                    },
                    path.resolve(__dirname, './build-plugins/mdx-image-loader'),
                    {
                        loader: require.resolve('@mdx-js/loader'),
                        options: {
                            remarkPlugins: [
                                [require('remark-frontmatter'), ['yaml']],
                                require('remark-sectionize'),
                                require('remark-unwrap-images'),
                                require('./build-plugins/remark-heading-ids'),
                                require('remark-slug'),
                            ],
                        },
                    },
                ],
            });
            const { extensions } = webpackConfig.resolve;
            extensions.push('.mdx');
            extensions.push('.md');

            return webpackConfig;
        },
    },
};
