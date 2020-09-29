'use strict';

const {Accessory} = require('../util/Accessory');
const {addMuteCharacteristic, addVolumeCharacteristic} = require('./characteristic/Audio');

class SpeakerAccessory extends Accessory {
    constructor(platform, config) {
        super(platform, config);
        this._services.unshift(this._getAccessoryInformationService('Speaker'));
        this._services.push(this._getPrimaryService());
    }

    _getPrimaryService() {
        this._log.debug(`Creating Speaker service for ${this.name}`);
        let primaryService = new this.Service.TelevisionSpeaker(this.name);
        addMuteCharacteristic.bind(this)(primaryService);
        addVolumeCharacteristic.bind(this)(primaryService);
        return primaryService;
    }
}

const type = "speaker";

function createAccessory(platform, config) {
    return new SpeakerAccessory(platform, config);
}

module.exports = {createAccessory, type};

