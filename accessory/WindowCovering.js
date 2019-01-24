'use strict';

const Accessory = require('./Accessory');

const CONFIG = {
    item: "item",
    inverted: "inverted"
};

class WindowCoveringAccessory extends Accessory.Accessory {

    constructor(platform, config) {
        super(platform, config);

        if(!(this._config[CONFIG.item])) {
            throw new Error(`Required item not defined: ${JSON.stringify(this._config)}`)
        } else {
            this._item = this._config[CONFIG.item];
        }

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
            .on('set', Accessory.setState.bind(this, this._item, this._transformation.bind(this)))
            .on('set', function(value) { windowCoveringService.setCharacteristic(this.Characteristic.CurrentPosition, value);});

        windowCoveringService.getCharacteristic(this.Characteristic.PositionState)
            .on('get', this._getPositionState.bind(this));

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
        this._log.debug(`Comparing currentState (${currentState}) with targetState (${this._targetState})`);
        if(currentState instanceof Error) {
            callback(currentState);
        } else {
            currentState = parseInt(currentState);
            this._services[1].getCharacteristic(this.Characteristic.CurrentPosition).setValue(currentState);
            if(this._targetState > currentState && !this._inverted) {
                callback(null, this.Characteristic.PositionState.INCREASING)
            } else if(this._targetState < currentState && !this._inverted) {
                callback(null, this.Characteristic.PositionState.DECREASING)
            } else {
                callback(null, this.Characteristic.PositionState.STOPPED)
            }
        }
    }

    _monitorPositionState() {
        let timer = setInterval(this._getPositionState.bind(this,
            function (error, value) {
                if(error) {
                    this._log.error(`Unable to get position state: ${error.msg}`);
                    clearInterval(timer);
                } else {
                    this._log.error(`Got position state: ${value}`);
                    this._services[1].getCharacteristic(this.Characteristic.PositionState).setValue(value);
                    if(value === this.Characteristic.PositionState.STOPPED) {
                        this._log.error("Stopping timer");
                       clearInterval(timer)
                    }
                }
            }.bind(this)
        ), 500);
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
