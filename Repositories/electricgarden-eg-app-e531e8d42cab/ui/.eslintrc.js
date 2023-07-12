const path = require('path');

module.exports = {
    extends: 'react-app',
    env: {
        browser: true,
    },
    parserOptions: {
        project: path.resolve(__dirname, './tsconfig.json'),
        ecmaFeatures: {
            jsx: true,
        },
    },
    rules: {
        'no-restricted-imports': [
            'error',
            {
                paths: [
                    {
                        name: 'styled-components',
                        message: 'Please import from styled-components/macro.',
                    },
                    {
                        name: 'lodash',
                        message: 'Please import from lodash-es.',
                    },
                ],
                patterns: ['!styled-components/macro'],
            },
        ],
        'import/no-anonymous-default-export': 0,
    },
    ignorePatterns: ['*.js', 'scripts/**/*'],
};
