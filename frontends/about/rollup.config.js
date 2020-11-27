import babel from "@rollup/plugin-babel";
import {terser} from "rollup-plugin-terser";

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
    },
    output: {
        dir: "build",
        entryFileNames: "[name].[hash].js",
        format: "es",
    },

    plugins: [
        babel({
            extensions: EXTENSIONS,
            babelrc: false,
            babelHelpers: "inline",
            presets: [
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
            ],
        }),
        terser({
            compress: {
                drop_console: true,
            },
        }),
    ],
};
