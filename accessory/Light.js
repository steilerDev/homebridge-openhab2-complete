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
        this._mainService.getCharacteristic(Characteristic.On)
            .on('set', this._setBinaryState.bind(this, this.name, this._habItem))
            .on('get', this._getBinaryState.bind(this, this.name, this._habItem));

        if(this._type !== "Switch") {
            this._mainService.getCharacteristic(Characteristic.Brightness)
                .on('set', this._setBrightnessState.bind(this, this.name, this._habItem))
                .on('get', this._getBrightnessState.bind(this, this.name, this._habItem))
            if(this._type !== "Dimmer") {
                this._mainService.getCharacteristic(Characteristic.Saturation)

                this._mainService.getCharacteristic(Characteristic.Hue)
            }
        }

        return this._mainService;
    }

    _setBinaryState(name, habItem, value, callback) {
        this._log.debug(`Change target state of ${name}/${habItem}) to ${value}`);

        var command;
        if(value === true) {
            command = "ON";
        } else if (value === false) {
            command = "OFF";
        } else {
            this._log.error(`Unable to set state for target value ${value}`);
        }

        this._openHAB.sendCommand(habItem, command, function(error) {
            if(error) {
                this._log.error(`Unable to send command: ${error.message}`);
                callback(error);
            } else {
                this._log.debug(`Changed target state of ${name}`);
                callback();
            }
        }.bind(this));
    }

    _getBinaryState(name, habItem, callback) {
        this._log.debug(`Getting state for ${name}/${habItem}`);
        this._openHAB.getState(habItem, function(error, state) {
            if(error) {
                this._log.error(`Unable to get state: ${error.message}`);
                callback(error);
            } else {
                this._log(`Received state: ${state}`);

                if(state === "ON") {
                    callback(null, true);
                } else if (state === "OFF") {
                    callback(null, false);
                } else {
                    var brightnessValue = parseInt(state);
                    if(brightnessValue instanceof NaN) {
                        callback(null, undefined);
                    } else if (brightnessValue > 0) {
                        callback(null, true);
                    } else {
                        callback(null, false);
                    }
                }
            }
        }.bind(this));
    }

    _setBrightnessState(name, habItem, value, callback) {
        this._log.debug(`Change target state of ${name}/${habItem}) to ${value}`);

        this._openHAB.sendCommand(habItem, value, function(error) {
            if(error) {
                this._log.error(`Unable to send command: ${error.message}`);
                callback(error);
            } else {
                this._log.debug(`Changed target state of ${name}`);
                callback();
            }
        }.bind(this));
    }

    _getBrightnessState(name, habItem, callback) {
        this._log.debug(`Getting state for ${name}/${habItem}`);
        this._openHAB.getState(habItem, function(error, state) {
            if(error) {
                this._log.error(`Unable to get state: ${error.message}`);
                callback(error);
            } else {
                this._log(`Received state: ${state}`);
                callback(null, state);
            }
        }.bind(this));
    }
}

module.exports = LightAccessory;