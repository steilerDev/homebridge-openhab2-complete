'use strict';

const {getState} = require('../../util/Accessory');

const BINARY_CONFIG = {
    item: "item",
    inverted: "inverted"
};

const {CURRENT_TARGET_DOOR_CONFIG} = require('./CurrentTargetPositionDiscrete');

// This function will try and add a battery warning characteristic to the provided service
function addBinarySensorCharacteristic(service, characteristic, CONFIG, optional) {
    try {
        let [item] = this._getAndCheckItemType(CONFIG.item, ['Contact', 'Switch']);
        let inverted = this._checkInvertedConf(CONFIG.inverted);

        this._log.debug(`Creating binary sensor characteristic for ${this.name} with item ${item} and inverted set to ${inverted}`);

        let transformation = {
            "OFF": inverted,
            "ON": !inverted,
            "CLOSED": inverted,
            "OPEN": !inverted
        };

        characteristic.on('get', getState.bind(this,
                item,
                transformation
            ));

        this._subscribeCharacteristic(characteristic,
            item,
            transformation
        );
    } catch (e) {
        let msg = `Not configuring binary sensor characteristic for ${this.name}: ${e.message}`;
        service.removeCharacteristic(characteristic);
        if(optional) {
            this._log.debug(msg);
        } else {
            throw new Error(msg);
        }
    }
}

function addCarbonDioxideDetectedCharacteristic(service) {
    addBinarySensorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.CarbonDioxideDetected), BINARY_CONFIG);
}

function addContactSensorCharacteristic(service) {
    addBinarySensorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.ContactSensorState), BINARY_CONFIG);
}

function addCarbonMonoxideDetectedCharacteristic(service) {
    addBinarySensorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.CarbonMonoxideDetected), BINARY_CONFIG);
}

function addFilterChangeIndicationCharacteristic(service) {
    addBinarySensorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.FilterChangeIndication), BINARY_CONFIG);
}

function addLeakDetectedCharacteristic(service) {
    addBinarySensorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.LeakDetected), BINARY_CONFIG);
}

function addMotionDetectedCharacteristic(service) {
    addBinarySensorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.MotionDetected), BINARY_CONFIG);
}

function addOccupancyDetectedCharacteristic(service) {
    addBinarySensorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.OccupancyDetected), BINARY_CONFIG);
}

function addSmokeDetectedCharacteristic(service) {
    addBinarySensorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.SmokeDetected), BINARY_CONFIG);
}

function addSwingModeCharacteristic(service, optional) {
    addBinarySensorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.SwingMode), {item: "swingItem", inverted: "swingItemInverted"}, optional);
}

function addActiveCharacteristic(service, optional) {
    addBinarySensorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.Active), {item: "activeItem", inverted: "activeItemInverted"}, optional);
}

function addActiveCharacteristicWithDefaultConf(service, optional) {
    addBinarySensorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.Active), BINARY_CONFIG, optional);
}

function addObstructionDetectedCharacteristic(service, optional) {
    addBinarySensorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.ObstructionDetected), {item: CURRENT_TARGET_DOOR_CONFIG.obstructionItem, inverted: CURRENT_TARGET_DOOR_CONFIG.obstructionItemInverted}, optional);
}

module.exports = {
    addCarbonDioxideDetectedCharacteristic,
    addContactSensorCharacteristic,
    addCarbonMonoxideDetectedCharacteristic,
    addFilterChangeIndicationCharacteristic,
    addLeakDetectedCharacteristic,
    addMotionDetectedCharacteristic,
    addOccupancyDetectedCharacteristic,
    addSmokeDetectedCharacteristic,
    addSwingModeCharacteristic,
    addActiveCharacteristic,
    addActiveCharacteristicWithDefaultConf,
    addObstructionDetectedCharacteristic
};
