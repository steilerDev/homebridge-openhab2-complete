'use strict';

const {Accessory} = require('../util/Accessory');
const {addRotationSpeedCharacteristic, addFanOnCharacteristic} = require('./characteristic/SetAndCommitFan');

class FanAccessory extends Accessory {
    _getPrimaryService() {
        this._log.debug(`Creating fan service for ${this.name}`);
        let primaryService = new this.Service.Fan(this.name);
        addFanOnCharacteristic.bind(this)(primaryService);
        addRotationSpeedCharacteristic.bind(this)(primaryService);
        return primaryService;
    }
}

const type = "fan";

function createAccessory(platform, config) {
    return new FanAccessory(platform, config, 'Fan');
}

module.exports = {createAccessory, type};
