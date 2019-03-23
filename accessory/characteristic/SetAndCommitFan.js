'use strict';

const {addSetAndCommitCharacteristic} = require('./SetAndCommit');

function addFanOnCharacteristic(service) {
    addSetAndCommitCharacteristic.bind(this)(
        service,
        service.getCharacteristic(this.Characteristic.On),
        'binary',
        ['Switch', 'Dimmer', 'Number'],
        _transformation,
        _commitFunction
    );
}

function addRotationSpeedCharacteristic(service) {
    addSetAndCommitCharacteristic.bind(this)(
        service,
        service.getCharacteristic(this.Characteristic.RotationSpeed),
        'speed',
        ['Number', 'Dimmer'],
        _transformation,
        _commitFunction,
        true
    );
}

function _commitFunction(service, type) {
    let command;
    this._stateLock = true;
    if(this._newState["binary"] === undefined &&                              // Checking if at least one of the required states was set
        (type === "Switch" || this._newState["speed"] === undefined)
    ) {
        command = new Error("Race condition! Commit was called before set!");
    } else {
        let binary, speed;

        binary = this._newState["binary"] !== undefined ?
            this._newState["binary"] :
            service.getCharacteristic(this.Characteristic.On).value;
        if (type !== "Switch") {
            speed = this._newState["speed"] !== undefined ?
                this._newState["speed"] :
                service.getCharacteristic(this.Characteristic.RotationSpeed).value;
        }

        if(binary === undefined && speed === undefined) {
            command = new Error("Unable to commit state, since necessary information are missing");
        } else if (speed === undefined) {
            if(type === "Switch") {
                command = binary ? "ON" : "OFF";
            } else {
                command = binary ? "100" : "0";
            }
        } else {
            command = binary ? `${speed}` : "0";
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
            } else if (itemType === "Dimmer" || itemType === "Number") {
                return parseInt(state) > 0;
            } else {
                return new Error(`Unable to parse binary state: ${state}`);
            }
        case "speed": // expects number and only called by dimmer or color types
            if (itemType === "Dimmer" || itemType === "Number") {
                return parseInt(state) === 99 ? 100 : state;                                              // For some reasons openHAB does not report 100
            } else {
                return new Error(`Unable to parse brightness state: ${state}`);
            }
        default:
            return new Error(`${stateType} unknown`);
    }
}

module.exports = {addFanOnCharacteristic, addRotationSpeedCharacteristic};