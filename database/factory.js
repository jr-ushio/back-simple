'use strict'

/*
|--------------------------------------------------------------------------
| Factory
|--------------------------------------------------------------------------
|
| Factories are used to define blueprints for database tables or Lucid
| models. Later you can use these blueprints to seed your database
| with dummy data.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
const Hash = use('Hash')

Factory.blueprint('App/Models/Usuario', (faker) => {
  return {
    nombres: faker.name(),
    apellidos: faker.last({ nationality: 'es' }) + ' ' + faker.last({ nationality: 'es' }),
    usuario: faker.username(),
    password: async () => {
      return await Hash.make('secreto')
    },
    created_at: new Date(),
    updated_at: new Date()
  }
})
