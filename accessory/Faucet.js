'use strict';

const {Accessory} = require('../util/Accessory');
const {addActiveCharacteristicWithDefaultConf} = require('./characteristic/BinarySensor');

class FaucetAccessory extends Accessory {
    _getPrimaryService() {
        this._log.debug(`Creating faucet service for ${this.name}`);
        let primaryService = new this.Service.Faucet(this.name);
        addActiveCharacteristicWithDefaultConf.bind(this)(primaryService);
        return primaryService;
    }
}

const type = "faucet";

function createAccessory(platform, config) {
    return new FaucetAccessory(platform, config, 'Faucet');
}

module.exports = {createAccessory, type};

