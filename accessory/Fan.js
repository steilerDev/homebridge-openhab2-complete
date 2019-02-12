'use strict';

const {Accessory} = require('../util/Accessory');
const {addOnCharacteristic} = require('./characteristic/On');
const {addRotationSpeedCharacteristic} = require('./characteristic/Rotation');

class FanAccessory extends Accessory {

    constructor(platform, config) {
        super(platform, config);

        // Services will be retrieved by homebridge
        this._services = [
            this._getAccessoryInformationService('Fan'),
            this._getPrimaryService()
        ]
    }

    _getPrimaryService() {
        this._log.debug(`Creating fan service for ${this.name}`);
        let primaryService = new this.Service.Fan(this.name);
        addOnCharacteristic.bind(this)(primaryService);
        addRotationSpeedCharacteristic.bind(this)(primaryService, true);
        return primaryService;
    }
}

const type = "fan";

function createAccessory(platform, config) {
    return new FanAccessory(platform, config);
}

module.exports = {createAccessory, type};
