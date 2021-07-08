'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Usuario extends Model {
  static get table () {
    return 'usuarios'
  }

  static get fillable () {
    return [
      'id',
      'nombres',
      'apellidos',
      'usuario',
      'password',
    ]
  }
}

module.exports = Usuario
