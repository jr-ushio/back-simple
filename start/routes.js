'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.on('/').render('welcome')
Route.group(() => {
  Route.post('login','UsuarioController.login')
  Route.post('login2','UsuarioController.login2')
  Route.get('usuarios','UsuarioController.index')
  Route.get('usuarios/:id','UsuarioController.show')
  Route.post('usuarios','UsuarioController.store')
  Route.put('usuarios/:id','UsuarioController.update')
  Route.delete('usuarios/:id','UsuarioController.delete')
  Route.get('online/operaciones/:id','UsuarioController.online_operaciones')
}).prefix('apitest/')
