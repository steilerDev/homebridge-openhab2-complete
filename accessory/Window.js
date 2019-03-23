'use strict';

const {Accessory} = require('../util/Accessory');
const {
    addCurrentPositionCharacteristic,
    addTargetPositionCharacteristic,
    addPositionStateCharacteristic,
    addHoldPositionCharacteristic
} = require('./characteristic/CurrentTargetPosition');

class WindowAccessory extends Accessory {

    constructor(platform, config) {
        super(platform, config);
        this._services.push([
            this._getAccessoryInformationService('Window'),
            this._getPrimaryService()
        ]);
    }

    _getPrimaryService() {
        this._log.debug(`Creating window service for ${this.name}`);
        let primaryService = new this.Service.Window(this.name);
        addCurrentPositionCharacteristic.bind(this)(primaryService);
        addTargetPositionCharacteristic.bind(this)(primaryService);
        addPositionStateCharacteristic.bind(this)(primaryService);
        addHoldPositionCharacteristic.bind(this)(primaryService);
        return primaryService;
    }
}

const type = "window";

function createAccessory(platform, config) {
    return new WindowAccessory(platform, config);
}

module.exports = {createAccessory, type};

