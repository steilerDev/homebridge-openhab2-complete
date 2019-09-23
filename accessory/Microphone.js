'use strict';

const {Accessory} = require('../util/Accessory');
const {addMuteCharacteristic, addVolumeCharacteristic} = require('./characteristic/Audio');

class MicrophoneAccessory extends Accessory {
    constructor(platform, config) {
        super(platform, config);
        this._services.unshift(this._getAccessoryInformationService('Microphone'));
        this._services.push(this._getPrimaryService());
    }

    _getPrimaryService() {
        this._log.debug(`Creating Microphone service for ${this.name}`);
        let primaryService = new this.Service.Microphone(this.name);
        addMuteCharacteristic.bind(this)(primaryService);
        addVolumeCharacteristic.bind(this)(primaryService);
        return primaryService;
    }
}

const type = "microphone";

function createAccessory(platform, config) {
    return new MicrophoneAccessory(platform, config);
}

module.exports = {createAccessory, type};

