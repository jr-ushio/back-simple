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
      const Usuario = app.use('App/Models/Usuario')
      return new SyncService(Accion, Usuario)
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
    // (use('Adonis/Services/Sync')).start()
  }
}

module.exports = SyncProvider
