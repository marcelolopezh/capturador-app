<template>
  <ion-card class="mt-5">
    <ion-card-header>
      <ion-card-title> Capturador de Estados </ion-card-title>
    </ion-card-header>
    <ion-card-content>
      <ion-grid>
        <div>
          <ion-grid>
            <ion-row>
              <ion-col>
                <ion-item>
                  <ion-input
                    class="inputService"
                    v-model="codigoServicio"
                    inputmode="numeric"
                    :maxlength="5"
                    @ionChange="deleteInfo()"
                    placeholder="Ej: 12412"
                  >
                  </ion-input>
                  <ion-button
                    @click="changeClientName(storage)"
                    clear
                    slot="end"
                    color="primary"
                    item-right
                    expand="full"
                    size="default"
                    ><strong>Buscar</strong></ion-button
                  >
                </ion-item>
              </ion-col>
            </ion-row>
          </ion-grid>
          <ion-item> </ion-item>
          <ion-item class="mt-2">
            <house />
            {{ codigoServicioDV }}
          </ion-item>
          <ion-item class="mt-2">
            <userIcon />
            {{ nombreCliente }}
          </ion-item>

          <!-- SE OCULTA LECTUR ANTERIOR
          <ion-item class="mt-2">
            <lightIcon />
            {{ lecturaAnterior }}
          </ion-item>-->

          <ion-item class="mt-4" :disabled="this.flagButtonLectura">
            <ion-label color="primary">Seleccionar Medidor</ion-label>
            <ion-select
              v-model="numeroMedidor"
              @ionChange="cambiarEnteros(storage)"
            >
              <ion-select-option
                v-for="(medidor, index) in medidores"
                :key="index"
                :value="medidor.nro_medidor"
              >
                {{ formatedMedidor(index, medidor) }}
              </ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item>
            <ion-label position="floating" color="primary"
              >Lectura ({{ enteros }} Digitos)</ion-label
            >
            <ion-input
              autofocus
              :disabled="flagInputLectura"
              v-model="lectura"
              inputmode="numeric"
              :maxlength="enteros"
              :minlength="enteros"
              aria-required="true"
              @ionChange="validarLectura()"
              v-bind:class="{ valid: !isValid }"
            ></ion-input>
          </ion-item>

          <ion-text color="danger" v-if="!isValid && lectura != null">
            <h3 id="text-danger-lectura">
              LA LECTURA QUE HA ESCRITO ES MENOR O IGUAL A LA DEL MES ANTERIOR
            </h3>
          </ion-text>

          <ion-button
            v-if="this.flagIsMedidorSelected"
            class="mt-4"
            expand="full"
            color="success"
            @click="this.sendInfo(storage)"
            :disabled="this.flagButtonLectura"
          >
            <checkIcon />
            Confirmar Lectura</ion-button
          >

          <ion-button
            class="my-4"
            expand="full"
            color="danger"
            :disabled="this.booleanButton || this.flagButtonCancelError"
            @click="this.reportError()"
          >
            <exclamationIcon /> Reportar Error</ion-button
          >

          <!-- REPORTAR ERROR -->
          <ion-item>
            <ion-label v-if="flagReportError" color="primary"
              >Seleccione motivo de error</ion-label
            >
            <ion-select
              class="my-3"
              v-model="motivo"
              v-if="flagReportError"
              @ionChange="changeMotivo()"
            >
              <ion-select-option
                v-for="motivo in motivos"
                :key="motivo.id"
                :value="motivo.motivoDesc"
                >{{ motivo.motivoDesc }}
              </ion-select-option>
            </ion-select>
          </ion-item>
          <ion-grid>
            <ion-row>
              <ion-col col-4 full>
                <ion-button
                  expand="full"
                  color="warning"
                  @click="this.cancelError()"
                  v-if="this.flagButtonCancelError"
                >
                  <closeIcon />
                  Cancelar</ion-button
                >
              </ion-col>
              <ion-col col-8 full>
                <ion-button
                  expand="full"
                  color="danger"
                  :disabled="this.flagSendMotivo"
                  @click="this.sendInfo(storage)"
                  v-if="this.flagReportError"
                >
                  <exclamationIcon />
                  Enviar Reporte de Error</ion-button
                >
              </ion-col>
            </ion-row>
          </ion-grid>

          <ion-button
            expand="full"
            v-if="sincronizarButton"
            @click="preSincronizarData(storage)"
          >
            <cloudIcon />
            SINCRONIZAR DATOS</ion-button
          >
        </div>
      </ion-grid>
    </ion-card-content>
  </ion-card>
