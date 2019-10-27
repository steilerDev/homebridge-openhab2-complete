'use strict';

const {setState} = require('../../util/Util');
const {addCurrentStateCharacteristic, addTargetStateCharacteristic} = require('./CurrentTarget');
const {addNumericSensorActorCharacteristicWithDistinctTransformation, addNumericSensorCharacteristicWithTransformation} = require('./Numeric');

const CURRENT_TARGET_POSITION_CONFIG = {
    item: "item",
    inverted: "inverted",
    multiplier: "multiplier",
    stateItem: "stateItem",
    stateItemInverted: "stateItemInverted",
    stateItemMultiplier: "stateItemMultiplier",
    manuMode: "manuMode",
    horizontalTiltItem: "horizontalTiltItem",
    horizontalTiltItemRangeStart: "horizontalTiltItemRangeStart",
    horizontalTiltItemRangeEnd: "horizontalTiltItemRangeEnd",
    verticalTiltItem: "verticalTiltItem",
    verticalTiltItemRangeStart: "verticalTiltItemRangeStart",
    verticalTiltItemRangeEnd: "verticalTiltItemRangeEnd"
};

function addCurrentTiltCharacteristic(service, characteristic, CONF_MAP, optional) {
    let rangeStart = isNaN(parseFloat(this._config[CONF_MAP.rangeStart])) ? -90 : parseFloat(this._config[CONF_MAP.rangeStart]);
    let rangeEnd = isNaN(parseFloat(this._config[CONF_MAP.rangeEnd])) ? 90 : parseFloat(this._config[CONF_MAP.rangeEnd]);
    const rangeStartHAP = -90;
    const rangeEndHAP = 90;
    this._log.debug(`Adding current tilt characteristic with range start at ${rangeStart} and range end at ${rangeEnd}`);

    addNumericSensorCharacteristicWithTransformation.bind(this)(service,
        characteristic,
        {item: CONF_MAP.item},
        mapRanges.bind(this, rangeStart, rangeEnd, rangeStartHAP, rangeEndHAP),
        optional
    );
}

function addTargetTiltCharacteristic(service, characteristic, CONF_MAP, optional) {
    let rangeStart = isNaN(parseFloat(this._config[CONF_MAP.rangeStart])) ? -90 : parseFloat(this._config[CONF_MAP.rangeStart]);
    let rangeEnd = isNaN(parseFloat(this._config[CONF_MAP.rangeEnd])) ? 90 : parseFloat(this._config[CONF_MAP.rangeEnd]);
    const rangeStartHAP = -90;
    const rangeEndHAP = 90;
    this._log.debug(`Adding target tilt characteristic with range start at ${rangeStart} and range end at ${rangeEnd}`);

    addNumericSensorActorCharacteristicWithDistinctTransformation.bind(this)(service,
        characteristic,
        {item: CONF_MAP.item},
        mapRanges.bind(this, rangeStartHAP, rangeEndHAP, rangeStart, rangeEnd),
        mapRanges.bind(this, rangeStart, rangeEnd, rangeStartHAP, rangeEndHAP),
        optional
    );
}

function mapRanges(inputStart, inputEnd, outputStart, outputEnd, input) {
    let output = outputStart + ((outputEnd - outputStart)/(inputEnd - inputStart)) * (input - inputStart);
    this._log.debug(`Mapping ranges:`);
    this._log.debug(`    Input: ${input}`);
    this._log.debug(`    Input Start: ${inputStart}`);
    this._log.debug(`    Input End: ${inputEnd}`);
    this._log.debug(`    Output Start: ${outputStart}`);
    this._log.debug(`    Output End: ${outputEnd}`);
    this._log.debug(`    Output: ${output}`);
    return output
}

function addCurrentHorizontalTiltCharacteristic(service) {
    addCurrentTiltCharacteristic.bind(this)(service,
        service.getCharacteristic(this.Characteristic.CurrentHorizontalTiltAngle),
        {
            item: CURRENT_TARGET_POSITION_CONFIG.horizontalTiltItem,
            rangeStart: CURRENT_TARGET_POSITION_CONFIG.horizontalTiltItemRangeStart,
            rangeEnd: CURRENT_TARGET_POSITION_CONFIG.horizontalTiltItemRangeEnd
        },
        true
    );
}

function addTargetHorizontalTiltCharacteristic(service) {
    addTargetTiltCharacteristic.bind(this)(service,
        service.getCharacteristic(this.Characteristic.TargetHorizontalTiltAngle),
        {
            item: CURRENT_TARGET_POSITION_CONFIG.horizontalTiltItem,
            rangeStart: CURRENT_TARGET_POSITION_CONFIG.horizontalTiltItemRangeStart,
            rangeEnd: CURRENT_TARGET_POSITION_CONFIG.horizontalTiltItemRangeEnd
        },
        true
    );
}

