import { createApp } from 'vue'
import { createVuestic } from 'vuestic-ui'
import 'vuestic-ui/css'
import App from './App.vue'

const app = createApp(App)
app.use(createVuestic())
app.mount('#app')