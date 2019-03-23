'use strict';

const {Accessory} = require('../util/Accessory');
const {addActiveCharacteristic} = require('./characteristic/BinarySensor');
const {addInUseCharacteristic} = require('./characteristic/InUse');
const {addProgramModeCharacteristic, addDurationCharacteristic} = require('./characteristic/Watering');

class IrrigationSystemAccessory extends Accessory {

    constructor(platform, config) {
        super(platform, config);
        this._services.push([
            this._getAccessoryInformationService('Irrigation System'),
            this._getPrimaryService()
        ]);
    }

    _getPrimaryService() {
        this._log.debug(`Creating irrigation system service for ${this.name}`);
        let primaryService = new this.Service.IrrigationSystem(this.name);
        addActiveCharacteristic.bind(this)(primaryService);
        addInUseCharacteristic.bind(this)(primaryService);
        addProgramModeCharacteristic.bind(this)(primaryService);
        addDurationCharacteristic.bind(this)(primaryService, true);
        return primaryService;
    }
}

const type = "irrigation";

function createAccessory(platform, config) {
    return new IrrigationSystemAccessory(platform, config);
}

module.exports = {createAccessory, type};

