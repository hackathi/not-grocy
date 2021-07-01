import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import eslint from '@rollup/plugin-eslint';
import babel from '@rollup/plugin-babel';
import postcss from 'rollup-plugin-postcss';
import replace from '@rollup/plugin-replace';

import path from 'path';


const env = process.env.NODE_ENV || 'development';

export default {
	input: [
		'js/grocy.js'
	],
	output: {
		dir: 'public/dist',
		format: 'umd',
		name: 'grocy',
		sourcemap: true,
		globals: {
			jquery: '$'
		},
	},
	plugins: [
		resolve({ browser: true, preferBuiltins: true }),
		commonjs(),
		babel({
			babelHelpers: 'bundled',
			exclude: 'node_modules/**'
		}),
		eslint({
			fix: true,
		}),
		postcss({ // will load postcss.config.js
			extract: path.resolve('public/dist/grocy-imports.css'),
			minimize: env !== 'development',
		}),
		replace({
			'process.env.NODE_ENV': JSON.stringify(env),
			preventAssignment: true,
		})
	]
};
