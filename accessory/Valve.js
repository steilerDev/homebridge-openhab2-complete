'use strict';

const {Accessory} = require('../util/Accessory');
const {addActiveCharacteristic} = require('./characteristic/Binary');
const {addInUseCharacteristic} = require('./characteristic/InUse');
const {addValveTypeCharacteristic, addDurationCharacteristic} = require('./characteristic/Watering');

class ValveAccessory extends Accessory {
    constructor(platform, config) {
        super(platform, config);
        this._services.unshift(this._getAccessoryInformationService('Valve'));
        this._services.push(this._getPrimaryService());
    }

    _getPrimaryService() {
        this._log.debug(`Creating valve service for ${this.name}`);
        let primaryService = new this.Service.Valve(this.name);
        addActiveCharacteristic.bind(this)(primaryService);
        addInUseCharacteristic.bind(this)(primaryService);
        addValveTypeCharacteristic.bind(this)(primaryService);
        addDurationCharacteristic.bind(this)(primaryService, true);
        return primaryService;
    }
}

const type = "valve";

function createAccessory(platform, config) {
    return new ValveAccessory(platform, config);
}

module.exports = {createAccessory, type};

