'use strict';

const {addBinarySensorCharacteristicWithTransformation} = require('./Binary');
const {addCurrentTiltCharacteristic, addTargetTiltCharacteristic} = require('./CurrentTargetPosition');


const SLAT_CONFIG = {
    item: "item",
    itemRangeStart: "itemRangeStart",
    itemRangeEnd: "itemRangeEnd",
    stateItem: "stateItem",
    stateItemInverted: "stateItemInverted",
    slatType: "slatType"
};

function addCurrentSlatTiltCharacteristic(service) {
    addCurrentTiltCharacteristic.bind(this)(service,
        service.getCharacteristic(this.Characteristic.CurrentTiltAngle),
        {
            item: SLAT_CONFIG.item,
            rangeStart: SLAT_CONFIG.itemRangeStart,
            rangeEnd: SLAT_CONFIG.itemRangeEnd
        },
        true
    );
}

function addTargetSlatTiltCharacteristic(service) {
    addTargetTiltCharacteristic.bind(this)(service,
        service.getCharacteristic(this.Characteristic.TargetTiltAngle),
        {
            item: SLAT_CONFIG.item,
            rangeStart: SLAT_CONFIG.itemRangeStart,
            rangeEnd: SLAT_CONFIG.itemRangeEnd
        },
        true
    );
}

function addCurrentSlatState(service) {
    const FIXED = this.Characteristic.CurrentSlatState.FIXED;
    const SWINGING = this.Characteristic.CurrentSlatState.SWINGING;
    let inverted = this._checkInvertedConf(SLAT_CONFIG.stateItemInverted);
    let transformation = {
        "OFF": inverted ? SWINGING : FIXED,
        "ON": inverted ? FIXED : SWINGING,
        "CLOSED": inverted ? SWINGING : FIXED,
        "OPEN": inverted ? FIXED : SWINGING
    };

    addBinarySensorCharacteristicWithTransformation.bind(this)(service,
        service.getCharacteristic(this.Characteristic.CurrentSlatState),
        {item: SLAT_CONFIG.stateItem, inverted: SLAT_CONFIG.stateItemInverted},
        transformation
    )
}

function addSlatTypeCharacteristic(service) {
    switch (this._config[SLAT_CONFIG.slatType]) {
        default:
        case 'horizontal':
            this._slatType = this.Characteristic.SlatType.HORIZONTAL;
            break;
        case 'vertical':
            this._slatType = this.Characteristic.SlatType.VERTICAL;
            break;
    }

    service.getCharacteristic(this.Characteristic.SlatType)
        .setValue(this._slatType);
}

module.exports = {
    addSlatTypeCharacteristic,
    addCurrentSlatState,
    addCurrentSlatTiltCharacteristic,
    addTargetSlatTiltCharacteristic
};