function addCurrentVerticalTiltCharacteristic(service) {
    addCurrentTiltCharacteristic.bind(this)(service,
        service.getCharacteristic(this.Characteristic.CurrentVerticalTiltAngle),
        {
            item: CURRENT_TARGET_POSITION_CONFIG.verticalTiltItem,
            rangeStart: CURRENT_TARGET_POSITION_CONFIG.verticalTiltItemRangeStart,
            rangeEnd: CURRENT_TARGET_POSITION_CONFIG.verticalTiltItemRangeEnd
        },
        true
    );
}

function addTargetVerticalTiltCharacteristic(service) {
    addTargetTiltCharacteristic.bind(this)(service,
        service.getCharacteristic(this.Characteristic.TargetVerticalTiltAngle),
        {
            item: CURRENT_TARGET_POSITION_CONFIG.verticalTiltItem,
            rangeStart: CURRENT_TARGET_POSITION_CONFIG.verticalTiltItemRangeStart,
            rangeEnd: CURRENT_TARGET_POSITION_CONFIG.verticalTiltItemRangeEnd
        },
        true
    );
}

function addCurrentPositionCharacteristic(service) {
    let item, itemType, inverted, multiplier;
    let manuMode = this._checkInvertedConf(CURRENT_TARGET_POSITION_CONFIG.manuMode);
    if(this._config[CURRENT_TARGET_POSITION_CONFIG.stateItem]) {
        [item, itemType] = this._getAndCheckItemType(CURRENT_TARGET_POSITION_CONFIG.stateItem, ['Rollershutter', 'Number', 'Switch', 'Contact']);
        inverted = this._checkInvertedConf(CURRENT_TARGET_POSITION_CONFIG.stateItemInverted);
        multiplier = this._checkMultiplierConf(CURRENT_TARGET_POSITION_CONFIG.stateItemMultiplier, itemType);
    } else {
        [item, itemType] = this._getAndCheckItemType(CURRENT_TARGET_POSITION_CONFIG.item, ['Rollershutter', 'Number', 'Switch']);
        inverted = this._checkInvertedConf(CURRENT_TARGET_POSITION_CONFIG.inverted);
        multiplier = this._checkMultiplierConf(CURRENT_TARGET_POSITION_CONFIG.multiplier, itemType);
    }

    let targetCharacteristic = manuMode ? service.getCharacteristic(this.Characteristic.TargetPosition) : null;

    addCurrentStateCharacteristic.bind(this)(service.getCharacteristic(this.Characteristic.CurrentPosition),
        item,
        itemType,
        inverted,
        positionTransformation.bind(this,
            multiplier,
            service.getCharacteristic(this.Characteristic.TargetPosition)
        ),
        targetCharacteristic
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
    // In order to know if this is the setter and apply `UP`/`DOWN` to it in case of 100 and 0
    if(itemType === 'Rollershutter') {
        itemType = `${itemType}Setter`;
    }
    addTargetStateCharacteristic.bind(this)(service.getCharacteristic(this.Characteristic.TargetPosition),
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

        this._log.debug(`Creating hold position state characteristic for ${this.name} with item ${item}`);

        service.getCharacteristic(this.Characteristic.HoldPosition) // Never tested, since I don't know how to invoke it
            .on('set', setState.bind(this,
                item, {
                1: "STOP",
                "_default": ""
            }));

    } catch(e) {
        this._log.debug(`Not configuring hold position characteristic for ${this.name}: ${e.message}`);
        service.removeCharacteristic(this.Characteristic.HoldPosition);
    }
}

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
                    100;
            } else if (value === offCommand) {
                transformedValue = inverted ?
                    100 :
                    0;
            } else {
                if(value >= 50 && !(inverted)) {
                    transformedValue = onCommand;
                } else {
                    transformedValue = offCommand;
                }
            }
            break;
        case 'RollershutterSetter':
        case 'Rollershutter':
        case 'Number':
            //This part is only invoked if this is used in a setter context and the item is a rollershutter
            if(type === 'RollershutterSetter' && value === 100) {
                transformedValue = 'UP';
            } else if(type === 'RollershutterSetter' && value === 0) {
                transformedValue = 'DOWN';
            } else {

                if (inverted) {
                    transformedValue = Math.floor(100 - (parseFloat(value) * multiplier));
                } else {
                    transformedValue = Math.floor(parseFloat(value) * multiplier);
                }
            }
            break;
    }

    this._log.debug(`Transformed ${value} with inverted set to ${inverted} and multiplier set to ${multiplier} for ${this.name} (type: ${type}) to ${transformedValue}`);
    return transformedValue;
}

module.exports = {
    addCurrentPositionCharacteristic,
    addTargetPositionCharacteristic,
    addHoldPositionCharacteristic,
    addPositionStateCharacteristic,
    addCurrentTiltCharacteristic,
    addTargetTiltCharacteristic,
    addCurrentHorizontalTiltCharacteristic,
    addTargetHorizontalTiltCharacteristic,
    addCurrentVerticalTiltCharacteristic,
    addTargetVerticalTiltCharacteristic
};

