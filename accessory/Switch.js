'use strict';

const {Accessory} = require('../util/Accessory');
const {} = require('./characteristic/On');

class SwitchAccessory extends Accessory {

    constructor(platform, config) {
        super(platform, config);

        // Services will be retrieved by homebridge
        this._services = [
            this._getAccessoryInformationService('Switch'),
            this._getPrimaryService()
        ]
    }

    _getPrimaryService() {
        this._log.debug(`Creating switch service for ${this.name}`);
        let primaryService = new this.Service.Switch(this.name);
        addOnCharacteristic.bind(this)(primaryService);
        return primaryService;
    }
}

const type = "switch";

function createAccessory(platform, config) {
    return new SwitchAccessory(platform, config);
}

module.exports = {createAccessory, type};
