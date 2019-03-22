'use strict';

const {Accessory} = require('../util/Accessory');
const {addObstructionDetectedCharacteristic} = require('./characteristic/BinarySensor');
const {addCurrentDoorStateCharacteristic, addTargetDoorStateCharacteristic} = require('./characteristic/CurrentTargetPositionDiscrete');

class GarageDoorOpenerAccessory extends Accessory {
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
    return new GarageDoorOpenerAccessory(platform, config, 'Garage Door Opener');
}

module.exports = {createAccessory, type};

