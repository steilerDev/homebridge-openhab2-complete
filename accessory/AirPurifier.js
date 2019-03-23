'use strict';

const {Accessory} = require('../util/Accessory');
const {addSwingModeCharacteristic, addActiveCharacteristic} = require('./characteristic/BinarySensor');
const {addRotationSpeedCharacteristic} = require('./characteristic/Climate');
const {
    addCurrentAirPurifierStateCharacteristic,
    addTargetAirPurifierStateCharacteristic
} = require('./characteristic/ClimateAirPurifier');

class AirPurifierAccessory extends Accessory {

    constructor(platform, config) {
        super(platform, config);
        this._services.push([
            this._getAccessoryInformationService('Air Purifier'),
            this._getPrimaryService()
        ]);
    }

    _getPrimaryService() {
        this._log.debug(`Creating Air Purifier service for ${this.name}`);
        let primaryService = new this.Service.AirPurifier(this.name);
        addActiveCharacteristic.bind(this)(primaryService);
        addCurrentAirPurifierStateCharacteristic.bind(this)(primaryService);
        addTargetAirPurifierStateCharacteristic.bind(this)(primaryService);
        addRotationSpeedCharacteristic.bind(this)(primaryService, true);
        addSwingModeCharacteristic.bind(this)(primaryService, true);
        return primaryService;
    }
}

const type = "airpurifier";

function createAccessory(platform, config) {
    return new AirPurifierAccessory(platform, config);
}

module.exports = {createAccessory, type};

