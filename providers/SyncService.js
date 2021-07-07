// const Accion = use('App/Models/SincronizarAccion')
const fetch = require('node-fetch');
const { setIntervalAsync } = require('set-interval-async/fixed')
const { clearIntervalAsync } = require('set-interval-async')

class SyncService {
  cont = 0
  intervalo = null
  constructor (accion, usuario_model) {
    this.accion = accion
    this.usuario_model = usuario_model
  }
  start() {
    console.log('start ', );
    this.intervalo = setIntervalAsync(async ()=> {
      if (await this.verificarInternet()) {
        await this.manual()
      }
    },  10000)
  }
  async pull() {
    const items_agregados = []

    const resp_host_remoto = await this.sendData('http://llega-ya.com/apitest/usuarios', null)
    if (resp_host_remoto.codigo === 200) {
      let resp_local = await this.sendData('http://192.168.3.7:3333/apitest/usuarios', null)
      let acciones_para_eliminar = await this.accion.query().where('status','=','nosync').where('request_method','=','DELETE').fetch()
      let acciones_para_agregar = await this.accion.query().where('status','=','nosync').where('request_method','=','POST').fetch()
      acciones_para_eliminar  = acciones_para_eliminar.toJSON()
      acciones_para_agregar  = acciones_para_agregar.toJSON()

      let reg_local = (resp_local.data.total + acciones_para_eliminar.length) - acciones_para_agregar.length
      console.log(reg_local , resp_host_remoto.data.total, );

      if (reg_local < resp_host_remoto.data.total) {
        for (let item of resp_host_remoto.data.data) {
          const accion_para_eliminar = !acciones_para_eliminar.find(e => Number(e.request_url_params) === item.id)
          if (!resp_local.data.data.find(e => e.id === item.id) && accion_para_eliminar) {
            console.log('item sin match ', item.id);

            await this.agregar_usuario(item)
            items_agregados.push(item)
          }
          const accion_para_agregar = acciones_para_agregar.find(e => Number(JSON.parse(e.request_body).id) === item.id)
          if (resp_local.data.data.find(e => e.id === item.id) && accion_para_agregar) {
            console.log('item con conficto ', item.id);
            const user = await this.usuario_model.find(JSON.parse(accion_para_agregar.request_body).id)
            await user.delete()

            await this.agregar_usuario(item)
            items_agregados.push(item)
          }
        }
      }
    }
    return {
      registros_recuperados: items_agregados
    }
  }
  async agregar_usuario(item) {
    const usuario = new this.usuario_model()
    usuario.id = item.id
    usuario.nombres = item.nombres
    usuario.apellidos = item.apellidos
    usuario.usuario = item.usuario
    usuario.password = item.password
    await usuario.save()
  }
  async manual() {
    console.log(this.cont + ' - ' + new Date().toLocaleString());
    let operaciones_exitosas = []
    let operaciones_fallidas = []
    let accionesJSON = []

    const acciones = await this.accion.query().where('status','=','nosync').fetch()
    accionesJSON  = acciones.toJSON()
    for (const item of accionesJSON) {
      const resp = await this.sendData(item.request_url, item.request_body ? JSON.parse(item.request_body) : {}, item.request_method)
      console.log('resp ', resp);
      const accion  = await this.accion.find(item.id)
      if (resp.codigo === 200) {
        accion.status = 'sync'
        operaciones_exitosas.push(accion)
      } else {
        accion.status = 'error'
        accion.response = resp.mensaje
        operaciones_fallidas.push(accion)
      }
      accion.save()
    }
    this.cont++;
    return {
      operaciones_exitosas,
      operaciones_fallidas,
      operaciones_totales: accionesJSON.length
    }
  }

  async sendData(url = '', data = {}, method = 'GET') {
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: data ? JSON.stringify(data) : undefined
    });
    if (response.ok) {
      return response.json();
    } else {
      return {mensaje: response.statusText}
    }
  }
  async stop() {
    console.log('stop ', );
    if (this.intervalo) {
      await clearIntervalAsync(this.intervalo)
    }
  }
  async verificarInternet() {
    try {
      const response = await fetch('https://www.youtube.com/')
      if (response.ok) {
        return true
      }
      return false
    } catch (e) {
      console.log('verificarInternet => ', e);
      return false
    }
  }
}

module.exports = SyncService
