import { nextTick } from 'vue';
import { createI18n, I18n } from 'vue-i18n';
import { Store } from 'vuex';
import { RootState } from './store/interfaces';

export const ALL_LANGS = ['cs', 'da', 'de', 'el_GR', 'en', 'en_GB', 'es', 'fi', 'fr', 'he_IL', 'hu', 'it', 'ja', 'ko_KR', 'nl', 'no', 'pl', 'pt_BR', 'pt_PT', 'ru', 'sk_SK', 'sv_SE', 'ta', 'tr', 'zh_CN', 'zh_TW'];

// Reason: the type just isn't really there. It's any in the repo.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setupI18n(options: any = { locale: 'en' }): I18n<unknown, unknown, unknown, false>
{
	// force "format fallback messages"
	options.fallbackFormat = true;
	options.legacy = false;
	options.globalInjection = true;
	options.fallbackLocale = ['en', "root"];
	options.fallbackWarn = false;
	options.missing = (locale :string, key :string) =>
	{
		// en is integrated into code.
		if (locale == "en" || locale == "root") return;

		console.warn(`i18n: (${locale}) Missing key '${key}'.`);
	};

	const i18n = createI18n(options);
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

export async function loadLocaleMessages(i18n : I18n<unknown, unknown, unknown, false>, locale: string, store: Store<RootState>) : Promise<void>
{
	// load locale messages with dynamic import
	// this gets 1:1 translated into a network call, so....
	const messages = await (await fetch(`/locale/${locale}.json`)).json();

	if (messages.numberFormats !== undefined)
	{
		if (messages.numberFormats.currency !== undefined)
		{
			messages.numberFormats.currency.currency = store.state.Settings.Currency;
			messages.numberFormats.currency.maximumFractionDigits = store.state.Settings.User?.DecimalPlacesPrices || 2;
			messages.numberFormats.currency.manimumFractionDigits = store.state.Settings.User?.DecimalPlacesPrices || 2;
		}
		if (messages.numberFormats["avoid-decimal"] !== undefined)
		{
			messages.numberFormats["avoid-decimal"].maximumFractionDigits = store.state.Settings.User?.DecimalPlacesAmount || 4;
		}
		if (messages.numberFormats["decimal"] !== undefined)
		{
			messages.numberFormats["decimal"].maximumFractionDigits = store.state.Settings.User?.DecimalPlacesAmount || 4;
			messages.numberFormats["decimal"].minimumFractionDigits = store.state.Settings.User?.DecimalPlacesAmount || 4;
		}
	}

	// set locale and locale message
	i18n.global.setLocaleMessage(locale, messages);
	i18n.global.setNumberFormat(locale, messages.numberFormats);

	return nextTick();
}