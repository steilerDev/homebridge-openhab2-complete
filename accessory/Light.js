'use strict';

const {Accessory} = require('../util/Accessory');
const {addLightOnCharacteristic, addHueCharacteristic, addSaturationCharacteristic, addBrightnessCharacteristic} = require('./characteristic/Light');

class LightAccessory extends Accessory {

    constructor(platform, config) {
        super(platform, config);

        // Synchronisation helper
        this._stateLock = false; // This lock will guard the acceptance of new states
        this._commitLock = false; // This lock will guard the commit process

        this._newState = {
            binary: undefined,
            hue: undefined,
            saturation: undefined,
            brightness: undefined
        };

        this._services = [
            this._getAccessoryInformationService('Light'),
            this._getPrimaryService()
        ];

    }

    _getPrimaryService() {
        this._log(`Creating lightbulb service for ${this.name}`);
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

