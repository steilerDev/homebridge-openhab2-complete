'use strict';

const Accessory = require('./Accessory');

const CONFIG = {
    item: "item",
    inverted: "false"
};

class WindowCoveringAccessory extends Accessory.Accessory {

    constructor(platform, config) {
        super(platform, config);

        if(!(this._config[CONFIG.item])) {
            throw new Error(`Required item not defined: ${JSON.stringify(this._config)}`)
        } else {
            this._item = this._config[CONFIG.item];
        }
        this._log.error(this._config[CONFIG.inverted]);
        if(this._config[CONFIG.inverted] && (this._config[CONFIG.inverted] === "false" || this._config[CONFIG.inverted] === "true")) {
            this._inverted = this._config[CONFIG.inverted] === "true";
        } else {
            this._inverted = false;
        }


        // This will throw an error, if the item does not match the array.
        this._getAndCheckItemType(this._item, ['Rollershutter']);

        let currentState = this._openHAB.getStateSync(this._item);
        if(currentState instanceof Error) {
            throw currentState;
        } else {
            this._targetState = this._transformation(currentState);
        }

        // Services will be retrieved by homebridge
        this._services = [
            this._getAccessoryInformationService('Window Cover'),
            this._getPrimaryService()
        ]
    }

    _getPrimaryService() {
        this._log.debug(`Creating window cover service for ${this.name} [${this._item}]`);
        let windowCoveringService = new this.Service.WindowCovering(this.name);

        windowCoveringService.getCharacteristic(this.Characteristic.CurrentPosition)
            .on('get', Accessory.getState.bind(this, this._item, this._transformation.bind(this)));

        windowCoveringService.getCharacteristic(this.Characteristic.TargetPosition)
            .on('get', function (callback) { callback(null, this._targetState); }.bind(this))
            .on('set', function (value) { this._targetState = value; }.bind(this))
            .on('set', Accessory.setState.bind(this, this._item, this._transformation.bind(this)));

        windowCoveringService.getCharacteristic(this.Characteristic.PositionState)
            .on('get', function(callback) { callback(null, 2); }); //this._getPositionState.bind(this));

        windowCoveringService.getCharacteristic(this.Characteristic.HoldPosition)
            .on('set', Accessory.setState.bind(this, this._item, {
                1: "STOP",
                "_default": ""
            }));

        return windowCoveringService;
    }

    _getPositionState(callback) {
        this._log.debug(`Getting position state for ${this.name} ['${this._item}]`);
        let currentState = this._openHAB.getStateSync(this._item);
        this._log.debug(`Comparing currentState (${currentState}) with targetState (${this._targetState}`);
        if(currentState instanceof Error) {
            callback(currentState);
        } else {
            currentState = parseInt(currentState);
            if(this._targetState > currentState && !this._inverted) {
                callback(null, this.Characteristic.PositionState.INCREASING)
            } else if(this._targetState < currentState && !this._inverted) {
                callback(null, this.Characteristic.PositionState.DECREASING)
            } else {
                callback(null, this.Characteristic.PositionState.STOPPED)
            }
        }
    }

    _transformation(value) {
        this._log.debug(`Transforming ${value} with inverted set to ${this._inverted} for ${this.name} [${this._item}]`);
        if(this._inverted) {
            return 100 - value;
        } else {
            return value;
        }
    }

}

module.exports = {WindowCoveringAccessory};
