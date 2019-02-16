'use strict';

const {addNumericSensorActorCharacteristic, addNumericSensorCharacteristic} = require('./Numeric');

const WATERING_CONF = {
    durationItem: "durationItem",
    valveType: "valveType"
};

function addValveTypeCharacteristic(service) {
    if(!(this._config[WATERING_CONF.valveType])) {
        this._log.debug(`${WATERING_CONF.valveType} for ${this.name} not defined in config, using default: ${JSON.stringify(this._config)})`)
    }
    let GENERIC_VALVE = 0;  // = Characteristic.ValveType.GENERIC_VALVE
    let IRRIGATION = 1;     // = Characteristic.ValveType.IRRIGATION
    let SHOWER_HEAD = 2;    // = Characteristic.ValveType.SHOWER_HEAD
    let WATER_FAUCET = 3;   // = Characteristic.ValveType.WATER_FAUCET = 3;
    let type;
    switch(this._config[WATERING_CONF.valveType]) {
        default:
        case "generic":
            type = GENERIC_VALVE;
            break;
        case "irrigation":
            type = IRRIGATION;
            break;
        case "showerhead":
            type = SHOWER_HEAD;
            break;
        case "faucet":
            type = WATER_FAUCET;
            break;
    }

    service.getCharacteristic(this.Characteristic.ValveType)
        .on('get', function(callback) { callback(null, type) });
}

function addDurationCharacteristic(service, optional) {
    addNumericSensorActorCharacteristic(service, service.getCharacteristic(this.Characteristic.SetDuration), {item: WATERING_CONF.durationItem}, optional);
    addNumericSensorCharacteristic(service, service.getCharacteristic(this.Characteristic.RemainingDuration), {item: WATERING_CONF.durationItem}, optional);
}

module.exports = {
    addDurationCharacteristic,
    addValveTypeCharacteristic
};
