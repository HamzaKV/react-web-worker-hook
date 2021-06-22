module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "root": true,
    "parser": "@typescript-eslint/parser",
    "plugins": ["@typescript-eslint", "react"],
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    "rules": {
        "@typescript-eslint/no-explicit-any": 0,
        "quotes": [
            2,
            "single",
            {
                "avoidEscape": true,
                "allowTemplateLiterals": true
            }
        ],
        "indent": ["error", 4, { "SwitchCase": 1 }],
        "max-len": ["error", { "code": 80, "ignoreComments": true }],
        "linebreak-style": 0,
        "no-extra-boolean-cast": "off",
        "keyword-spacing": ["error", { "before": true, "after": true }],
        "semi": ["error", "always"]
    }
};
