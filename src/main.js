import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import { definePreset } from '@primevue/themes'

import 'primeicons/primeicons.css'
import './style.css'

import App from './App.vue'
import router from './router'

const BDIPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#FFF1F0',
      100: '#FFD9D5',
      200: '#FBA59E',
      300: '#F37267',
      400: '#E94B3E',
      500: '#DA291C',
      600: '#B82217',
      700: '#931B12',
      800: '#6E140E',
      900: '#4A0D09',
      950: '#2B0805',
    },
  },
})

const app = createApp(App)

app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: BDIPreset,
    options: {
      darkModeSelector: '.bdi-dark',
    },
  },
  ripple: true,
})

app.mount('#app')
