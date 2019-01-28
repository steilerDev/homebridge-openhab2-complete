'use strict';

const {setState} = require('../../util/Accessory');
const {addCurrentStateCharacteristic, addTargetStateCharacteristic} = require('./CurrentTarget');

const CURRENT_TARGET_POSITION_CONFIG = {
    item: "item",
    inverted: "inverted",
    stateItem: "stateItem",
    stateItemInverted: "stateItemInverted"
};

function addCurrentPositionCharacteristic(service) {
    let item, itemType, inverted;
    if(this._config[CURRENT_TARGET_POSITION_CONFIG.stateItem]) {
        [item, itemType] = this._getAndCheckItemType(CURRENT_TARGET_POSITION_CONFIG.stateItem, ['Rollershutter', 'Number', 'Switch', 'Contact']);
        inverted = this._checkInvertedConf(CURRENT_TARGET_POSITION_CONFIG.stateItemInverted);
    } else {
        [item, itemType] = this._getAndCheckItemType(CURRENT_TARGET_POSITION_CONFIG.item, ['Rollershutter', 'Number', 'Switch']);
        inverted = this._checkInvertedConf(CURRENT_TARGET_POSITION_CONFIG.inverted);
    }
    addCurrentStateCharacteristic.bind(this)(service, this.Characteristic.CurrentPosition, item, itemType, inverted, positionTransformation);
}

function addTargetPositionCharacteristic(service) {
    let [item, itemType] = this._getAndCheckItemType(CURRENT_TARGET_POSITION_CONFIG.item, ['Rollershutter', 'Number', 'Switch']);
    let inverted = this._checkInvertedConf(CURRENT_TARGET_POSITION_CONFIG.inverted);
    let stateItem, stateItemType, stateItemInverted;

    if(this._config[CURRENT_TARGET_POSITION_CONFIG.stateItem]) {
        [stateItem, stateItemType] = this._getAndCheckItemType(CURRENT_TARGET_POSITION_CONFIG.stateItem, ['Rollershutter', 'Number', 'Switch', 'Contact']);
        stateItemInverted = this._checkInvertedConf(CURRENT_TARGET_POSITION_CONFIG.stateItemInverted);
    } else {
        stateItem = item;
        stateItemType = itemType;
        stateItemInverted = inverted;
    }
    addTargetStateCharacteristic.bind(this)(service, this.Characteristic.TargetPosition, item, itemType, inverted, stateItem, stateItemType, stateItemInverted ,positionTransformation);
}

    // Not sure about this:
    //
    // this._subscribeCharacteristic(service,
    //     this.Characteristic.TargetPosition,
    //     thisItem,
    //     this._transformation.bind(this,
    //         thisItemType,
    //         thisInverted
    //     )
    // );

// Todo: Maybe a clean fix for the problem above with subscribing to current state & Manu-Mode option
function addPositionStateCharacteristic(service) {
    this._log.debug(`Creating position state characteristic for ${this.name}`);

    service.getCharacteristic(this.Characteristic.PositionState) // We will just fake it, since it is not used anyway
        .on('get', function(callback) {
            callback(null, this.Characteristic.PositionState.STOPPED);
        }.bind(this));
}

function addHoldPositionCharacteristic(service) {
    try {
        let [item] = this._getAndCheckItemType(CURRENT_TARGET_CONFIG.item, ['Rollershutter']);

        this._log.debug(`Creating position state characteristic for ${this.name} with item ${item}`);

        service.getCharacteristic(this.Characteristic.HoldPosition) // Never tested, since I don't know how to invoke it
            .on('set', setState.bind(this,
                item, {
                1: "STOP",
                "_default": ""
            }));

    } catch(e) {
        this._log.debug(`Not configuring hold position characteristic for ${this.name}: ${e.message}`);
    }
}


function positionTransformation(type, inverted, value) {
    let transformedValue;

    let onCommand = type === 'Contact' ? "OPEN": "ON";
    let offCommand = type === 'Contact' ? "CLOSED": "OFF";

    switch(type) {
        case 'Contact':
        case 'Switch':
            if(value === onCommand) {
                transformedValue = inverted ?
                    0 :
                    100
            } else if (value === offCommand) {
                transformedValue = inverted ?
                    100 :
                    0
            } else {
                if(value >= 50 && !(inverted)) {
                    transformedValue = onCommand
                } else {
                    transformedValue = offCommand
                }
            }
            break;
        case 'Rollershutter':
        case 'Number':
            if(inverted) {
                transformedValue = 100 - value;
            } else {
                transformedValue = value;
            }
            break;
    }

    this._log.debug(`Transformed ${value} with inverted set to ${inverted} for ${this.name} to ${transformedValue}`);
    return transformedValue;
}

module.exports = {
    addCurrentPositionCharacteristic,
    addTargetPositionCharacteristic,
    addHoldPositionCharacteristic,
    addPositionStateCharacteristic
};

