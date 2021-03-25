'use strict';

const {addCurrentStateCharacteristic, addTargetStateCharacteristic} = require('./CurrentTarget');

const CURRENT_TARGET_LOCK_CONFIG = {
    item: "item",
    inverted: "inverted",
    stateItem: "stateItem",
    stateItemInverted: "stateItemInverted"
};

function addCurrentLockStateCharacteristic(service) {
    let item, itemType, inverted;
    if(this._config[CURRENT_TARGET_LOCK_CONFIG.stateItem]) {
        [item, itemType] = this._getAndCheckItemType(CURRENT_TARGET_LOCK_CONFIG.stateItem, ['Switch', 'Contact']);
        inverted = this._checkInvertedConf(CURRENT_TARGET_LOCK_CONFIG.stateItemInverted);
    } else {
        [item, itemType] = this._getAndCheckItemType(CURRENT_TARGET_LOCK_CONFIG.item, ['Switch']);
        inverted = this._checkInvertedConf(CURRENT_TARGET_LOCK_CONFIG.inverted);
    }
    addCurrentStateCharacteristic.bind(this)(service.getCharacteristic(this.Characteristic.LockCurrentState), item, itemType, inverted, lockStateTransformation);
}

function addTargetLockStateCharacteristic(service) {
    let [item, itemType] = this._getAndCheckItemType(CURRENT_TARGET_LOCK_CONFIG.item, ['Switch']);
    let inverted = this._checkInvertedConf(CURRENT_TARGET_LOCK_CONFIG.inverted);
    let stateItem, stateItemType, stateItemInverted;

    if(this._config[CURRENT_TARGET_LOCK_CONFIG.stateItem]) {
        [stateItem, stateItemType] = this._getAndCheckItemType(CURRENT_TARGET_LOCK_CONFIG.stateItem, ['Switch', 'Contact']);
        stateItemInverted = this._checkInvertedConf(CURRENT_TARGET_LOCK_CONFIG.stateItemInverted);
    } else {
        stateItem = item;
        stateItemType = itemType;
        stateItemInverted = inverted;
    }
    addTargetStateCharacteristic.bind(this)(service.getCharacteristic(this.Characteristic.LockTargetState), item, itemType, inverted, stateItem, stateItemType, stateItemInverted, lockStateTransformation, lockStateTransformation);
}

function lockStateTransformation(type, inverted, value) {
    const UNSECURED = 0;
    const SECURED = 1;

    const transformation = {
        "ON": inverted ? UNSECURED : SECURED,
        "OFF": inverted ? SECURED : UNSECURED,
        "OPEN": inverted ? SECURED : UNSECURED,
        "CLOSED": inverted ? UNSECURED : SECURED,
        [UNSECURED]: inverted ? "ON" : "OFF",
        [SECURED ]: inverted ? "OFF" : "ON"
    };

    let transformedValue = transformation[value];

    this._log.debug(`Transformed ${value} with inverted set to ${inverted} for ${this.name} to ${transformedValue}`);
    return transformedValue;
}

module.exports = {
    addCurrentLockStateCharacteristic,
    addTargetLockStateCharacteristic
};

