'use strict';

const {addNumericSensorActorCharacteristic, addNumericSensorCharacteristic} = require('./Numeric');

const WATERING_CONF = {
    durationItem: "durationItem",
    valveType: "valveType",
    programMode: "programMode",
    programModeItem: "programModeItem"
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
    addNumericSensorActorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.SetDuration), {item: WATERING_CONF.durationItem}, optional);
    addNumericSensorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.RemainingDuration), {item: WATERING_CONF.durationItem}, optional);
}

function addProgramModeCharacteristic(service, optional) {
    if(this._config[WATERING_CONF.programModeItem]) {
        addNumericSensorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.ProgramMode), {item: WATERING_CONF.programModeItem}, optional);
    } else {
        let NO_PROGRAM_SCHEDULED = 0;               // = Characteristic.ProgramMode.NO_PROGRAM_SCHEDULED
        let PROGRAM_SCHEDULED = 1;                  // = Characteristic.ProgramMode.PROGRAM_SCHEDULED
        let PROGRAM_SCHEDULED_MANUAL_MODE_ = 2;     // = Characteristic.ProgramMode.PROGRAM_SCHEDULED_MANUAL_MODE_
        let programMode;
        switch (this._config[WATERING_CONF.programMode]) {
            default:
            case "noprogram":
                programMode = NO_PROGRAM_SCHEDULED;
                break;
            case "scheduled":
                programMode = PROGRAM_SCHEDULED;
                break;
            case "manual":
                programMode = PROGRAM_SCHEDULED_MANUAL_MODE_;
                break;
        }
        service.getCharacteristic(this.Characteristic.ProgramMode)
            .on('get', function(callback) { callback(null, programMode) });
    }

}

module.exports = {
    addDurationCharacteristic,
    addValveTypeCharacteristic,
    addProgramModeCharacteristic
};
