'use strict';

const {Accessory} = require('../util/Accessory');
const {
    addLightOnCharacteristic,
    addHueCharacteristic,
    addSaturationCharacteristic,
    addBrightnessCharacteristic
} = require('./characteristic/SetAndCommitLight');

class LightAccessory extends Accessory {

    constructor(platform, config) {
        super(platform, config);
        this._services.push([
            this._getAccessoryInformationService('Light'),
            this._getPrimaryService()
        ]);
    }

    _getPrimaryService() {
        this._log.debug(`Creating lightbulb service for ${this.name}`);
        let primaryService = new this.Service.Lightbulb(this.name);
        addLightOnCharacteristic.bind(this)(primaryService);
        addHueCharacteristic.bind(this)(primaryService);
        addSaturationCharacteristic.bind(this)(primaryService);
        addBrightnessCharacteristic.bind(this)(primaryService);
        return primaryService;
    }

}

const type = "light";

function createAccessory(platform, config) {
    return new LightAccessory(platform, config);
}

module.exports = {createAccessory, type};

