const tsPlugin = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");

module.exports = [
    "eslint:recommended",
    {
        files: ["src-ts/**/*.ts"],
        languageOptions: {
          parser: tsParser  
        },
        plugins: {
            "@typescript-eslint": tsPlugin
        },
        rules: {
            ...tsPlugin.configs["recommended"].rules,
            ...tsPlugin.configs["eslint-recommended"].rules
        }  
    },
    {
        rules: {
            "no-redeclare": "off"
        }
    }
];