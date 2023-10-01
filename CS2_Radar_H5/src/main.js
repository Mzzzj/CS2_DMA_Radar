import { createApp } from 'vue'
import App from './App.vue'
import 'leaflet/dist/leaflet.css'

import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.pm";
import "leaflet.pm/dist/leaflet.pm.css";

 

const app = createApp(App);
app.mount('#app')
// 引入Leaflet对象 挂载到Vue上，便于全局使用，也可以单独页面中单独引用

app.config.productionTip = false;
