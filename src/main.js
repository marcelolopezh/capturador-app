import { createApp } from 'vue'
import App from './App.vue'
import router from './router';

import { IonicVue } from '@ionic/vue';
import VueSweetalert2 from 'vue-sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';
//import Layout from './components/Layout.vue';

/* Theme variables */
import './theme/variables.css';

import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

import { useStorageSQLite } from 'vue-data-storage-sqlite-hook/dist';
import { defineCustomElements } from '@ionic/pwa-elements/loader';

//import axios from 'axios';
//axios.defaults.timeout = 5000


// StorageSQLite Hook  
const { openStore, getItem, setItem, getAllKeys, getAllValues,
  getAllKeysValues, isKey, removeItem,
  clear, setTable, isAvailable} = useStorageSQLite();


const app = createApp(App)
  .use(IonicVue)
  .use(router)
  .use(VueSweetalert2);

// Singleton StorageSQLite Hook  
app.config.globalProperties.$storage = {
  openStore: openStore, getItem: getItem, setItem: setItem, getAllKeys: getAllKeys,
  getAllValues: getAllValues, getAllKeysValues: getAllKeysValues, isKey: isKey,
  removeItem: removeItem,clear: clear, setTable: setTable, isAvailable:isAvailable};

router.isReady().then(() => {
  app.mount('#app');
  defineCustomElements(window);
});