'use strict';

let Accessory, Characteristic, Service;

class LightAccessory {

    constructor(platform, config) {
        this._log = platform["log"];
        this._log.debug(`Creating new light accessory: ${config.name}`);

        Accessory = platform["api"].hap.Accessory;
        Characteristic = platform["api"].hap.Characteristic;
        Service = platform["api"].hap.Service;

        this._config = config;
        this._openHAB = platform["openHAB"];
        this.name = config.name;
        this.uuid_base = config.serialNumber;

        if(!(this._config.habItem)) {
            throw new Error(`Required habItem not defined: ${util.inspect(acc)}`)
        } else {
            this._habItem = config.habItem;
        }

        this._type = this._openHAB.getItemType(this._habItem);
        if(this._type instanceof Error) {
            throw this._type;
        } else if(!(this._type === "Switch" ||
            this._type === "Dimmer" ||
            this._type === "Color")) {
            throw new Error(`${this._habItem}'s type (${this._type}) is not as expected ('Switch', 'Dimmer' or 'Color')`);
        }

        this._services = [
            this._getAccessoryInformationService(),
            this._getLightbulbService()
        ];

    }

    // Called by homebridge
    identify(callback) {
        this._log.debug(`Identify request received!`);
        callback();
    }

    // Called by homebridge
    getServices() {
        this._log.debug("Getting services");
        return this._services;
    }

    _getAccessoryInformationService() {
        return new Service.AccessoryInformation()
            .setCharacteristic(Characteristic.Name, this.name)
            .setCharacteristic(Characteristic.Manufacturer, 'steilerDev')
            .setCharacteristic(Characteristic.Model, 'Light')
            .setCharacteristic(Characteristic.SerialNumber, this._config.serialNumber)
            .setCharacteristic(Characteristic.FirmwareRevision, this._config.version)
            .setCharacteristic(Characteristic.HardwareRevision, this._config.version);
    }

    _getLightbulbService() {
        this._log.debug(`Creating lightbulb service for ${this.name}/${this._habItem}`);
        this._mainService = new Service.Lightbulb(this.name);

        switch (this._type) {
            case "Switch": // Switch only has ON Characteristic
                this._mainService.getCharacteristic(Characteristic.On)
                    .on('set', this._setBinaryState.bind(this))
                    .on('get', this._getState.bind(this, "binary"));
                break;
            case "Dimmer": // Dimmer has ON and Brightness Characteristic, not setting ON Characteristic due to double call
                this._mainService.getCharacteristic(Characteristic.On)
                    .on('set', function(){})
                    .on('get', this._getState.bind(this, "binary"));

                this._mainService.getCharacteristic(Characteristic.Brightness)
                    .on('set', this._setBrightnessState.bind(this))
                    .on('get', this._getState.bind(this, "brightness"));
                break;
            case "Color":
                // Synchronisation helper for complex HSB type
                this._stateLock = false; // This lock will guard the acceptance of new states
                this._commitLock = false; // This lock will guard the commit process

                this._newState = {
                    hue: undefined,
                    saturation: undefined,
                    brightness: undefined
                };

                this._mainService.getCharacteristic(Characteristic.On)
                    .on('set', function(){})
                    .on('get', this._getState.bind(this, "binary"));

                this._mainService.getCharacteristic(Characteristic.Brightness)
                    .on('set', this._setHSBState.bind(this, "brightness"))
                    .on('set', this._commitHSBState.bind(this))
                    .on('get', this._getState.bind(this, "brightness"));

                this._mainService.getCharacteristic(Characteristic.Saturation)
                    .on('set', this._setHSBState.bind(this, "saturation"))
                    .on('set', this._commitHSBState.bind(this))
                    .on('get', this._getState.bind(this, "saturation"));

                this._mainService.getCharacteristic(Characteristic.Hue)
                    .on('set', this._setHSBState.bind(this, "hue"))
                    .on('set', this._commitHSBState.bind(this))
                    .on('get', this._getState.bind(this, "hue"));
        }
        return this._mainService;
    }

