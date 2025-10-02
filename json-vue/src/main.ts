import {createApp} from 'vue'
import './assets/style.scss';
import App from './App.vue'
import PrimeVue from 'primevue/config';
import Aura from './aura'

createApp(App)
    .use(PrimeVue, {
        unstyled: true,
        pt: Aura
    })
    .mount('#app')
