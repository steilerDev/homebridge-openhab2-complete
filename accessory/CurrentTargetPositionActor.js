'use strict';

const Accessory = require('./Accessory');

const CONFIG = {
    item: "item",
    stateItem: "stateItem",
    inverted: "inverted"
};

// This is intended to be an abstract class to support Accessories that implement `targetPosition` and `currentPosition`
class CurrentTargetPositionActorAccessory extends Accessory.Accessory {

    constructor(platform, config) {
        super(platform, config);

        if(!(this._config[CONFIG.item])) {
            throw new Error(`Required item not defined: ${JSON.stringify(this._config)}`)
        } else {
            this._item = this._config[CONFIG.item];
            this._itemType = this._getAndCheckItemType(this._item, ['Rollershutter', 'Number', 'Switch']);
        }

        if(this._config[CONFIG.inverted] && (this._config[CONFIG.inverted] === "false" || this._config[CONFIG.inverted] === "true")) {
            this._inverted = this._config[CONFIG.inverted] === "true";
        } else {
            this._inverted = false;
        }

        if(this._config[CONFIG.stateItem]) {
            this._stateItem = this._config[CONFIG.stateItem];
            this._stateItemType = this._getAndCheckItemType(this._stateItem, ['Rollershutter', 'Number', 'Switch']);
        }

    }

    _configureCurrentPositionCharacteristic(service) {
        if(this._stateItem) {
            service.getCharacteristic(this.Characteristic.CurrentPosition)
                .on('get', Accessory.getState.bind(this, this._stateItem, this._transformation.bind(this, this._stateItemType)));
        } else {
            service.getCharacteristic(this.Characteristic.CurrentPosition)
                .on('get', Accessory.getState.bind(this, this._item, this._transformation.bind(this, this._itemType)));
        }
    }

    _configureTargetPositionCharacteristic(service) {
        // If HomeKit is curious about the target state, we will just give him the actual state
        if(this._stateItem) {
            service.getCharacteristic(this.Characteristic.TargetPosition)
                .on('get', Accessory.getState.bind(this, this._stateItem, this._transformation.bind(this, this._stateItemType)));
        } else {
            service.getCharacteristic(this.Characteristic.TargetPosition)
                .on('get', Accessory.getState.bind(this, this._item, this._transformation.bind(this, this._itemType)));
        }

        service.getCharacteristic(this.Characteristic.TargetPosition)
            .on('set', Accessory.setState.bind(this, this._item, this._transformation.bind(this, this._itemType)))
            .on('set', function(value) { // We will use this to set the actual position to the target position, in order to stop showing 'Closing...' or 'Opening...'
                setTimeout(function(value) {
                        service.setCharacteristic(this.Characteristic.CurrentPosition, value);
                    }.bind(this, value),
                    5000
                );
            }.bind(this));
    }

    _configurePostitionStateCharacteristic(service) {
        service.getCharacteristic(this.Characteristic.PositionState) // We will just fake it, since it is not used anyway
            .on('get', function(callback) {
                callback(null, this.Characteristic.PositionState.STOPPED);
            }.bind(this));
    }

    _configureHoldPosition(service) {
        if(this._itemType === 'Rollershutter') {
            service.getCharacteristic(this.Characteristic.HoldPosition) // Never tested, since I don't know how to invoke it
                .on('set', Accessory.setState.bind(this, this._item, {
                    1: "STOP",
                    "_default": ""
                }));
        } else {
            this._log.warn(`Hold position can only be configured for Rollershutter items not for ${this._itemType} items`);
        }
    }

    _transformation(type, value) {
        let transformedValue;

        switch(type) {
            case 'Switch':
                if(value === "ON") {
                    transformedValue = this._inverted ?
                        0 :
                        100
                } else if (value === "OFF") {
                    transformedValue = this._inverted ?
                        100 :
                        0
                } else {
                    if(value >= 50 && !(this._inverted)) {
                       transformedValue = "ON"
                    } else {
                        transformedValue = "OFF"
                    }
                }
                break;
            case 'Rollershutter':
            case 'Number':
                if(this._inverted) {
                    transformedValue = 100 - value;
                } else {
                    transformedValue = value;
                }
                break;
        }

        this._log.debug(`Transformed ${value} with inverted set to ${this._inverted} for ${this.name} to ${transformedValue}`);
        return transformedValue;
    }
}

const ignore = true;

module.exports = {CurrentTargetPositionActorAccessory, ignore};

