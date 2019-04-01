'use strict';

const {Accessory} = require('../util/Accessory');
const {addActiveCharacteristicWithDefaultConf} = require('./characteristic/BinarySensor');

class FaucetAccessory extends Accessory {
    constructor(platform, config) {
        super(platform, config);

        this._services = [
            this._getAccessoryInformationService('Faucet'),
            this._getPrimaryService()
        ]
    }

    _getPrimaryService() {
        this._log.debug(`Creating faucet service for ${this.name}`);
        let primaryService = new this.Service.Faucet(this.name);
        addActiveCharacteristicWithDefaultConf.bind(this)(primaryService);
        return primaryService;
    }
}

const type = "faucet";

function createAccessory(platform, config) {
    return new FaucetAccessory(platform, config);
}

module.exports = {createAccessory, type};

