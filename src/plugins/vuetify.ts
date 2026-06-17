import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        dark: true,
        colors: {
          background: '#070d1a',
          surface: '#111c32',
          primary: '#1cc5a2',
          secondary: '#5d87be',
          success: '#4ce0a8',
          warning: '#ffd383',
          error: '#ff8f79',
          info: '#9fd0ff',
        },
      },
    },
  },
  icons: {
    defaultSet: 'mdi',
  },
})
