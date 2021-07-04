import { createApp } from 'vue';
import { loadLocaleMessages, setI18nLanguage, setupI18n } from './locale';
import router from './router';
import { store, key } from './store';
import { LOAD_CONFIG } from './store/mutations';
import App from './App.vue';
import api from './api';

// PrimeVue components
import PrimeVue from 'primevue/config';

import ToastService from 'primevue/toastservice';

// some globally registered components
import InputText from 'primevue/inputtext';
import RadioButton from 'primevue/radiobutton';
import ToggleButton from 'primevue/togglebutton';
import InputSwitch from 'primevue/inputswitch';
import CheckBox from 'primevue/checkbox';

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

// load configs
api.System.GetConfig().then((config) =>
{
	store.commit(LOAD_CONFIG, config);

	loadLocaleMessages(i18n, store.state.Settings.Locale).then(() => setI18nLanguage(i18n, store.state.Settings.Locale));

	app.mount("#app");
});