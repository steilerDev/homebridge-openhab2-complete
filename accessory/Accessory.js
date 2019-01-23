'use strict';

let BATTERY_CONFIG = {
    habBatteryItem: "habBatteryItem",
    habBatteryItemStateWarning: "habBatteryItemStateWarning"
};

let PLATFORM = {
    log: "log",
    api: "api",
    hap: "hap",
    openHAB: "openHAB"
};

class Accessory {
    constructor(platform, config) {
        this._log = platform[PLATFORM.log];
        this._log.debug(`Creating new accessory: ${config.name}`);

        this.Characteristic = platform[PLATFORM.api][PLATFORM.hap].Characteristic;
        this.Service = platform[PLATFORM.api][PLATFORM.hap].Service;

        this._config = config;
        this._openHAB = platform[PLATFORM.openHAB];
        this.name = config.name;
        this.uuid_base = config.serialNumber;

        this._services = [];

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

    // Put the response of openHAB.getItemType in here, handles errors of the function
    _getAndCheckItemType(habItem, expectedItems) {
        let type = this._openHAB.getItemType(habItem);
        if(type instanceof Error) {
            throw type;
        } else if(expectedItems.indexOf(type) === -1) {
            throw new Error(`${habItem}'s type (${type}) is not as expected (${JSON.stringify(expectedItems)})`)
        } else {
            return type;
        }
    }

    _getAccessoryInformationService(modelDescription) {
        return new this.Service.AccessoryInformation()
            .setCharacteristic(this.Characteristic.Name, this.name)
            .setCharacteristic(this.Characteristic.Manufacturer, 'steilerDev')
            .setCharacteristic(this.Characteristic.Model, `openHAB2 ${modelDescription}`)
            .setCharacteristic(this.Characteristic.SerialNumber, this._config.serialNumber)
            .setCharacteristic(this.Characteristic.FirmwareRevision, this._config.version)
            .setCharacteristic(this.Characteristic.HardwareRevision, this._config.version);
    }

    // Can be used if the resulting state does not require further processing
    // Use it with this._getRawState.bind(this, habItem)
    _getRawState(habItem, callback) {
        this._log(`Getting state for ${this.name} [${habItem}]`);
        this._openHAB.getState(habItem, function(error, state) {
            if(error) {
                this._log.error(`Unable to get state: ${error.message}`);
                callback(error);
            } else {
                this._log(`Received state: ${state} for ${this.name} [${habItem}]`);
                callback(null, state);
            }
        }.bind(this));
    }

    // Call this function if you want to optionally set the battery characteristic using the configuration keys above
    _configureBattery() {
        try {
            if(this._config[BATTERY_CONFIG.habBatteryItem]) {
                this._habBatteryItem = this._config[BATTERY_CONFIG.habBatteryItem];
                this._getAndCheckItemType(this._habBatteryItem, ['Switch']);
                if(this._config[BATTERY_CONFIG.habBatteryItemStateWarning]) {
                    this._habBatteryItemStateWarning = this._config[BATTERY_CONFIG.habBatteryItemStateWarning];
                } else {
                    this._habBatteryItemStateWarning = "ON";
                }
            }
        } catch (e) {
            this._log.error(`Not configuring battery for ${this.name}: ${e.message}`);
            this._habBatteryItem = undefined;
        }
    }

    _getBatteryState(callback) {
        if(this._habBatteryItem && this._habBatteryItemStateWarning !== undefined) {
            this._log(`Getting state for ${this.name} [${this._habBatteryItem}]`);
            this._openHAB.getState(this._habBatteryItem, function(error, state) {
                if(error) {
                    this._log.error(`Unable to get state: ${error.message}`);
                    callback(error);
                } else {
                    this._log(`Received state: ${state} for ${this.name} [${this._habBatteryItem}]`);
                    callback(null, state === this._habBatteryItemStateWarning ? 1 : 0);
                }
            }.bind(this));
        } else {
            callback(new Error(`No battery item defined for ${this.name}`));
        }
    }
}

module.exports = Accessory;
