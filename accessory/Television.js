'use strict';

const {Accessory} = require('../util/Accessory');
const {addMuteCharacteristic, addVolumeCharacteristic,addActiveIdentifier,addConfiguredName,addRemoteKey,addSleepDiscoveryMode} = require('./characteristic/Audio');
const {addActiveCharacteristic} = require('./characteristic/Binary');

class TelevisionAccessory extends Accessory {
    constructor(platform, config) {
        super(platform, config);
        this.category = this.Categories.TELEVISION;
        this._services.unshift(this._getAccessoryInformationService('Television'));
        this._services.push(this._getPrimaryService(), this._getSpeakerService());
    }

    _getPrimaryService() {
        this._log.debug(`Creating Television service for ${this.name}`);
        let primaryService = new this.Service.Television(this.name);
        addActiveCharacteristic.bind(this)(primaryService);
        addActiveIdentifier.bind(this)(primaryService);
        addConfiguredName.bind(this)(primaryService);
        addConfiguredName.bind(this)(primaryService);
        addRemoteKey.bind(this)(primaryService);
        addSleepDiscoveryMode.bind(this)(primaryService);
        return primaryService;
    }

    _getSpeakerService() {
        this._log.debug(`Creating speaker service for television for ${this.name}`);
        let speakerService = new this.Service.TelevisionSpeaker(this.name);
        addMuteCharacteristic.bind(this)(speakerService);
        addVolumeCharacteristic.bind(this)(speakerService);
        return speakerService ;
    }
}

const type = "television";

function createAccessory(platform, config) {
    return new TelevisionAccessory(platform, config);
}

module.exports = {createAccessory, type};

