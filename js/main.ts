import { createApp } from 'vue';
import router from './router';
import App from './App.vue';

// PrimeVue components
import PrimeVue from 'primevue/config';

const app = createApp(App);

app.use(PrimeVue);
app.use(router);


app.mount("#app");
