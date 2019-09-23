'use strict';

const {Accessory} = require('../util/Accessory');
const {addCurrentSlatState,
    addCurrentSlatTiltCharacteristic,
    addTargetSlatTiltCharacteristic,
    addSlatTypeCharacteristic
} = require('./characteristic/Slat');

class SlatAccessory extends Accessory {

    constructor(platform, config) {
        super(platform, config);
        this._services.unshift(this._getAccessoryInformationService('Slat'));
        this._services.push(this._getPrimaryService());
    }

    _getPrimaryService() {
        this._log.debug(`Creating slat service for ${this.name}`);
        let primaryService = new this.Service.Slat(this.name);
        addCurrentSlatState.bind(this)(primaryService);
        addTargetSlatTiltCharacteristic.bind(this)(primaryService);
        addCurrentSlatTiltCharacteristic.bind(this)(primaryService);
        addSlatTypeCharacteristic.bind(this)(primaryService);
        return primaryService;
    }
}

const type = "slat";

function createAccessory(platform, config) {
    return new SlatAccessory(platform, config);
}

module.exports = {createAccessory, type};
