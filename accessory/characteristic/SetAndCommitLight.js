'use strict';

const {addSetAndCommitCharacteristic} = require('./SetAndCommit');

function addLightOnCharacteristic(service) {
    addSetAndCommitCharacteristic.bind(this)(
        service,
        service.getCharacteristic(this.Characteristic.On),
        'binary',
        ['Switch', 'Dimmer', 'Color'],
        _transformation,
        _commitFunction
    );
}

function addHueCharacteristic(service) {
    addSetAndCommitCharacteristic.bind(this)(
        service,
        service.getCharacteristic(this.Characteristic.Hue),
        'hue',
        ['Color'],
        _transformation,
        _commitFunction,
        true
    );
}

function addSaturationCharacteristic(service) {
    addSetAndCommitCharacteristic.bind(this)(
        service,
        service.getCharacteristic(this.Characteristic.Saturation),
        'saturation',
        ['Color'],
        _transformation,
        _commitFunction,
        true
    );
}

function addBrightnessCharacteristic(service) {
    addSetAndCommitCharacteristic.bind(this)(
        service,
        service.getCharacteristic(this.Characteristic.Brightness),
        'brightness',
        ['Dimmer', 'Color'],
        _transformation,
        _commitFunction,
        true
    );
}

function _commitFunction(service, type) {
    let command;
    this._stateLock = true;
    if(this._newState["binary"] === undefined &&                              // Checking if at least one of the required states was set
        (type === "Switch" || this._newState["brightness"] === undefined) &&
        (type !== "Color" || this._newState["hue"] === undefined) &&
        (type !== "Color" || this._newState["saturation"] === undefined)
    ) {
        command = new Error("Race condition! Commit was called before set!");
    } else {
        let binary, hue, saturation, brightness;
        this._log.debug(`Received commit with object ${JSON.stringify(this._newState)}`);

        binary = this._newState["binary"] !== undefined ?
            this._newState["binary"] :
            service.getCharacteristic(this.Characteristic.On).value;
        if (type !== "Switch") {
            brightness = this._newState["brightness"] !== undefined ?
                this._newState["brightness"] :
                service.getCharacteristic(this.Characteristic.Brightness).value;

            if (type === "Color") {
                hue = this._newState["hue"] !== undefined ?
                    this._newState["hue"] :
                    service.getCharacteristic(this.Characteristic.Hue).value;

                saturation = this._newState["saturation"] !== undefined ?
                    this._newState["saturation"] :
                    service.getCharacteristic(this.Characteristic.Saturation).value;
            }
        }

        this._log.debug(`Committing light state with vectors (B,H,S,B): ${binary},${hue},${saturation},${brightness}`);
        if(binary === undefined && hue === undefined && saturation === undefined && brightness === undefined) {
            command = new Error("Unable to commit state, since necessary information are missing");
        } else if (hue === undefined && saturation === undefined && brightness === undefined) {
            command = binary ? "ON" : "OFF";
        } else if (hue === undefined && saturation === undefined) {
            this._log.error(`Using config: ${this._config.sendOnOnlyWhenOff}`)
            if(binary && (brightness === 0 || brightness === 100) && (this._config.sendOnOnlyWhenOff == undefined || this._config.sendOnOnlyWhenOff === "false" || !(service.getCharacteristic(this.Characteristic.On).value))) { // For some reaason when invoking Siri to turn on a light brightness is sometimes set to '0'
                command = "ON";
            } else {
                command = binary ? `${brightness}` : "OFF";
            }
        } else {
            this._log.error(`Using config: ${this._config.sendOnOnlyWhenOff}`)
            if(binary && (brightness === 0 || brightness === 100) && (this._config.sendOnOnlyWhenOff == undefined || this._config.sendOnOnlyWhenOff === "false" || !(service.getCharacteristic(this.Characteristic.On).value))) { // For some reaason when invoking Siri to turn on a light brightness is sometimes set to '0'
                command = "ON";
            } else {
                command = binary ? `${hue},${saturation},${brightness}` : "OFF";
            }
        }
    }
    return command;
}

// characteristic
function _transformation(stateType, itemType, state) {
    switch (stateType) {
        case "binary": // expects true or false
            if (itemType === "Switch") {
                return state === "ON";
            } else if (itemType === "Dimmer") {
                return parseInt(state) > 0;
            } else if (itemType === "Color") {
                return parseInt(state.split(",")[2]) > 0;
            } else {
                return new Error(`Unable to parse binary state: ${state}`);
            }
        case "hue": // expects number and only called by color types
            if (itemType === "Color") {
                return parseInt(state.split(",")[0]);
            } else {
                return new Error(`Unable to parse hue state: ${state}`);
            }
        case "saturation": // expects number and only called by color types
            if (itemType === "Color") {
                return parseInt(state.split(",")[1]);
            } else {
                return new Error(`Unable to parse saturation state: ${state}`);
            }
        case "brightness": // expects number and only called by dimmer or color types
            if (itemType === "Dimmer") {
                return parseInt(state);
            } else if (itemType === "Color") {
                return parseInt(state.split(",")[2]);
            } else {
                return new Error(`Unable to parse brightness state: ${state}`);
            }
        default:
            return new Error(`${stateType} unknown`);
    }
}

module.exports = {addLightOnCharacteristic, addHueCharacteristic, addSaturationCharacteristic, addBrightnessCharacteristic};
