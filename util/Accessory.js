'use strict';

let PLATFORM = {
    log: "log",
    api: "api",
    hap: "hap",
    openHAB: "openHAB"
};

const {addBatteryLevelCharacteristic, addChargingStateCharacteristic, addBatteryWarningCharacteristic} = require('../accessory/characteristic/Battery');
const {transformValue} = require('./Util');

class Accessory {
    constructor(platform, config) {
        this._log = platform[PLATFORM.log];
        this._log.debug(`Creating new accessory: ${config.name}`);

        this.Characteristic = platform[PLATFORM.api][PLATFORM.hap].Characteristic;
        this.Service = platform[PLATFORM.api][PLATFORM.hap].Service;
        this.Categories = platform[PLATFORM.api][PLATFORM.hap].Categories;
        this.API = platform[PLATFORM.api];

        this._config = config;
        this._openHAB = platform[PLATFORM.openHAB];
        this.name = config.name;
        this.uuid_base = config.serialNumber;

        this._services = [];

        let batteryService = this._tryBatteryService();
        if(batteryService !== null) {
            this._services.push(batteryService);
        }
    }

    // Called by homebridge
    identify(callback) {
        this._log.debug(`Identify request received for: ${JSON.stringify(this._config)}`);
        callback();
    }

    // Called by homebridge
    getServices() {
        this._log.debug(`Getting services for ${this.name} (${this._services.length} service(s) registered for this accessory`);
        //this._log.debug(`Registered services: ${JSON.stringify(this._services, ['displayName', 'UUID', 'characteristics', 'value', 'optionalCharacteristics', 'isHiddenService', 'isPrimaryService'], 4)}`);
        return this._services;
    }

    _subscribeCharacteristic(characteristic, item, transformation, callback) {
        this._log.debug(`Subscribing to changes for ${item}`);
        this._openHAB.subscribe(item, function(value, habItem) {
            if(value instanceof Error) {
                this._log.error(`Error subscribing for ${item}: ${value.message}`);
            } else {
                this._log.info(`Received push with new state for item ${habItem}: ${value}`);
                let transformedValue = transformValue(transformation, value);
                if(transformedValue !== null) {
                    // Setting value for the stored characteristic, but not executing it agains openHAB
                    this._log.info(`Setting new transformed state for item ${habItem}: ${transformedValue}`);
                    characteristic.setValue(transformedValue, null, "openHABIgnore");
                    if(callback && typeof(callback) === "function") {
                        this._log.debug(`Executing callback`);
                        callback(transformedValue);
                    } else {
                        this._log.debug(`No callback to execute`);
                    }
                }
            }
        }.bind(this));
    }

    _getAndCheckItemType(key, expectedItems, optional) {
        if(!(this._config[key])) {
            if(optional) {
                this._log.debug(`${key} for ${this.name} not defined in config: ${JSON.stringify(this._config)})`)
            } else {
                throw new Error(`Required ${key} for ${this.name} not defined: ${JSON.stringify(this._config)}`)
            }
        } else {
            let item = this._config[key];
            let type = this._openHAB.getItemType(item);
            if (!type || type instanceof Error) {
                if(optional) {
                    this._log.debug(`Not adding ${key} to ${this.name}: ${type ? type.message : 'Item type was not synced initially and is therefore not available'}`);
                } else {
                    throw type ? type : new Error('Item type was not synced initially and is therefore not available');
                }
            } else if (expectedItems.indexOf(type) === -1) {
                if(optional) {
                    this._log.debug(`Not adding ${key} to ${this.name}: ${item}'s type (${type}) is not as expected (${JSON.stringify(expectedItems)})`)
                } else {
                    throw new Error(`${item}'s type (${type}) is not as expected (${JSON.stringify(expectedItems)})`)
                }
            } else {
                return [item, type];
            }
        }
        return [null, null];
    }

    _checkInvertedConf(key) {
        if(this._config[key] && (this._config[key] === "false" || this._config[key] === "true")) {
            return this._config[key] === "true";
        } else {
            return false;
        }
    }

    _checkMultiplierConf(key, itemType) {
        if(itemType === 'Number' || itemType === 'Rollershutter') {
            if(this._config[key]) {
                let parsedValue = parseFloat(this._config[key]);
                if (!isNaN(parsedValue)) {
                    return parsedValue;
                } else {
                    this._log.debug(`Not parsing multiplier for ${this.name}, because value (${this._config[key]}) is not parsable as float: Result ${parsedValue})`);
                }
            } else {
                this._log.debug(`Not parsing multiplier for ${this.name}, because ${key} is not defined in config: ${JSON.stringify(this._config)}`);
            }
        } else {
            this._log.debug(`Not parsing multiplier for ${this.name}, because of item's type ${itemType}`);
        }
        return 1;
    }

    _getAccessoryInformationService(modelDescription) {
        return new this.Service.AccessoryInformation()
            .setCharacteristic(this.Characteristic.Name, this.name)
            .setCharacteristic(this.Characteristic.Manufacturer, 'steilerDev')
            .setCharacteristic(this.Characteristic.Model, `openHAB2 ${modelDescription}`)
            .setCharacteristic(this.Characteristic.SerialNumber, this.uuid_base)
            .setCharacteristic(this.Characteristic.FirmwareRevision, this._config.version)
            .setCharacteristic(this.Characteristic.HardwareRevision, this._config.version);
    }

    _tryBatteryService() {
        this._log.debug(`Trying battery service for ${this.name}`);
        let batteryService = new this.Service.BatteryService(`${this.name} Battery`);
        try {
            addBatteryWarningCharacteristic.bind(this)(batteryService);
            addChargingStateCharacteristic.bind(this)(batteryService);
            addBatteryLevelCharacteristic.bind(this)(batteryService);
            this._log.debug(`Configured battery service for ${this.name}!`);
            return batteryService;
        } catch(e) {
            this._log.debug(`Not configuring battery service for ${this.name}: ${e.message}`);
        }
        return null;
    }

    getAccessory() {
        let accessory = new this.API.platformAccessory(this.name, this.uuid_base);
        accessory.addService(this._services);
        accessory.category = this.api.hap.Categories.TELEVISION;
    }
}

module.exports = {Accessory};
