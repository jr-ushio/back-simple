'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class SincronizarAccionesSchema extends Schema {
  up () {
    this.create('sincronizar_acciones', (table) => {
      table.increments()
      table.string('request_method', 100)
      table.string('request_url', 100)
      table.string('request_url_params', 100)
      table.string('request_body')
      table.string('content_type', 100)
      table.string('status', 100)
      table.string('response', 100)
      table.datetime('date_time', 100)
      table.timestamps()
    })
  }

  down () {
    this.drop('sincronizar_acciones')
  }
}

module.exports = SincronizarAccionesSchema
