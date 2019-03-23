'use strict';

const {Accessory} = require('../util/Accessory');
const {addOnCharacteristic} = require('./characteristic/On');

class SwitchAccessory extends Accessory {

    constructor(platform, config) {
        super(platform, config);
        this._services.push([
            this._getAccessoryInformationService('Switch'),
            this._getPrimaryService()
        ]);
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
