import { createApp } from 'vue';
import { loadLocaleMessages, setI18nLanguage, setupI18n } from './locale';
import router from './router';
import { store, key } from './store';
import { LOAD_CONFIG, LOAD_QUANTITY_UNITS } from './store/mutations';
import App from './App.vue';
import api from './api';
import * as Filters from './lib/filters';

// PrimeVue components
import PrimeVue  from 'primevue/config';
import { FilterService } from 'primevue/api';

import ToastService from 'primevue/toastservice';

// some globally registered components
import InputText from 'primevue/inputtext';
import RadioButton from 'primevue/radiobutton';
import ToggleButton from 'primevue/togglebutton';
import InputSwitch from 'primevue/inputswitch';
import CheckBox from 'primevue/checkbox';
import Card from 'primevue/card';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ContextMenu from 'primevue/contextmenu';
import InputNumber from 'primevue/inputnumber';
import Calendar from 'primevue/calendar';
import MultiSelect from 'primevue/multiselect';
import Tooltip from 'primevue/tooltip';
import Toast from 'primevue/toast';
import ProgressSpinner from 'primevue/progressspinner';
import Dropdown from 'primevue/dropdown';
import Dialog from 'primevue/dialog';
import { ENSURE_PRODUCTS_LOADED } from './store/actions';

const app = createApp(App);
const i18n = setupI18n();

app.use(PrimeVue);
app.use(ToastService);
app.use(router);
app.use(i18n);
app.use(store, key);

app.component('InputText', InputText);
app.component('RadioButton', RadioButton);
app.component('ToggleButton', ToggleButton);
app.component('InputSwitch', InputSwitch);
app.component('CheckBox', CheckBox);
app.component('Card', Card);
app.component('Button', Button);
app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('ContextMenu', ContextMenu);
app.component('InputNumber', InputNumber);
app.component('Calendar', Calendar);
app.component('MultiSelect', MultiSelect);
app.component('Toast', Toast);
app.component('ProgressSpinner', ProgressSpinner);
app.component('Dropdown', Dropdown);
app.component('Dialog', Dialog);

app.directive('tooltip', Tooltip);

if (FilterService.register !== undefined)
{
	FilterService.register(Filters.LUXON_DATE_BEFORE, Filters.luxonDateBeforeFilter);
	FilterService.register(Filters.LUXON_DATE_BEFORE_OR_EQUAL, Filters.luxonDateBeforeOrEqualFilter);
	FilterService.register(Filters.LUXON_DATE_AFTER, Filters.luxonDateAfterFilter);
	FilterService.register(Filters.LUXON_DATE_AFTER_OR_EQUAL, Filters.luxonDateAfterOrEqualFilter);
	FilterService.register(Filters.LUXON_DATE_EQUAL, Filters.luxonDateEqualFilter);
	FilterService.register(Filters.LUXON_DATE_NOT_EQUAL, Filters.luxonDateNotEqualFilter);
	FilterService.register(Filters.LUXON_DATE_EQUAL_DAY, Filters.luxonDateEqualDayFilter);
	FilterService.register(Filters.LUXON_DATE_NOT_EQUAL_DAY, Filters.luxonDateNotEqualDayFilter);
}

// load configs
api.System.GetConfig().then((config) =>
{
	store.commit(LOAD_CONFIG, config);
	store.dispatch(ENSURE_PRODUCTS_LOADED);
	const promises = [loadLocaleMessages(i18n, "en", store)];
	let setLanguage = "en";
	if (store.state.Settings !== undefined && store.state.Settings.Locale != "en")
	{
		promises.push(loadLocaleMessages(i18n, store.state.Settings.Locale, store));
		setLanguage = store.state.Settings.Locale;
	}
	promises.push(api.Stock.GetQuantityUnits().then(data =>
	{
		store.commit(LOAD_QUANTITY_UNITS, data);
	}));
	
	Promise.all(promises).then(() =>
	{
		setI18nLanguage(i18n, setLanguage);
		app.mount("#app");
	});
});