</template>

<script>
import { getCurrentInstance } from "vue";
import { defineComponent } from "vue";
import userIcon from "./icons/userIcon";
/* SE OCULTA LECTURA ANTERIOR
import lightIcon from "./icons/lightIcon";
*/
import exclamationIcon from "./icons/exclamationIcon";
import checkIcon from "./icons/checkIcon";
import cloudIcon from "./icons/cloudIcon";
import closeIcon from "./icons/closeIcon";
import house from "./icons/house";
//import dataJSON from "../../public/assets/servicios.json";
//import { usePhotoGallery } from "@/composables/usePhotoGallery.ts";

//import { Plugins } from "@capacitor/core";

//const { Geolocation } = Plugins;

import {
  IonCard,
  IonCardContent,
  IonCardTitle,
  IonItem,
  IonInput,
  IonButton,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonCardHeader,
  IonCol,
  IonGrid,
  IonRow,
  IonText,
  loadingController,
} from "@ionic/vue";

export default defineComponent({
  name: "Capturador",
  components: {
    userIcon,
    //lightIcon,
    exclamationIcon,
    checkIcon,
    cloudIcon,
    closeIcon,
    house,
    IonCard,
    IonCardContent,
    IonCardTitle,
    IonItem,
    IonInput,
    IonButton,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonCardHeader,
    IonCol,
    IonGrid,
    IonRow,
    IonText,
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
      medicionResponseStatus: null,
      errors: null,
      lecturaAnterior: null,
      isValid: false,
      codigoServicioDV: null,
      flagIsMedidorSelected: false,
      dataInfo: null,
      apiUrl: "http://capturadores.codiner.cl/",
      nombreCliente: "",
      codigoServicio: null,
      digitoVerificador: null,
      numeroMedidor: null,
      lectura: null,
      mensaje: null,
      medidores: [],
      motivos: [
        { id: 1, motivoDesc: "Casa Cerrada" },
        { id: 2, motivoDesc: "Portón con Candado" },
        { id: 3, motivoDesc: "Perros" },
        { id: 4, motivoDesc: "Medidor con Llave" },
        { id: 5, motivoDesc: "Camino Malo" },
        { id: 6, motivoDesc: "Medidor No Corresponde" },
        { id: 7, motivoDesc: "Ilegible" },
        { id: 8, motivoDesc: "No Autoriza" },
        { id: 9, motivoDesc: "Otro" },
      ],
      motivo: null,
      enteros: null,
      booleanButton: true,
      flagReportError: false,
      flagSendMotivo: true,
      flagButtonLectura: true,
      medicion: null,
      mediciones: [],
      flagButtonCancelError: false,
      flagInputLectura: true,
      globalFlagConnection: false,
      sincronizarButton: false,
      user: null,
      medidorFormatedString: null,
      marca: null,
    };
  },

  mounted() {
    //console.log(this.dataJSON);
    // METODO PARA COMPROBAR SI ES QUE HAY INFORMACION ALMACENADA LOCALMENTE
    // DE ESTA MANERA SE HABILITA UN BOTON PARA SINCRONIZAR LOS DATOS
    //this.clearLocalData(this.storage)
    this.getLocalData(this.storage);
    this.getAllKeysValues(this.storage);
    // CERRAR SESION
    //this.storage.removeItem("token");
    //this.$emit("isLogged", false);

  },

  methods: {
    formatedMedidor(index, medidor) {
      return this.medidorFormatedString[index] + " - " + medidor.marca;
    },

    deleteInfo() {
      if (this.codigoServicio == "") {
        this.formatVars();
      }
    },
    async sendInfo(storage) {
      //console.log("ENTRANDO A SENDINFO");
      const loading = await loadingController.create({
        cssClass: "loadingClass",
        message: "Espere ...",
      });
      await loading.present();
      this.dataInfo.lectura = this.lectura;
      //console.log("DATA INFO =>");
      //console.log(this.dataInfo);
      const promesa = this.confirmConnectionApi();
      promesa.then(async (confirmConnection) => {
        if (confirmConnection) {
          await loading.dismiss();
          this._sendInfo(storage, loading);
        } else {
          await loading.dismiss();
          this.saveLocalData(storage, loading);
        }
      });
    },

    async _sendInfo(storage) {
      if (
        this.lectura != null &&
        this.lectura != "" &&
        this.enteros == this.lectura.toString().length
      ) {
        this.$swal
          .fire({
            title: "Estás ingresando una nueva lectura ",
            icon: "info",
            html: `<div class="text-swal">` + this.lectura + `</div>`,
            showDenyButton: true,
            confirmButtonText: `Continuar`,
            denyButtonText: `Cancelar`,
          })
          .then(async (result) => {
            if (result.isConfirmed) {
              const loading = await loadingController.create({
                cssClass: "loadingClass",
                message: "Espere ...",
              });
              await loading.present();
              const axios = require("axios");
              let formData = new FormData();
              formData.append("nroServicio", this.codigoServicio);
              formData.append("dv", this.digitoVerificador);
              formData.append("medidor", this.numeroMedidor);
              formData.append("lectura", this.lectura);
              formData.append("fecha", this.dataInfo.fecha);
              formData.append("motivo", this.motivo);
              formData.append("tomador_id", this.user.id);

              /*try {
                const coordinates = await Geolocation.getCurrentPosition();
                formData.append("longitude", coordinates.coords.longitude);
                formData.append("latitude", coordinates.coords.latitude);
              } catch (error) {
                await loading.dismiss();
                this.sweetAlert(
                  "error",
                  "Ubicación no detectada",
                  "Al parecer tiene la ubicación de su teléfono desactivada, active e intente nuevamente"
                );
                return;
              }*/

              // eslint-disable-next-line no-unused-vars
              let res = await axios
                .post(this.apiUrl + "medicion/add", formData, {
                  headers: {
                    Authorization: this.user.token,
                  },
                })
                .then(
                  (response) => (this.medicionResponseStatus = response.status)
                )
                .catch((error) => {
                  console.log(error);
                });
              //console.log("medicionREsponseStatus =>");
              //console.log(this.medicionResponseStatus);
              if (
                this.medicionResponseStatus == 200 &&
                this.medicionResponseStatus != null
              ) {
                await loading.dismiss();
                this.sweetAlert(
                  "success",
                  "Lectura Añadida",
                  "Se ha realizado la lectura de medidor en el servidor"
                );

                this.formatVars();
              } else if (this.medicionResponseStatus == null) {
                // eslint-disable-next-line no-unused-vars
                let result = await storage.removeItem("token");
                loading.dismiss();
                this.$emit("isLogged", false);
              } else {
                await loading.dismiss();
                this.sweetAlert(
                  "error",
                  "Error al ingresar Lectura",
                  "Error de conexión con el servidor"
                );
              }
            } else if (result.isDenied) {
              console.log("Cancel ");
            }
          });
      } else {
        this.sweetAlert(
          "error",
          "Error al ingresar Lectura",
          "Los Enteros del medidor no concuerdan con la lectura ingresada"
        );
      }
      this.medicionResponseStatus = null;
    },
    // CAMBIA ANTEROS Y MEDICION ANTERIOR
    async cambiarEnteros(storage) {
      this.medidorFormatedString = [];
      //console.log("THIS MEDIDORES");
      //console.log(this.medidores);
      for (var [index, medidor] of this.medidores.entries()) {
        let aux = medidor.nro_medidor.toString();
        aux = aux.slice(0, -1);
        this.medidorFormatedString.push(aux);
        if (medidor.nro_medidor == this.numeroMedidor) {
          this.enteros = medidor.enteros;
          let item = await storage.getItem(this.codigoServicio.toString());
          console.log(item);
          if (index == 0) {
            this.lecturaAnterior = JSON.parse(item).anterior1;
            this.marca = JSON.parse(item).marca;
          } else if (index == 1) {
            this.lecturaAnterior = JSON.parse(item).anterior2;
            this.marca = JSON.parse(item).marca;
          } else if (index == 2) {
            this.lecturaAnterior = JSON.parse(item).anterior3;
            this.marca = JSON.parse(item).marca;
          }
          this.flagIsMedidorSelected = true;
        }
        if (this.lecturaAnterior != null && this.enteros != null) {
          while (this.lecturaAnterior.toString().length < this.enteros) {
            this.lecturaAnterior = "0" + this.lecturaAnterior.toString();
          }
        }
      }
      this.lectura = null;
    },

    validarLectura() {
      if (parseInt(this.lectura) <= parseInt(this.lecturaAnterior)) {
        this.isValid = false;
      } else {
        this.isValid = true;
      }
    },

    async saveLocalData(storage) {
      if (
        this.lectura != null &&
        this.lectura != "" &&
        this.enteros == this.lectura.toString().length
      ) {
        const resOpen = await storage.openStore({});
        if (!resOpen) {
          console.log(
            " > Ha ocurrido un error al intentar abrir la db local \n"
          );
          return;
        } else {
          //AÑADE MOTIVO
          this.$swal
            .fire({
              title: "Estás ingresando una nueva lectura ",
              icon: "info",
              html: `<div class="text-swal">` + this.lectura + `</div>`,
              showDenyButton: true,
              confirmButtonText: `Continuar`,
              denyButtonText: `Cancelar`,
            })
            .then(async (result) => {
              if (result.isConfirmed) {
                const loading = await loadingController.create({
                  cssClass: "loadingClass",
                  message: "Espere ...",
                });
                await loading.present();

                let info = {};
                info.nroServicio = this.codigoServicio;
                info.dv = this.digitoVerificador;
                info.medidor = this.numeroMedidor;
                info.lectura = this.lectura;
                info.fecha = this.dataInfo.fecha;
                info.motivo = this.motivo;
                info.tomador = this.user.id;

                /*try {
                  const coordinates = await Geolocation.getCurrentPosition();
                  info.latitude = coordinates.coords.latitude;
                  info.longitude = coordinates.coords.longitude;
                } catch (error) {
                  await loading.dismiss();
                  this.sweetAlert(
                    "error",
                    "Ubicación no detectada",
                    "Al parecer tiene la ubicación de su teléfono desactivada, active e intente nuevamente"
                  );
                  return;
                }*/

                let codigoServicio =
                  this.codigoServicio + "-" + this.digitoVerificador;

                //console.log("Info to SQLite => \n");
                //console.log(info);

                await storage.setItem(
                  "m" + codigoServicio.toString(),
                  JSON.stringify(info)
                );
                const result = await storage.getItem(
                  "m" + codigoServicio.toString()
                );
                if (result !== JSON.stringify(info)) {
                  console.log(
                    " > Ha ocurrido un error al tratar de guardar la informacion \n"
                  );
                  return;
                }

                this.sincronizarButton = true;
                await loading.dismiss();
                this.sweetAlert(
                  "success",
                  "Lectura Añadida",
                  "Se ha realizado la lectura de medidor en el dispositivo"
                );
                this.formatVars();
              } else {
                console.log("cancel");
              }
            });
        }
      } else {
        this.sweetAlert(
          "error",
          "Error al ingresar Lectura",
          "Los Enteros del medidor no concuerdan con la lectura ingresada"
        );
      }
    },

    async getLocalData(storage) {
      const resOpen = await storage.openStore({});
      if (!resOpen) {
        console.log(" > Ha ocurrido un error al intentar abrir la db local \n");
        return false;
      } else {
        const result = await storage.getAllKeysValues();
        for (let reskey of result) {
          if (reskey.key.startsWith("m")) {
            this.sincronizarButton = true;
          }
        }
        const result2 = await storage.getItem("token");
        if (result2 != null) {
          this.user = JSON.parse(result2);
        } else {
          this.$emit("isLogged", false);
        }
      }
    },

    async getAllKeysValues(storage) {
      const result = await storage.getAllKeysValues();
      for (let reskey of result) {
        if (reskey.key.startsWith("m")) {
          console.log(reskey);
        }
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

    reportError: function () {
      this.flagReportError = true;
      this.flagButtonLectura = true;
      this.flagButtonCancelError = true;
    },

    changeMotivo: function () {
      this.lectura = this.lecturaAnterior;
      while (this.lectura.toString().length < this.enteros) {
        this.lectura = "0" + this.lectura.toString();
      }
      //console.log(this.lectura);
      this.flagSendMotivo = false;
    },

    cancelError: function () {
      this.formatVars();
    },

    sweetAlert(icon, title, text) {
      this.$swal({
        icon: icon,
        title: title,
        text: text,
        showConfirmButton: true,
      });
    },

    formatVars() {
      this.numeroMedidor = 0;
      this.lectura = null;
      this.motivo = null;
      this.enteros = null;
      this.booleanButton = true;
      this.flagReportError = false;
      this.flagSendMotivo = true;
      this.flagButtonLectura = true;
      this.flagButtonCancelError = false;
      this.flagInputLectura = true;
      this.nombreCliente = "";
      this.codigoServicio = null;
      this.digitoVerificador = null;
      this.dataInfo = null;
      this.servicio = null;
      this.lecturaAnterior = null;
      this.codigoServicioDV = null;
      //this.medicion = null;
    },

    /*CUANDO SE QUIERA ENVIAR UNA LECTURA AL SERVIDOR
    TARDARA 5 SEGUNDOS EN DETERMINAR SI EXISTE CONEXION
    AL SERVIDOR O NO. SI => ENVIA ; NO => GUARDA LOCAL*/
    confirmConnectionApi: async function () {
      const axios = require("axios");
      try {
        let res = await axios({
          url: this.apiUrl,
          method: "get",
        });
        // Si status=200 y data=true, retorna true, sino false
        //console.log(res.status, res.data);
        return res.status == 200 && res.data == true;
      } catch (err) {
        console.log(false);
        return false;
      }
    },

    async preSincronizarData(storage) {
      const loading = await loadingController.create({
        cssClass: "loadingClass",
        message: "Sincronizando, Espere ...",
      });
      await loading.present();
      this._sincronizarData(storage, loading);
    },

    async _sincronizarData(storage, loading) {
      const promesa = this.confirmConnectionApi();
      promesa.then((confirmConnection) => {
        if (confirmConnection) {
          this.__sincronizarData(storage, loading);
        } else {
          this.globalFlagConnection = false;
          alert("ERROR AL ESTABLECER COMUNICACION CON EL SERVIDOR");
          loading.dismiss();
        }
      });
      //loading.dismiss();
    },

    async __sincronizarData(storage, loading) {
      await loading.present();
      const resOpen = await storage.openStore({});
      if (!resOpen) {
        console.log(" > Ha ocurrido un error al intentar abrir la db local \n");
        return false;
      } else {
        const result = await storage.getAllKeysValues();
        const axios = require("axios");
        //console.log("VOY A VER TODAS LAS SQLITE");
        for (let res of result) {
          if (res.key.startsWith("m")) {
            //console.log(res);
            let dataToSend = JSON.parse(res.value);
            let formData = new FormData();
            formData.append("nroServicio", dataToSend.nroServicio);
            formData.append("dv", dataToSend.dv);
            formData.append("medidor", dataToSend.medidor);
            formData.append("lectura", dataToSend.lectura);
            formData.append("fecha", dataToSend.fecha);
            formData.append("motivo", dataToSend.motivo);
            formData.append("tomador_id", this.user.id);
            //formData.append("latitude", dataToSend.latitude);
            //formData.append("longitude", dataToSend.longitude);

            // eslint-disable-next-line no-unused-vars
            const responsex = await axios
              .post(this.apiUrl + "medicion/add", formData, {
                headers: {
                  Authorization: this.user.token,
                },
              })
              .then((response) => (this.medicion = response.data))
              .catch((error) => {
                this.errors = error;
              });
            // NO EXISTEN ERRORES, ENTONCES BORRAR LA MEDICION LOCAL
            if (this.errors == null) {
              let codigoServicio = dataToSend.nroServicio + "-" + dataToSend.dv;
              // eslint-disable-next-line no-unused-vars
              let result = await storage.removeItem("m" + codigoServicio);
              //console.log(result);
            } else {
              // SI  EXISTIO  UN  ERROR  SE  DEBE  AL  TOKEN VENCIDO
              // POR TANTO SE SE ELIMINA EL TOKEN Y CIERRA LA SESION
              // eslint-disable-next-line no-unused-vars
              let result = storage.removeItem("token");

              this.$emit("isLogged", false);
            }
          }
        }
      }
      if (this.errors == null) {
        this.sincronizarButton = false;
      }
      this.sweetAlert(
        "success",
        "Sincronización Realizada",
        "Se han enviado las lecturas al servidor"
      );
      loading.dismiss();
    },

    async changeClientName(storage) {
      var flag = false;
      this.codigoServicioDV = null;
      this.digitoVerificador = null;
      this.lectura = null;
      this.lecturaAnterior = null;
      this.medidor = null;

      if (this.codigoServicio != "" && this.codigoServicio != null) {
        const item = await storage.getItem(this.codigoServicio.toString());
        //console.log(item);
        if (item != null) {
          const itemJson = JSON.parse(item);
          let servicio = itemJson.nroServicio;
          this.digitoVerificador = itemJson.dv;
          this.codigoServicioDV = servicio + " - " + this.digitoVerificador;
          this.nombreCliente = itemJson.nombre;
          this.dataInfo = itemJson;
          this.lecturaAnterior = itemJson.anterior1;
          while (this.lecturaAnterior.toString().length < this.enteros) {
            this.lecturaAnterior = "0" + this.lecturaAnterior.toString();
          }
          var f = new Date();
          var fecha = f.toISOString();
          this.dataInfo.fecha = fecha;
          //console.log(fecha);
          //FORMATEAR VARIABLE MEDIDORES
          this.medidores = [];
          this.medidores.push({
            nro_medidor: itemJson.nro_medidor1,
            enteros: itemJson.enteros1,
            marca: itemJson.marca_medidor1,
          });
          if (itemJson.nro_medidor2 != null && itemJson.enteros2 != null)
            this.medidores.push({
              nro_medidor: itemJson.nro_medidor2,
              enteros: itemJson.enteros2,
              marca: itemJson.marca_medidor2,
            });
          if (itemJson.nro_medidor3 != null && itemJson.enteros3 != null)
            this.medidores.push({
              nro_medidor: itemJson.nro_medidor3,
              enteros: itemJson.enteros3,
              marca: itemJson.marca_medidor3,
            });
          flag = true;
          this.numeroMedidor = this.medidores[0].nro_medidor;

          if (flag) {
            this.flagButtonLectura = false;
            this.booleanButton = false;
            this.flagInputLectura = false;
            //console.log("Numero Medidor => " + this.numeroMedidor);
          } else {
            this.nombreCliente = null;
            this.flagButtonLectura = true;
            this.booleanButton = true;
            this.flagInputLectura = true;
          }
        } else {
          this.sweetAlert(
            "error",
            "Error de Servicio",
            "Servicio no encontrado, si está seguro de que existe, intente sincronizando con el butón superior"
          );
        }
      } else {
        this.sweetAlert(
          "error",
          "Error de Servicio",
          "Servicio no encontrado, el servicio está vacío o nulo"
        );
      }
    },
  },
});
</script>
<style>
.inputService {
  color: 3880ff;
  font-size: 1.2rem;
}
ion-item > ion-icon {
  color: #3880ff;
}
span {
  color: #3880ff;
}
.valid {
  color: red;
  padding-top: 0.2rem;
}
#text-danger-lectura {
  font-size: 1.1rem;
}
.text-swal {
  color: #3880ff;
  font-weight: bold;
  font-size: 1.9rem;
}
</style>