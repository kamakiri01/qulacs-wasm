// using Flat Config

const tsPlugin = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const globals = require("globals");

module.exports = [
    "eslint:recommended",
    {
        rules: {
            "no-redeclare": "off"
        }
    },
    {
        files: ["src-ts/**/*.ts", "test/**/*.ts"],
        languageOptions: {
            parser: tsParser,
            globals: {
                ...globals.node,
                "WebAssembly": false,
                "EmscriptenWasm": false
            }
        },
        plugins: {
            "@typescript-eslint": tsPlugin
        },
        rules: {
            ...tsPlugin.configs["recommended"].rules,
            ...tsPlugin.configs["eslint-recommended"].rules,
            "@typescript-eslint/no-empty-interface": "off",
            "@typescript-eslint/no-var-requires": "off",
            "@typescript-eslint/no-misused-new": "off"
        }
    },
    {
        files: ["test/**/*.ts"],
        languageOptions: {
            parser: tsParser,
            globals: {
                it: "readonly",
                describe:"readonly",
                expect: "readonly",
                beforeEach: "readonly"
            }
        },
    }
];
