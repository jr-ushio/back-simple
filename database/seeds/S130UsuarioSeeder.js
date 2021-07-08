'use strict'

/*
|--------------------------------------------------------------------------
| S130UsuarioSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
const Database = use('Database')
const Hash = use('Hash')

class S130UsuarioSeeder {
  async run () {
    await Database
      .table('usuarios')
      .insert({
        nombres: 'admin',
        apellidos: 'nivel super',
        usuario: 'admin',
        password: await Hash.make('secreto'),
        created_at: new Date(),
        updated_at: new Date()
      })
    const booksArray = await Factory.model('App/Models/Usuario').createMany(1000);
  }
}

module.exports = S130UsuarioSeeder
