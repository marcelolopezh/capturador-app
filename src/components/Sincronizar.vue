<template>
  <ion-button color="dark" @click="canISync(storage)"><refresh /></ion-button>
</template>

<script>
import { defineComponent } from "vue";
import { IonButton, loadingController } from "@ionic/vue";
import refresh from "./icons/refresh";
import { getCurrentInstance } from "vue";
export default defineComponent({
  props: ["user"],
  name: "Sincronizar",
  components: {
    IonButton,
    refresh,
  },
  setup() {
    const app = getCurrentInstance();
    const storage = app?.appContext.config.globalProperties.$storage;
    //const { takePhoto } = usePhotoGallery();
    return {
      storage,
    };
  },
  data() {
    return {
      newData: null,
      isSync: true,
      apiUrl: "http://capturadores.codiner.cl/",
    };
  },

  mounted() {
    //this.getData(this.storage);
  },

  methods: {
    async confirmConnectionApi() {
      const axios = require("axios");
      try {
        let res = await axios({
          url: this.apiUrl,
          method: "get",
        });
        // Si status=200 y data=true, retorna true, sino false
        console.log(res.status, res.data);
        return res.status == 200 && res.data == true;
      } catch (err) {
        this.$emit("isLogged", false);
      }
    },

    async canISync(storage) {
      const loading = await loadingController.create({
        cssClass: "loadingClass",
        message: "Sincronizando, Espere ...",
      });
      await loading.present();
      const promesa = this.confirmConnectionApi();
      promesa.then((confirmConnection) => {
        // existe conexion
        if (confirmConnection) {
          console.log("entre a if");
          this.Sync(storage, loading);
        } else {
          console.log("entre a else");

          this.sweetAlert(
            "error",
            "Error al Sincronizar",
            "No se ha podido establecer una conexión con el servidor. Compruebe su datos móviles o wifi"
          );
          loading.dismiss();
        }
      });
    },

    async Sync(storage, loading) {
      const axios = require("axios");
      await axios
        .get(this.apiUrl + "medicionbase/getAll", {
          headers: {
            Authorization: this.user.token,
          },
        })
        .then((response) => (this.newData = response.data))
        .catch((error) => {
          console.log(error);
          loading.dismiss();
          this.$emit("isLogged", false);
        });
      const resOpen = await storage.openStore({});
      if (!resOpen) {
        console.log(
          " > Ha ocurrido un error al intentar guardar las mediciones del servidor en SQLITE \n"
        );
        return;
      } else {
        console.log("FROM SINC");
        console.log("INSIDE");
        for (let data of this.newData) {
          await storage.setItem(
            data.nroServicio.toString(),
            JSON.stringify(data)
          );
        }
        this.sweetAlert(
          "success",
          "Sincronización Realizada",
          "Se han descargado las nuevas lecturas desde el servidor"
        );
        loading.dismiss();
      }
    },
    sweetAlert(icon, title, text) {
      this.$swal({
        icon: icon,
        title: title,
        text: text,
        showConfirmButton: true,
      });
    },
  },
});
</script>
<style>
userIcon {
  color: white;
}
.loadingClass {
  color: red;
}
</style>