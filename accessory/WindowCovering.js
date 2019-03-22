'use strict';

const {Accessory} = require('../util/Accessory');
const {addCurrentPositionCharacteristic, addTargetPositionCharacteristic, addPositionStateCharacteristic, addHoldPositionCharacteristic} = require('./characteristic/CurrentTargetPosition');

class WindowCoveringAccessory extends Accessory {
    _getPrimaryService() {
        this._log.debug(`Creating window covering service for ${this.name}`);
        let primaryService = new this.Service.WindowCovering(this.name);
        addCurrentPositionCharacteristic.bind(this)(primaryService);
        addTargetPositionCharacteristic.bind(this)(primaryService);
        addPositionStateCharacteristic.bind(this)(primaryService);
        addHoldPositionCharacteristic.bind(this)(primaryService);
        return primaryService;
    }
}

const type = "windowcovering";

function createAccessory(platform, config) {
    return new WindowCoveringAccessory(platform, config, 'WindowCovering');
}

module.exports = {createAccessory, type};

