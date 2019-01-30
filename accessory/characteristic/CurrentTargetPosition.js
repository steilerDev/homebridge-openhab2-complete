'use strict';

const {setState} = require('../../util/Accessory');
const {addCurrentStateCharacteristic, addTargetStateCharacteristic} = require('./CurrentTarget');

const CURRENT_TARGET_POSITION_CONFIG = {
    item: "item",
    inverted: "inverted",
    multiplier: "multiplier",
    stateItem: "stateItem",
    stateItemInverted: "stateItemInverted",
    stateItemMultiplier: "stateItemMultiplier"
};

function addCurrentPositionCharacteristic(service) {
    let item, itemType, inverted, multiplier;
    if(this._config[CURRENT_TARGET_POSITION_CONFIG.stateItem]) {
        [item, itemType] = this._getAndCheckItemType(CURRENT_TARGET_POSITION_CONFIG.stateItem, ['Rollershutter', 'Number', 'Switch', 'Contact']);
        inverted = this._checkInvertedConf(CURRENT_TARGET_POSITION_CONFIG.stateItemInverted);
        multiplier = this._checkMultiplierConf(CURRENT_TARGET_POSITION_CONFIG.stateItemMultiplier, itemType);
    } else {
        [item, itemType] = this._getAndCheckItemType(CURRENT_TARGET_POSITION_CONFIG.item, ['Rollershutter', 'Number', 'Switch']);
        inverted = this._checkInvertedConf(CURRENT_TARGET_POSITION_CONFIG.inverted);
        multiplier = this._checkMultiplierConf(CURRENT_TARGET_POSITION_CONFIG.multiplier, itemType);
    }

    addCurrentStateCharacteristic.bind(this)(service,
        this.Characteristic.CurrentPosition,
        item,
        itemType,
        inverted,
        positionTransformation.bind(this,
            multiplier,
            service.getCharacteristic(this.Characteristic.TargetPosition)
        )
    );
}

function addTargetPositionCharacteristic(service) {
    let [item, itemType] = this._getAndCheckItemType(CURRENT_TARGET_POSITION_CONFIG.item, ['Rollershutter', 'Number', 'Switch']);
    let inverted = this._checkInvertedConf(CURRENT_TARGET_POSITION_CONFIG.inverted);
    let multiplier = this._checkMultiplierConf(CURRENT_TARGET_POSITION_CONFIG.multiplier, itemType);
    let stateItem, stateItemType, stateItemInverted, stateItemMultiplier;

    if(this._config[CURRENT_TARGET_POSITION_CONFIG.stateItem]) {
        [stateItem, stateItemType] = this._getAndCheckItemType(CURRENT_TARGET_POSITION_CONFIG.stateItem, ['Rollershutter', 'Number', 'Switch', 'Contact']);
        stateItemInverted = this._checkInvertedConf(CURRENT_TARGET_POSITION_CONFIG.stateItemInverted);
        stateItemMultiplier = this._checkMultiplierConf(CURRENT_TARGET_POSITION_CONFIG.stateItemMultiplier, stateItemType);
    } else {
        stateItem = item;
        stateItemType = itemType;
        stateItemInverted = inverted;
        stateItemMultiplier = multiplier;
    }
    addTargetStateCharacteristic.bind(this)(service,
        this.Characteristic.TargetPosition,
        item,
        itemType,
        inverted,
        stateItem,
        stateItemType,
        stateItemInverted,
        positionTransformation.bind(this,
            multiplier,
            null
        ),
        positionTransformation.bind(this,
            stateItemMultiplier,
            null
        )
    );
}

function addPositionStateCharacteristic(service) {
    this._log.debug(`Creating position state characteristic for ${this.name}`);

    service.getCharacteristic(this.Characteristic.PositionState) // We will just fake it, since it is not used anyway
        .on('get', function(callback) {
            callback(null, this.Characteristic.PositionState.STOPPED);
        }.bind(this));
}

function addHoldPositionCharacteristic(service) {
    try {
        let [item] = this._getAndCheckItemType(CURRENT_TARGET_POSITION_CONFIG.item, ['Rollershutter']);

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

// Todo: Maybe some grace area, if target and acutall state differ a couple of percent?
function positionTransformation(multiplier, targetStateCharacteristic, type, inverted, value) {
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
                transformedValue = Math.floor(100 - (parseFloat(value) * multiplier));
            } else {
                transformedValue = Math.floor(parseFloat(value) * multiplier);
            }
            break;
    }

    const threshold = 5;
    if(targetStateCharacteristic) {
        this._log.error(`Trying grace area with ${JSON.stringify(targetStateCharacteristic)}`);
        if(targetStateCharacteristic.value > transformedValue && (targetStateCharacteristic - threshold) <= transformedValue ||
            targetStateCharacteristic.value < transformedValue && (targetStateCharacteristic + threshold) >= transformedValue)
        {
            this._log.debug(`Actually assigning target state ${targetStateCharacteristic.value}, because its within the threshold (${threshold}) of the actual state ${transformedValue}`);
            transformedValue = targetStateCharacteristic.value;
        }
    } else {
        this._log.error(`Not trying grace area with`);
    }

    this._log.debug(`Transformed ${value} with inverted set to ${inverted} and multiplier set to ${multiplier} for ${this.name} to ${transformedValue}`);
    return transformedValue;
}

module.exports = {
    addCurrentPositionCharacteristic,
    addTargetPositionCharacteristic,
    addHoldPositionCharacteristic,
    addPositionStateCharacteristic
};

