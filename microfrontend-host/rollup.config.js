import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import html from "@rollup/plugin-html";
import copy from "rollup-plugin-copy";
import {terser} from "rollup-plugin-terser";
import template from "./html-template/html-template";
import { nodeResolve } from '@rollup/plugin-node-resolve';


const EXTENSIONS = [".js", ".jsx", ".ts", ".tsx"];

export default {
    external: [
        "react",
        "react-dom",
        "react-router-dom",
        "history",
    ],
    input: {
        main: "src/index.tsx",
        "react-dom": "node_modules/react-dom/cjs/react-dom.production.min.js",
        react: "node_modules/react/cjs/react.production.min.js",
        "react-router-dom": "node_modules/react-router-dom/react-router-dom.production.min.js",
        history: "node_modules/history/index.js",
    },
    output: {
        dir: "build",
        entryFileNames: "[name].[hash].js",
        format: "es",
    },

    plugins: [
        commonjs({
            extensions: EXTENSIONS,
            include: /node_modules/,
            transformMixedEsModules: true

        }),
        nodeResolve(),
        babel({
            extensions: EXTENSIONS,
            babelrc: false,
            babelHelpers: "inline",
            presets: [
                [
                    "@babel/preset-env",
                    {
                        targets: {
                            esmodules: true,
                        },
                    },
                ],
                "@babel/preset-react",
            ],
            plugins: [
                [
                    "@babel/plugin-transform-typescript",
                    {
                        isTSX: true,
                        allowNamespaces: true,
                        allowDeclareFields: true,
                        onlyRemoveTypeImports: true,
                    },
                ],
                "@babel/plugin-proposal-class-properties",
                "transform-inline-environment-variables",
            ],
        }),
        terser({
            compress: {
                drop_console: true,
            },
        }),
        copy({
            targets: [
                {
                    src: "node_modules/es-module-shims/dist/es-module-shims.min.js",
                    dest: "build",
                },
            ],
        }),
        html({
            title: "Demo",
            publicPath: "",
            fileName: "index.html",
            template,
        }),
    ],
};
