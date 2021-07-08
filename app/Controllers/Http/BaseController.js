'use strict'

const Config = use('Config')
const Helpers = use('Helpers')
const Validator = use('Validator')

class BaseController {
  validationMessages() {
    const fs = require('fs');
    const locale = Config.get('app.locales.locale')
    const validaitonFile = Helpers.resourcesPath(`locales/en/validation.json`)

    if (fs.existsSync(validaitonFile)) {
      return JSON.parse(fs.readFileSync(validaitonFile, 'utf8'));
    }
    return {};
  }

  /**
   * automatically validate request data and flash back
   * old input + validation messages if any
   */
  async validate(request, response, rules, messages) {
    messages = Object.assign(this.validationMessages(), messages)
    return Validator.validate(request.all(), rules, messages);
  }

  async response_success(message = '', code = 200, data = null) {
    return {mensaje: message, codigo: code, data: data}
  }

  async response_error(message = '', code = 404, data = null) {
    return {mensaje: message, codigo: code, data: data}
  }
}

module.exports = BaseController
