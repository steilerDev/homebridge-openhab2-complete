'use strict';

const {Accessory} = require('../util/Accessory');
const {addCurrentPositionCharacteristic,
    addTargetPositionCharacteristic,
    addPositionStateCharacteristic,
    addHoldPositionCharacteristic,
    addCurrentHorizontalTiltCharacteristic,
    addCurrentVerticalTiltCharacteristic,
    addTargetHorizontalTiltCharacteristic,
    addTargetVerticalTiltCharacteristic
} = require('./characteristic/CurrentTargetPosition');

class WindowCoveringAccessory extends Accessory {

    constructor(platform, config) {
        super(platform, config);
        this._services.unshift(this._getAccessoryInformationService('Window Covering'));
        this._services.push(this._getPrimaryService());
    }

    _getPrimaryService() {
        this._log.debug(`Creating window covering service for ${this.name}`);
        let primaryService = new this.Service.WindowCovering(this.name);
        addCurrentPositionCharacteristic.bind(this)(primaryService);
        addTargetPositionCharacteristic.bind(this)(primaryService);
        addPositionStateCharacteristic.bind(this)(primaryService);
        addHoldPositionCharacteristic.bind(this)(primaryService);
        addCurrentHorizontalTiltCharacteristic.bind(this)(primaryService);
        addCurrentVerticalTiltCharacteristic.bind(this)(primaryService);
        addTargetHorizontalTiltCharacteristic.bind(this)(primaryService);
        addTargetVerticalTiltCharacteristic.bind(this)(primaryService);
        return primaryService;
    }
}

const type = "windowcovering";

function createAccessory(platform, config) {
    return new WindowCoveringAccessory(platform, config);
}

module.exports = {createAccessory, type};

