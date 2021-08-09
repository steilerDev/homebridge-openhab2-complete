'use strict';

const {addNumericSensorActorCharacteristic, addNumericSensorCharacteristic} = require('./Numeric');

const WATERING_CONF = {
    durationItem: "durationItem",
    durationItemMax: "durationItemMax",
    valveType: "valveType"
};

let DEFAULT_MAX_DURATION = 3600;

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
    let thisMax = this._config[WATERING_CONF.durationItemMax] !== undefined ? parseFloat(this._config[WATERING_CONF.durationItemMax]) : DEFAULT_MAX_DURATION;
    let setDurationCharacteristic = service.getCharacteristic(this.Characteristic.SetDuration);
    let remainingDurationCharacteristic = service.getCharacteristic(this.Characteristic.RemainingDuration);

    setDurationCharacteristic.setProps({
        maxValue: thisMax
    });

    remainingDurationCharacteristic.setProps({
        maxValue: thisMax
    });

    addNumericSensorActorCharacteristic.bind(this)(service, setDurationCharacteristic, {item: WATERING_CONF.durationItem}, optional);
    addNumericSensorCharacteristic.bind(this)(service, remainingDurationCharacteristic, {item: WATERING_CONF.durationItem}, optional);
}

module.exports = {
    addDurationCharacteristic,
    addValveTypeCharacteristic
};
