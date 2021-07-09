'use strict'

const SyncService = require("./SyncService");
const { ServiceProvider } = require('@adonisjs/fold')

class SyncProvider extends ServiceProvider {
  /**
   * Register namespaces to the IoC container
   *
   * @method register
   *
   * @return {void}
   */
  register () {
    this.app.singleton('Adonis/Services/Sync', (app) => {
      console.log('AAAA ', );
      const Accion = app.use('App/Models/SincronizarAccion')
      const AccionPublica = app.use('App/Models/SincronizarAccionPublica')
      const Usuario = app.use('App/Models/Usuario')
      const Env = use('Env')
      return new SyncService(Accion, AccionPublica, Usuario, Env)
    })
  }

  /**
   * Attach context getter when all providers have
   * been registered
   *
   * @method boot
   *
   * @return {void}
   */
  boot () {
    console.log('BBB ', );
    (use('Adonis/Services/Sync')).start()
  }
}

module.exports = SyncProvider