    _getState(stateType, callback) {
        this._log.debug(`Getting state of ${this.name} [${this._habItem}]`);
        this._openHAB.getState(this._habItem, function(error, state) {
            if(error) {
                this._log.error(`Unable to get state: ${error.message}`);
                callback(error);
            } else {
                this._log(`Received state: ${state}`);

                switch(stateType) {
                    case "binary":
                        if(this._type === "Switch") {
                            callback(null, state === "ON");
                        } else if (this._type === "Dimmer") {
                            callback(null, state > 0);
                        } else if (this._type === "Color") {
                            callback(null, state.split(",")[2] > 0);
                        } else {
                            callback (new Error(`Unable to parse binary state: ${state}`));
                        }
                        break;
                    case "brightness":
                        if(this._type === "Dimmer") {
                            callback(null, state);
                        } else if(this._type === "Color") {
                            callback(null, state.split(",")[2]);
                        } else {
                            callback (new Error(`Unable to parse brightness state: ${state}`));
                        }
                        break;
                    case "hue":
                        if(this._type ===  "Color") {
                            callback(null, state.split(",")[0]);
                        } else {
                            callback (new Error(`Unable to parse hue state: ${state}`));
                        }
                        break;
                    case "saturation":
                        if(this._type ===  "Color") {
                            callback(null, state.split(",")[1]);
                        } else {
                            callback (new Error(`Unable to parse saturation state: ${state}`));
                        }
                        break;
                    case "hsb":
                        if(this._type === "Switch") {
                            callback(null, {
                                hue: 0,
                                saturation: 0,
                                brightness: state === "ON" ? 100 : 0
                            });
                        } else if (this._type === "Dimmer") {
                            callback(null, {
                                hue: 0,
                                saturation: 0,
                                brightness: state
                            });
                        } else if (this._type === "Color") {
                            let myState = state.split(",");
                            callback(null, {
                                hue: myState[0],
                                saturation: myState[1],
                                brightness: myState[2]
                            });
                        }
                        break;
                    default:
                        callback(new Error(`${stateType} unknown`));
                        break;
                }
            }
        }.bind(this));
    }

    // Only used with "Switch" type
    _setBinaryState(value, callback) {
        this._log.debug(`Change binary target state of ${this.name} [${this._habItem}] to ${value}`);

        let command;
        if(value === true) {
            command = "ON";
        } else if (value === false) {
            command = "OFF";
        } else {
            this._log.error(`Unable to set state for target value ${value}`);
        }

        this._openHAB.sendCommand(this._habItem, command, function(error) {
            if(error) {
                this._log.error(`Unable to send command: ${error.message}`);
                callback(error);
            } else {
                this._log.debug(`Changed target state of ${this.name}`);
                callback();
            }
        }.bind(this));
    }

    // Only used with "Dimmer" type
    _setBrightnessState(value, callback) {
        this._log.debug(`Change brightness target state of ${this.name} [${this._habItem}] to ${value}`);

        this._openHAB.sendCommand(this._habItem, `${value}`, function(error) {
            if(error) {
                this._log.error(`Unable to send command: ${error.message}`);
                callback(error);
            } else {
                this._log.debug(`Changed target state of ${this.name}`);
                callback();
            }
        }.bind(this));
    }

    // Only used with "Color" type
    _setHSBState(stateType, value, callback) {
        this._log.debug(`Change ${stateType} target state of ${this.name} [${this._habItem}] to ${value}`);
        if (!(this._stateLock)) {
            this._newState[stateType] = value;
            callback();
        }
    }

    // Only used with "Color" type
    _commitHSBState(_, callback) {
        let cleanup = function(error) {
            this._log.debug(`Cleaning up and releasing locks`);
            this._newState = {
                hue: undefined,
                saturation: undefined,
                brightness: undefined
            };
            this._commitLock = false;
            this._stateLock = false;
            callback(error);
        }.bind(this);

        if(this._commitLock) {
            this._log.debug(`Not executing commit due to commit lock`);
        } else {
            this._commitLock = true;
            setTimeout(function () {
                this._stateLock = true;
                if(this._newState["hue"] !== undefined &&
                    this._newState["brightness"] !== undefined &&
                    this._newState["saturation"] !== undefined
                ) { // All states set
                    this._log.debug(`All states are set, updating ${this._habItem} to ${this._newState}`);
                    this._openHAB.sendCommand(
                        this._habItem,
                        `${this._newState["hue"]},${this._newState["saturation"]},${this._newState}`,
                        cleanup
                    );
                } else { // We need to gather current states first
                    this._getState("hsb", function(error, value) {
                        if(error) {
                            this._log.error(`Unable to get state of ${this._habItem}: ${error.message}`)
                        } else {
                            if(this._newState["hue"] === undefined) {
                                this._log.debug(`Setting undefined hue value to ${value["hue"]}`);
                                this._newState["hue"] = value["hue"];
                            }
                            if(this._newState["brightness"] === undefined) {
                                this._log.debug(`Setting undefined brightness value to ${value["brightness"]}`);
                                this._newState["brightness"] = value["brightness"];
                            }
                            if(this._newState["saturation"] === undefined) {
                                this._log.debug(`Setting undefined saturation value to ${value["saturation"]}`);
                                this._newState["saturation"] = value["saturation"];
                            }
                            this._log.debug(`Updating ${this._habItem} to ${this._newState}`);
                            this._openHAB.sendCommand(
                                this._habItem,
                                `${this._newState["hue"]},${this._newState["saturation"]},${this._newState}`,
                                cleanup
                            );
                        }
                    }.bind(this))
                }
            }.bind(this), 500)
        }
    }
}

module.exports = LightAccessory;