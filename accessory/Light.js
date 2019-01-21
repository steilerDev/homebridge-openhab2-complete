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
        this._log.debug(`Creating lightbulb switch service for ${this.name}/${this._habItem}`);
        this._mainService = new Service.Lightbulb(this.name);

        // Every light has ON Characteristic
        this._mainService.getCharacteristic(Characteristic.On)
            .on('set', this._setBinaryState.bind(this))
            .on('get', this._getBinaryState.bind(this));

        // Only Dimmer and Color (not Switches) have brightness Characteristic
        if(this._type !== "Switch") {
            this._mainService.getCharacteristic(Characteristic.Brightness)
                .on('set', this._setBrightnessState.bind(this))
                .on('get', this._getBrightnessState.bind(this));
            // Only Color (not Switches and Dimmer) have saturation and hue Characteristic
            if(this._type !== "Dimmer") {
                this._mainService.getCharacteristic(Characteristic.Saturation)
                    .on('set', this._setSaturationState.bind(this))
                    .on('get', this._getSaturationState.bind(this));

                this._mainService.getCharacteristic(Characteristic.Hue)
                    .on('set', this._setHueState.bind(this))
                    .on('get', this._getHueState.bind(this));
            }
        }
        return this._mainService;
    }

    _getState(callback) {
        this._log.debug(`Getting state of ${this.name} [${this._habItem}`);
        this._openHAB.getState(this._habItem, function(error, state) {
            if(error) {
                this._log.error(`Unable to get state: ${error.message}`);
                callback(error);
            } else {
                this._log(`Received state: ${state}`);
                if(this._type === "Switch") {
                    callback ({
                        binaryState: state
                    });
                } else if (this._type === "Dimmer") {
                    let myBinaryState = state > 0 ? "ON" : "OFF";
                    callback({
                        binaryState: myBinaryState,
                        brightnessState: state
                    });
                } else if (this._type === "Color") {
                    let hsbState = state.split(",");
                    if(hsbState.length != 3) {
                        callback(new Error(`Unable to parse HSB state of ${this.name} [${this._habItem}]: ${state}`));
                    } else {
                        let myBinaryState = hsbState[2] > 0 ? "ON": "OFF";
                        callback({
                            binaryState: myBinaryState,
                            hueState: hsbState[0],
                            saturationState: hsbState[1],
                            brightnessState: hsbState[2]
                        });
                    }
                }
            }
        }.bind(this))
    }

    _getBinaryState(callback) {
        this._log.debug(`Getting binary state for ${this.name} [${this._habItem}]`);
        this._getState(function(myState){
            if(myState instanceof Error) {
                this._log.error(`Unable to get binary state for ${this.name} [${this._habItem}]: ${myState.message}`);
                callback(myState);
            } else {
                callback(null, myState.binaryState);
            }
        }.bind(this));
    }

    _getBrightnessState(callback) {
        this._log.debug(`Getting brightness state for ${this.name} [${this._habItem}]`);
        this._getState(function(myState){
            if(myState instanceof Error) {
                this._log.error(`Unable to get brightness state for ${this.name} [${this._habItem}]: ${myState.message}`);
                callback(myState);
            } else {
                callback(null, myState.brightnessState);
            }
        }.bind(this));
    }

    _getSaturationState(callback) {
        this._log.debug(`Getting saturation state for ${this.name} [${this._habItem}]`);
        this._getState(function(myState){
            if(myState instanceof Error) {
                this._log.error(`Unable to get saturation state for ${this.name} [${this._habItem}]: ${myState.message}`);
                callback(myState);
            } else {
                callback(null, myState.saturationState);
            }
        }.bind(this));
    }

    _getHueState(callback) {
        this._log.debug(`Getting hue state for ${this.name} [${this._habItem}]`);
        this._getState(function(myState){
            if(myState instanceof Error) {
                this._log.error(`Unable to get hue state for ${this.name} [${this._habItem}]: ${myState.message}`);
                callback(myState);
            } else {
                callback(null, myState.hueState);
            }
        }.bind(this));
    }

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
                this._log.debug(`Changed target state of ${name}`);
                callback();
            }
        }.bind(this));
    }

    _setBrightnessState(value, callback) {
        this._log.debug(`Change brightness target state of ${this.name} [${this._habItem}] to ${value}`);

        this._openHAB.sendCommand(this._habItem, value, function(error) {
            if(error) {
                this._log.error(`Unable to send command: ${error.message}`);
                callback(error);
            } else {
                this._log.debug(`Changed target state of ${name}`);
                callback();
            }
        }.bind(this));
    }

    _setSaturationState(value, callback) {
        this._log.debug(`Change saturation target state of ${this.name} [${this._habItem}] to ${value}`);
        this.getServices(function (myState) {
            if(myState instanceof Error) {
                this._log.error(`Unable to get state for ${this.name} [${this._habItem}]: ${myState.message}`);
                callback(myState);
            } else {
                this._openHAB.sendCommand(this._habItem, `${myState.hueState},${value},${myState.brightnessState}`, function (error) {
                    if(error) {
                        this._log.error(`Unable to send command: ${error.message}`);
                        callback(error);
                    } else {
                        this._log.debug(`Changed target state of ${name}`);
                        callback();
                    }
                }.bind(this));
            }
        }.bind(this));
    }

    _setHueState(value, callback) {
        this._log.debug(`Change hue target state of ${this.name} [${this._habItem}] to ${value}`);
        this.getServices(function (myState) {
            if(myState instanceof Error) {
                this._log.error(`Unable to get state for ${this.name} [${this._habItem}]: ${myState.message}`);
                callback(myState);
            } else {
                this._openHAB.sendCommand(this._habItem, `${value},${myState.saturationState},${myState.brightnessState}`, function (error) {
                    if(error) {
                        this._log.error(`Unable to send command: ${error.message}`);
                        callback(error);
                    } else {
                        this._log.debug(`Changed target state of ${name}`);
                        callback();
                    }
                }.bind(this));
            }
        }.bind(this));
    }
}

module.exports = LightAccessory;