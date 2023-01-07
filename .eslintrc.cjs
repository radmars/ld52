module.exports = {
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "plugin:@typescript-eslint/strict",
    ],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    parserOptions: {
        project: "./tsconfig.json",
    },
    root: true,
    rules: {
        "@typescript-eslint/explicit-function-return-type": "error",
        indent: ["error", 4],
        semi: ["error", "always"],
        "brace-style": ["error", "stroustrup"],
    },
};
