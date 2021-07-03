import { createApp } from 'vue';
import router from './router';
import App from './App.vue';

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

app.use(PrimeVue);
app.use(ToastService);
app.use(router);

app.component('InputText', InputText);
app.component('RadioButton', RadioButton);
app.component('ToggleButton', ToggleButton);
app.component('InputSwitch', InputSwitch);
app.component('CheckBox', CheckBox);


app.mount("#app");
