'use strict';

const {Accessory} = require('../util/Accessory');
const {addObstructionDetectedCharacteristic} = require('./characteristic/Binary');
const {addCurrentDoorStateCharacteristic, addTargetDoorStateCharacteristic} = require('./characteristic/CurrentTargetPositionDiscrete');

class GarageDoorOpenerAccessory extends Accessory {

    constructor(platform, config) {
        super(platform, config);

        // Services will be retrieved by homebridge
        this._services = [
            this._getAccessoryInformationService('Garage Door Opener'),
            this._getPrimaryService()
        ]
    }

    _getPrimaryService() {
        this._log.debug(`Creating garage door opener service for ${this.name}`);
        let primaryService = new this.Service.GarageDoorOpener(this.name);
        addCurrentDoorStateCharacteristic.bind(this)(primaryService);
        addTargetDoorStateCharacteristic.bind(this)(primaryService);
        addObstructionDetectedCharacteristic.bind(this)(primaryService);
        return primaryService;
    }
}

const type = "garage";

function createAccessory(platform, config) {
    return new GarageDoorOpenerAccessory(platform, config);
}

module.exports = {createAccessory, type};

