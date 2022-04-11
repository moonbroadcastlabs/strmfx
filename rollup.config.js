import commonjs from "@rollup/plugin-commonjs";
import html from "@rollup/plugin-html";
import nodeResolve from "@rollup/plugin-node-resolve";
import run from "@rollup/plugin-run";
import strip from "@rollup/plugin-strip";
import typescript from "@rollup/plugin-typescript";
import styles from "rollup-plugin-styles";
import { terser } from "rollup-plugin-terser";

const env = process.env.NODE_ENV;

const plugins = {
  common() {
    return [nodeResolve(), commonjs()];
  },
  ui_common() {
    return [styles(), typescript(), ...this.common(), html()];
  },
  ui() {
    if (env === "production") {
      return [...this.ui_common(), terser(), strip()];
    }
    return this.ui_common();
  },
  server_common() {
    return [
      typescript(),
    ];
  },
  server() {
    if (env === "development") {
      return [...this.server_common(), run({ allowRestarts: true })];
    }
    return this.server_common();
  },
};

export default [
  {
    input: "src/ui/broadcaster-view/index.ts",
    output: {
      file: "dist/static/bc/index.js",
      format: "iife",
    },
    plugins: plugins.ui(),
  },
  {
    input: "src/ui/controlpanel-view/index.ts",
    output: {
      file: "dist/static/cp/index.js",
      format: "iife",
    },
    plugins: plugins.ui(),
  },
  {
    external: [
        "express",
        "http",
        "url",
        "ws"
    ],
    input: "src/server/index.ts",
    output: {
      file: "dist/server.js",
      format: "cjs",
    },
    plugins: plugins.server(),
  },
];
