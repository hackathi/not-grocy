import { nextTick } from 'vue';
import { createI18n, I18n } from 'vue-i18n';

export const ALL_LANGS = ['cs', 'da', 'de', 'el_GR', 'en', 'en_GB', 'es', 'fi', 'fr', 'he_IL', 'hu', 'it', 'ja', 'ko_KR', 'nl', 'no', 'pl', 'pt_BR', 'pt_PT', 'ru', 'sk_SK', 'sv_SE', 'ta', 'tr', 'zh_CN', 'zh_TW'];

// Reason: the type just isn't really there. It's any in the repo.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setupI18n(options: any = { locale: 'en' }): I18n<unknown, unknown, unknown, false>
{
	// force "format fallback messages"
	options.formatFallbackMessages = true;
	options.legacy = false;
	options.globalInjection = true;

	const i18n = createI18n(options);
	setI18nLanguage(i18n, options.locale);
	return i18n;
}

export function setI18nLanguage(i18n: I18n<unknown, unknown, unknown, false>, locale: string) : void
{
	i18n.global.locale.value = locale;
	/**
	 * NOTE:
	 * If you need to specify the language setting for headers, such as the `fetch` API, set it here.
	 * The following is an example for axios.
	 *
	 * axios.defaults.headers.common['Accept-Language'] = locale
	 */
	document.querySelector('html')?.setAttribute('lang', locale);
}

export async function loadLocaleMessages(i18n : I18n<unknown, unknown, unknown, false>, locale : string) : Promise<void>
{
	// load locale messages with dynamic import
	// this gets 1:1 translated into a network call, so....
	const messages = await (await fetch(`/locale/${locale}.json`)).json();

	// set locale and locale message
	i18n.global.setLocaleMessage(locale, messages);

	return nextTick();
}