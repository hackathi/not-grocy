/* eslint-disable no-undef */
import vue from 'rollup-plugin-vue';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import postcss from 'rollup-plugin-postcss';
import replace from '@rollup/plugin-replace';
import typescript from 'rollup-plugin-typescript2';
import json from '@rollup/plugin-json';

import path from 'path';


const env = process.env.NODE_ENV || 'development';

export default {
	input: [
		'js/main.ts'
	],
	output: {
		dir: 'public/dist',
		format: 'umd',
		name: 'VueGrocy',
		sourcemap: true,
		globals: {
			quill: 'Quill'
		}
	},
	plugins: [
		resolve({ browser: true, preferBuiltins: true }),
		json(),
		vue({
			target: "browser"
		}),
		typescript(),
		commonjs(),
		babel({
			babelHelpers: 'bundled',
			exclude: 'node_modules/**'
		}),
		postcss({ // will load postcss.config.js
			extract: path.resolve('public/dist/app.css'),
			minimize: env !== 'development',
		}),
		replace({
			'process.env.NODE_ENV': JSON.stringify(env),
			preventAssignment: true,
		})
	]
};
