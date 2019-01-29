
const {getState} = require('../../util/Accessory')

const LIGHT_CONFIG = {
    item: "item"
};

function addLightOnCharacteristic(service) {
    _addLightCharacteristic.bind(this)(service, this.Characteristic.On, 'binary', ['Switch', 'Dimmer', 'Color']);
}

function addHueCharacteristic(service) {
    _addLightCharacteristic.bind(this)(service, this.Characteristic.Hue, 'hue', ['Color'], true);
}

function addSaturationCharacteristic(service) {
    _addLightCharacteristic.bind(this)(service, this.Characteristic.Saturation, 'saturation', ['Color'], true);
}

function addBrightnessCharacteristic(service) {
    _addLightCharacteristic.bind(this)(service, this.Characteristic.Brightness, 'brightness', ['Color', 'Dimmer'], true);
}

// characteristicType: either `binary`, `hue`, `saturation` or `brightness`
function _addLightCharacteristic(service, characteristic, characteristicType, expectedItems, optional) {
    try {
        let [item, type] = this._getAndCheckItemType(LIGHT_CONFIG.item, expectedItems);

        this._log.debug(`Creating ${characteristicType} characteristic for ${this.name} with item ${item}`);

        service.getCharacteristic(characteristic)
            .on('set', _setState.bind(this, characteristicType))
            .on('set', _commitState.bind(this, item))
            .on('get', getState.bind(this,
                item,
                _transformation.bind(this, characteristicType, type)
            ));

        this._subscribeCharacteristic(service,
            characteristic,
            item,
            _transformation.bind(this, characteristicType, type)
        );

    } catch(e) {
        let msg = `Not configuring ${characteristicType} characteristic for ${this.name}: ${e.message}`;
        if (optional) {
            this._log.debug(msg);
        } else {
            throw new Error(msg);
        }
    }
}

// Set the state unless it's locked
function _setState(stateType, value) {
    this._log.debug(`Change ${stateType} target state of ${this.name} to ${value}`);
    if (!(this._stateLock)) {
        this._newState[stateType] = value;
    }
}


// Wait for all states to be set (250ms should be sufficient) and then commit once
function _commitState(item, value, callback) {
    if(this._commitLock) {
        this._log.debug(`Not executing commit due to commit lock`);
        callback();
    } else {
        this._commitLock = true;
        setTimeout(function () {
            this._stateLock = true;
            let command;
            if(this._newState["brightness"] === undefined && this._newState["hue"] === undefined && this._newState["saturation"] === undefined) {           // Only binary set
                if(this._newState["binary"] === undefined) {
                    command = new Error("Race condition! Commit was called before set!")
                } else {
                    command = this._newState["binary"] ? "ON" : "OFF";
                }
            } else if(this._newState["hue"] === undefined && this._newState["saturation"] === undefined) {                                                  // Only brightness set
                if (this._newState["brightness"] === undefined) {
                    command = new Error("Race condition! Commit was called before set!");
                } else {
                    command = `${this._newState["brightness"] === 100 ? 99 : this._newState["brightness"]}`;
                }
            } else {                                                                                                                                         // Either hue, brightness and/or saturation set, therefore we need to send a tuple
                if(this._newState["hue"] !== undefined && this._newState["brightness"] !== undefined && this._newState["saturation"] !== undefined) {        // All states set, no need to get missing information
                    command = `${this._newState["hue"]},${this._newState["saturation"]},${this._newState["brightness"]}`;
                } else {                                                                                                                                     // Not all states set , therefore we need to get the current state, in order to get the complete tuple
                    let state = this._openHAB.getStateSync(item);
                    if (!(state)) {
                        command = new Error("Unable to retrieve current state");
                    } else if (state instanceof Error) {
                        command = state;
                    } else {
                        let splitState = state.split(",");
                        command = `${this._newState["hue"] === undefined ? splitState[0] : this._newState["hue"]},\
                                ${this._newState["saturation"] === undefined ? splitState[1] : this._newState["saturation"]},\
                                ${this._newState["brightness"] === undefined ? splitState[2] : this._newState["brightness"]}`.replace(/\s*/g, "");
                    }
                }
            }
            _releaseLocks.bind(this)();
            if(command) {
                if(command instanceof Error) {
                    this._log.error(command.message);
                    callback(command);
                } else {
                    this._log(`Updating state of ${this.name} with item ${item} to ${command}`);
                    this._openHAB.sendCommand(item, command , callback);
                }
            } else {
                callback(new Error("Command was not set"));
            }
        }.bind(this), 250);
    }
}

function _releaseLocks() {
    this._log.debug(`Cleaning up and releasing locks`);
    this._newState = {
        binary: undefined,
        hue: undefined,
        saturation: undefined,
        brightness: undefined
    };
    this._commitLock = false;
    this._stateLock = false;
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
                return parseInt(state) === 99 ? 100 : state;                                              // For some reasons openHAB does not report 100
            } else if (itemType === "Color") {
                return parseInt(state.split(",")[2]) === 99 ? 100 : parseInt(state.split(",")[2]);        // For some reasons openHAB does not report 100
            } else {
                return new Error(`Unable to parse brightness state: ${state}`);
            }
        default:
            return new Error(`${stateType} unknown`);
    }
}

module.exports = {addLightOnCharacteristic, addHueCharacteristic, addSaturationCharacteristic, addBrightnessCharacteristic};