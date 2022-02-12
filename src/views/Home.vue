<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="dark">
        <div id="title">
          <div>
            <ion-text>
              <h3>CapturadorApp</h3>
            </ion-text>
          </div>
          <Sincronizar v-if="isLogged" id="syncButton" :user="user" @isLogged="isLogged = $event"/>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-card v-if="!isLogged">
        <ion-card-header>
          <ion-card-title>Iniciar Sesión</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div v-if="pending">
            <ion-spinner name="bubbles"></ion-spinner>
          </div>
          <div v-if="!pending">
            <ion-item v-if="empty">
              <ion-text color="danger">
                <h3>Nombre o Apellido se encuentran vacíos</h3>
              </ion-text>
            </ion-item>
            <ion-item>
              <ion-label color="primary">Nombre</ion-label>
              <ion-input v-model="nombre" type="text" placeholder="Juan">
              </ion-input>
            </ion-item>
            <ion-item>
              <ion-label color="primary">Apellido</ion-label>
              <ion-input v-model="apellido" type="text" placeholder="Perez">
              </ion-input>
            </ion-item>
            <ion-item>
              <ion-label color="primary">Password</ion-label>
              <ion-input
                v-model="password"
                type="password"
                placeholder="••••••••"
              >
              </ion-input>
            </ion-item>
            <ion-button expand="block" @click="token(storage)"
              >Ingresar</ion-button
            >
            <ion-text color="danger" v-if="connectionError" class="mt-2">
              <h2>
                Ha ocurrido un error al establecer comunicacion con el servidor
              </h2>
            </ion-text>
          </div>
        </ion-card-content>
      </ion-card>

      <Capturador v-if="isLogged" @isLogged="isLogged = $event" />
    </ion-content>
  </ion-page>
</template>

<script>
import { defineComponent } from "vue";
import { getCurrentInstance } from "vue";
import Capturador from "../components/Capturador.vue";
import Sincronizar from "../components/Sincronizar.vue";
import {
  IonPage,
  IonHeader,
  IonContent,
  IonToolbar,
  IonButton,
  IonInput,
  IonLabel,
  IonCard,
  IonItem,
  IonCardTitle,
  IonCardHeader,
  IonCardContent,
  IonText,
  IonSpinner,
} from "@ionic/vue";
export default defineComponent({
  name: "Home",
  components: {
    Capturador,
    IonPage,
    IonHeader,
    IonContent,
    IonToolbar,
    IonButton,
    IonInput,
    IonLabel,
    IonCard,
    IonItem,
    IonCardTitle,
    IonCardHeader,
    IonCardContent,
    IonText,
    IonSpinner,
    Sincronizar,
  },
  data() {
    return {
      isLogged: false,
      nombre: null,
      apellido: null,
      apiUrl: "http://capturadores.codiner.cl/",
      empty: false,
      user: null,
      statusCode: null,
      connectionError: false,
      pending: false,
      password: null,
    };
  },

  setup() {
    const app = getCurrentInstance();
    const storage = app?.appContext.config.globalProperties.$storage;

    return {
      storage,
    };
  },
  mounted() {
    this.getLocalData(this.storage);
    //this.clearLocalData(this.storage)
  },
  methods: {
    confirmConnectionApi: async function () {
      const axios = require("axios");
      try {
        let res = await axios({
          url: this.apiUrl,
          method: "get",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });
        // Si status=200 y data=true, retorna true, sino false
        console.log(res.status, res.data);
        return res.status == 200 && res.data == true;
      } catch (err) {
        console.log(false);
        return false;
      }
    },
    token(storage) {
      this.pending = true;
      this._token(storage);
    },
    async _token(storage) {
      if (
        this.nombre != null &&
        this.nombre != "" &&
        this.apellido != null &&
        this.apellido != ""
      ) {
        try {
          const axios = require("axios");
          let formData = new FormData();
          // eslint-disable-next-line no-unused-vars
          formData.append("nombre", this.nombre);
          formData.append("apellido", this.apellido);
          formData.append("password", this.password);
          var f = new Date();
          var fecha = f.toISOString();
          formData.append("fecha", fecha);
          // eslint-disable-next-line no-unused-vars
          const res = await axios
            .post(this.apiUrl + "login", formData, {
              headers: {
                "Content-Type": "application/json",
              },
            })
            .then((response) => (this.statusCode = response))
            .catch((error) => {
              console.log(error);
            });
          if (this.statusCode.status == 200) {
            this.user = res.data;
            console.log("ESTE USUARIO =>");
            console.log(this.user);
            this.saveIdInSQLite(storage);
            this.pending = false;
            this.isLogged = true;
          }
        } catch (e) {
          console.log("ERROR FROM CATCH => " + e);
          this.connectionError = true;
          this.pending = false;
        }
      } else {
        this.empty = true;
        this.pending = false;
      }
    },

    async saveIdInSQLite(storage) {
      const resOpen = await storage.openStore({});

      if (!resOpen) {
        console.log(" > Ha ocurrido un error al intentar abrir la db local \n");
        return;
      } else {
        await storage.setItem("token", JSON.stringify(this.user));
        const result = await storage.getItem("token");
        if (result !== JSON.stringify(this.user)) {
          return;
        }
      }
      console.log(" > Se guardo el objeto correctamente \n");
    },

    async getLocalData(storage) {
      const resOpen = await storage.openStore({});
      if (!resOpen) {
        return false;
      } else {
        const result = await storage.getItem("token");
        //console.log("TOKEN DESDE HOME, SI MANDA O NO A LOGIN AUNQUE YA ESTE LOGEADO" );
        //console.log(result);
        if (result != null) {
          //console.log(JSON.parse(result));
          if (JSON.parse(result).token != "") {
            this.user = JSON.parse(result);
            this.isLogged = true;
          }
        } else {
          console.log("entro aqui ");
          this.isLogged = false;
        }
        console.log("islogged =>" + this.isLogged);
      }
    },

    async clearLocalData(storage) {
      const resOpen = await storage.openStore({});
      if (!resOpen) {
        console.log(" > Ha ocurrido un error al intentar abrir la db local \n");
        return false;
      } else {
        const result = await storage.clear();
        return result;
      }
    },
  },
});
</script>

<style scoped>
#title {
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 0.2rem;
}
#title * {
  display: inline-block;
}
#syncButton {
  float: right;
}

#container {
  text-align: center;

  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 16px;
  line-height: 22px;

  color: #8c8c8c;

  margin: 0;
}

#container a {
  text-decoration: none;
}
</style>