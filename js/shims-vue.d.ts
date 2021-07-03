/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
declare module '*.vue' {
	import type { DefineComponent } from 'vue';
	const component: DefineComponent<{}, {}, any>;
	export default component;
}

declare module 'primevue/toastservice/toastservice.esm' {
	import { Plugin } from 'vue';
	export const install: Plugin;
}