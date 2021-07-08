'use strict'
const BaseController = use('App/Controllers/Http/BaseController')
const Hash = use('Hash')
const Database = use('Database')
const Usuario = use('App/Models/Usuario')
const Accion = use('App/Models/SincronizarAccion')
const moment = require('moment')
const Env = use('Env')

class UsuarioController extends BaseController {
  async login2({request, response}) {
    return this.response_error('Este servicio es de prueba intente cambiar a otro.', 404)
  }

  async login({request, response}) {
    const rules = {
      usuario: 'required',
      password: 'required'
    }
    const validation = await this.validate(request, response, rules);
    if (!validation.fails()) {
      let user = await Usuario.query().where("usuario", request.input('usuario')).first()
      if (user == null) {
        return this.response_error('El usuario no esta registrado')
      }
      const passwordVerified = await Hash.verify(request.input('password'), user.password)
      if (passwordVerified) {
        return this.response_success(null, 200, user)
      }
      return this.response_error('No coinciden las credenciales')
    } else {
      if (validation.messages().length > 0) {
        return this.response_error(validation.messages()[0].message)
      }
      return this.response_error('Algunos de los parametros no fuerón enviados', 404, validation.messages())
    }
  }

  async index({request}) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    let search = request.input('search', '')
    search = search.replace(/ /g, '%')

    const usuarios = await Database.select('id', 'nombres', 'apellidos', 'usuario', 'created_at', 'updated_at')
      .from('usuarios')
      .where('id', '!=', 1)
      .whereRaw(`nombres || ' ' || apellidos || ' ' || usuario || ' ' || apellidos || ' ' || nombres LIKE ?`, [`%${search}%`])
      .orderBy('id', 'desc')
      .paginate(page, limit)

    return this.response_success(null, 200, usuarios)
  }

  async show({request, response, params}) {
    let usuario = await Usuario.query()
      .where('id', params.id)
      .first()

    if (!usuario) {
      return this.response_error('No se ha encontrado el registro')
    }
    return this.response_success(null, 200, usuario)
  }

  async store({request, response}) {
    const rules = {
      nombres: 'required|unique:usuarios',
      apellidos: 'required',
      usuario: 'required|unique:usuarios',
      password: 'required',
    }
    const validation = await this.validate(request, response, rules);

    if (validation.fails()) {
      if (validation.messages().length > 0) {
        return this.response_error(validation.messages()[0].message, 404)
      }
      return this.response_error('Algunos de los parametros no fuerón enviados', 404, validation.messages())
    }

    let usuario = await Usuario.query()
      .where('usuario', request.input('usuario'))
      .first()

    if (usuario) {
      return this.response_error('El usuario ya está registrado')
    }
    usuario = new Usuario()
    usuario.nombres = request.input('nombres')
    usuario.apellidos = request.input('apellidos')
    usuario.usuario = request.input('usuario')
    usuario.password = await Hash.make(request.input('password'))
    await usuario.save()

    const accion = new Accion()
    accion.request_method = 'POST'
    accion.request_url = Env.get('APP_URL_REMOTO') + '/apitest/usuarios'
    accion.request_url_params = null
    accion.request_body = JSON.stringify(usuario.toJSON())
    accion.content_type = 'JSON'
    accion.status = 'publico'
    accion.response = null
    accion.date_time = moment().format("YYYY-MM-DD HH:mm:ss")
    await accion.save()

    return this.response_success(null, 200, usuario)
  }

  async update({request, response, params}) {
    const rules = {
      nombres: 'required',
      apellidos: 'required',
      usuario: 'required',
      // password: 'required',
    }
    const validation = await this.validate(request, response, rules);

    if (validation.fails()) {
      if (validation.messages().length > 0) {
        return this.response_error(validation.messages()[0].message, 404)
      }
      return this.response_error('Algunos de los parametros no fuerón enviados', 404, validation.messages())
    }

    let usuario = await Usuario.query()
      .where('id', params.id)
      .first()

    if (!usuario) {
      return this.response_error('No se ha encontrado el registro')
    }
    let nombres = request.input('nombres').replace(/ /g, '').toLowerCase()
    let _usuario = request.input('usuario').replace(/ /g, '').toLowerCase()

    const validacion1 = await Usuario.query()
      .where(Database.raw(`lower(replace(nombres,' ',''))`), nombres)
      .where('id', '!=', params.id)
      .first()
    if (validacion1) {
      return this.response_error('El nombre ya lo tiene otra persona')
    }

    const validacion2 = await Usuario.query()
      .where(Database.raw(`lower(replace(usuario,' ',''))`), _usuario)
      .where('id', '!=', params.id)
      .first()
    if (validacion2) {
      return this.response_error('El usuario ya lo tiene otra persona')
    }
    usuario.nombres = request.input('nombres')
    usuario.apellidos = request.input('apellidos')
    usuario.usuario = request.input('usuario')
    if (request.input('password')) {
      usuario.password = await Hash.make(request.input('password'))
    }
    await usuario.save()

    const accion = new Accion()
    accion.request_method = 'PUT'
    accion.request_url = Env.get('APP_URL_REMOTO') + '/apitest/usuarios/' + params.id
    accion.request_url_params = null
    accion.request_body = JSON.stringify(usuario.toJSON())
    accion.content_type = 'JSON'
    accion.status = 'publico'
    accion.response = null
    accion.date_time = moment().format("YYYY-MM-DD HH:mm:ss")
    await accion.save()

    return this.response_success(null, 200, usuario)
  }

  async delete({request, response, params}) {

    const { id } = params
    const user = await Usuario.find(id)

    if (!user) {
      return this.response_error('No se ha encontrado el registro')
    }

    await user.delete()

    const accion = new Accion()
    accion.request_method = 'DELETE'
    accion.request_url = Env.get('APP_URL_REMOTO') + '/apitest/usuarios/' + id
    accion.request_url_params = id
    accion.request_body = null
    accion.content_type = 'JSON'
    accion.status = 'publico'
    accion.response = null
    accion.date_time = moment().format("YYYY-MM-DD HH:mm:ss")
    await accion.save()

    return this.response_success(null, 200, null)
  }

  async online_operaciones({request, response, params}) {
    const acciones = await Accion.query().where('status','=','public').fetch()
    const accionesJSON  = acciones.toJSON()
    const resp = {
      operaciones: accionesJSON,
      registros: accionesJSON.length
    }
    return this.response_success(null, 200, resp)
  }
}

module.exports = UsuarioController
