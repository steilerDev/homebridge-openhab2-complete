'use strict';

const {addCurrentStateCharacteristic, addTargetStateCharacteristic} = require('./CurrentTarget');

const CURRENT_TARGET_DOOR_CONFIG = {
    item: "item",
    inverted: "inverted",
    multiplier: "multiplier",
    stateItem: "stateItem",
    stateItemInverted: "stateItemInverted",
    stateItemMultiplier: "stateItemMultiplier",
    obstructionItem: "obstructionItem",
    obstructionItemInverted: "obstructionItemInverted"
};

function addCurrentDoorStateCharacteristic(service) {
    let item, itemType, inverted, multiplier;
    if(this._config[CURRENT_TARGET_DOOR_CONFIG.stateItem]) {
        [item, itemType] = this._getAndCheckItemType(CURRENT_TARGET_DOOR_CONFIG.stateItem, ['Rollershutter', 'Number', 'Switch', 'Contact']);
        inverted = this._checkInvertedConf(CURRENT_TARGET_DOOR_CONFIG.stateItemInverted);
        multiplier = this._checkMultiplierConf(CURRENT_TARGET_DOOR_CONFIG.stateItemMultiplier, itemType);
    } else {
        [item, itemType] = this._getAndCheckItemType(CURRENT_TARGET_DOOR_CONFIG.item, ['Rollershutter', 'Number', 'Switch']);
        inverted = this._checkInvertedConf(CURRENT_TARGET_DOOR_CONFIG.inverted);
        multiplier = this._checkMultiplierConf(CURRENT_TARGET_DOOR_CONFIG.multiplier, itemType);
    }

    addCurrentStateCharacteristic.bind(this)(service.getCharacteristic(this.Characteristic.CurrentDoorState),
        item,
        itemType,
        inverted,
        _doorTransformation.bind(this,
            multiplier,
            service.getCharacteristic(this.Characteristic.TargetDoorState)
        )
    );
}

function addTargetDoorStateCharacteristic(service) {
    let [item, itemType] = this._getAndCheckItemType(CURRENT_TARGET_DOOR_CONFIG.item, ['Rollershutter', 'Number', 'Switch']);
    let inverted = this._checkInvertedConf(CURRENT_TARGET_DOOR_CONFIG.inverted);
    let multiplier = this._checkMultiplierConf(CURRENT_TARGET_DOOR_CONFIG.multiplier, itemType);
    let stateItem, stateItemType, stateItemInverted, stateItemMultiplier;

    if(this._config[CURRENT_TARGET_DOOR_CONFIG.stateItem]) {
        [stateItem, stateItemType] = this._getAndCheckItemType(CURRENT_TARGET_DOOR_CONFIG.stateItem, ['Rollershutter', 'Number', 'Switch', 'Contact']);
        stateItemInverted = this._checkInvertedConf(CURRENT_TARGET_DOOR_CONFIG.stateItemInverted);
        stateItemMultiplier = this._checkMultiplierConf(CURRENT_TARGET_DOOR_CONFIG.stateItemMultiplier, stateItemType);
    } else {
        stateItem = item;
        stateItemType = itemType;
        stateItemInverted = inverted;
        stateItemMultiplier = multiplier;
    }
    addTargetStateCharacteristic.bind(this)(service.getCharacteristic(this.Characteristic.TargetDoorState),
        item,
        itemType,
        inverted,
        stateItem,
        stateItemType,
        stateItemInverted,
        _doorTransformation.bind(this,
            multiplier,
            null
        ),
        _doorTransformation.bind(this,
            stateItemMultiplier,
            null
        )
    );
}

// 100 = UP = OPEN = ON
// 0 = DOWN = CLOSED = OFF
function _doorTransformation(multiplier, targetStateCharacteristic, type, inverted, value) {
    let transformedValue;

    let OPEN = 0;       // = Characteristic.CurrentDoorState.OPEN == Characteristic.TargetDoorState.OPEN
    let CLOSED = 1;     // = Characteristic.CurrentDoorState.CLOSED == Characteristic.TargetDoorState.CLOSED
    let OPENING = 2;    // = Characteristic.CurrentDoorState.OPENING
    let CLOSING = 3;    // = Characteristic.CurrentDoorState.CLOSING
    let STOPPED = 4;    // = Characteristic.CurrentDoorState.STOPPED

    let onCommand = type === 'Contact' ? "OPEN": "ON";
    let offCommand = type === 'Contact' ? "CLOSED": "OFF";

    switch(type) {
        case 'Contact':
        case 'Switch':
            if(value === onCommand) {
                transformedValue = inverted ?
                    CLOSED :
                    OPEN;
            } else if (value === offCommand) {
                transformedValue = inverted ?
                    OPEN :
                    CLOSED;
            } else {
                if(value === OPEN) {
                    transformedValue = inverted ? offCommand : onCommand;
                } else {
                    transformedValue = inverted ? onCommand : offCommand;
                }
            }
            break;
        case 'Rollershutter':
        case 'Number':
            if(value === OPEN) {
                if(type === 'Rollershutter') {
                    transformedValue = inverted ? "DOWN" : "UP";
                } else {
                    transformedValue = inverted ? 0 : 100;
                }
            } else if(value === CLOSED) {
                if(type === 'Rollershutter') {
                    transformedValue = inverted ? "UP" : "DOWN";
                } else {
                    transformedValue = inverted ? 100 : 0;
                }
            } else {
                value = Math.floor(parseFloat(value) * multiplier);
                if(value >= 97) {
                    transformedValue = inverted ? CLOSED : OPEN;
                } else if(value <= 3) {
                    transformedValue = inverted ? OPEN : CLOSED;
                } else if(targetStateCharacteristic) {
                    if(targetStateCharacteristic.value === OPEN) {
                        transformedValue = OPENING;
                    } else {
                        transformedValue = CLOSING;
                    }
                } else {
                    transformedValue = STOPPED;
                }
            }
            break;
    }

    this._log.debug(`Transformed ${value} with inverted set to ${inverted} and multiplier set to ${multiplier} for ${this.name} (type: ${type}) to ${transformedValue}`);
    return transformedValue;
}

module.exports = {
    CURRENT_TARGET_DOOR_CONFIG,
    addCurrentDoorStateCharacteristic,
    addTargetDoorStateCharacteristic
};

