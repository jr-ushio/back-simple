// const Accion = use('App/Models/SincronizarAccion')
const fetch = require('node-fetch');
const { setIntervalAsync } = require('set-interval-async/fixed')
const { clearIntervalAsync } = require('set-interval-async')

class SyncService {
  cont = 0
  intervalo = null
  constructor (accion, accion_publica, usuario_model, env) {
    this.accion = accion
    this.accion_publica = accion_publica
    this.usuario_model = usuario_model
    this.env = env
  }
  start() {
    console.log('start ', );
    this.intervalo = setIntervalAsync(async ()=> {
      if (await this.verificarInternet()) {
        await this.pull()
        await this.manual()
        await this.pull()
      }
    },  600000)
  }
  async pull() {
    const items_agregados = []

    const ultimo_registro = await this.accion_publica.query().last()
    const id_ultimo_Registro = ultimo_registro ? ultimo_registro.id : 0

    const resp_2_host_remoto = await this.sendData(this.env.get('APP_URL_REMOTO') + '/apitest/online/operaciones/' + id_ultimo_Registro, null)

    if (resp_2_host_remoto.codigo === 200) {
      let acciones_para_eliminar = await this.accion.query().where('status','=','nosync').where('request_method','=','DELETE').fetch()
      let acciones_para_agregar = await this.accion.query().where('status','=','nosync').where('request_method','=','POST').fetch()
      acciones_para_eliminar  = acciones_para_eliminar.toJSON()
      acciones_para_agregar  = acciones_para_agregar.toJSON()

      for (let item of resp_2_host_remoto.data.operaciones) {
        if (item.request_method === 'POST') {
          const user = JSON.parse(item.request_body)
          const user_encontrado = await this.usuario_model.find(user.id)
          const accion_para_eliminar = !acciones_para_eliminar.find(e => Number(e.request_url_params) === user.id)
          if (!user_encontrado && accion_para_eliminar) {
            console.log('item sin match ', user.id);
            await this.agregar_usuario(user)
            items_agregados.push(user)
          }
          const accion_para_agregar = acciones_para_agregar.find(e => Number(JSON.parse(e.request_body).id) === user.id)
          if (user_encontrado && accion_para_agregar) {
            console.log('item con conficto ', user_encontrado.id);
            const aux_user = await this.usuario_model.find(user_encontrado.id)
            await aux_user.delete()
            await this.agregar_usuario(user)
            items_agregados.push(user)
          }
        } else if (item.request_method === 'PUT') {
          const user = JSON.parse(item.request_body)
          const user_encontrado = await this.usuario_model.find(user.id)
          if (user_encontrado) {
            user_encontrado.nombres = user.nombres
            user_encontrado.apellidos = user.apellidos
            user_encontrado.usuario = user.usuario
            user_encontrado.password = user.password
            await user_encontrado.save()
          }
        } else if (item.request_method === 'DELETE') {
          const user_encontrado = await this.usuario_model.find(item.request_url_params)
          if (user_encontrado) {
            await user_encontrado.delete()
          }
        }
        await this.agregar_accion_publica(item)
      }
    }
    return {
      registros_recuperados: items_agregados
    }
  }
  async agregar_accion_publica(item) {
    const accion = new this.accion_publica()
    accion.id = item.id
    accion.request_method = item.request_method
    accion.request_url = item.request_url
    accion.request_url_params = item.request_url_params
    accion.request_body = item.request_body
    accion.content_type = item.content_type
    accion.status = item.status
    accion.response = item.response
    accion.date_time = item.date_time
    await accion.save()
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
