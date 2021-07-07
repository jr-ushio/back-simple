'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class SincronizarAccion extends Model {
  static get table () {
    return 'sincronizar_acciones'
  }

  static get fillable () {
    return [
      'id',
      'request_method',
      'request_url',
      'request_url_params',
      'request_body',
      'content_type',
      'status',
      'response',
      'date_time',
    ]
  }
}

module.exports = SincronizarAccion
