import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import { definePreset } from '@primevue/themes'

import 'primeicons/primeicons.css'
import './style.css'

import App from './App.vue'
import router from './router'

// BDI primary CTA / focus / selected state is GREEN #009A44 (Secondary/Green in Figma tokens).
// Red is reserved for the logo wordmark and error states only.
const BDIPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#E6F5EC',
      100: '#C3E7CF',
      200: '#80CC9C',
      300: '#4DB677',
      400: '#26A55B',
      500: '#009A44',
      600: '#00863B',
      700: '#006E30',
      800: '#005525',
      900: '#003D1B',
      950: '#002612',
    },
    focusRing: {
      width: '2px',
      style: 'solid',
      color: '#009A44',
      offset: '2px',
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
  ripple: false,
})

app.mount('#app')
