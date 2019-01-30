'use strict';

const {getState} = require('../../util/Accessory');

const BINARY_CONFIG = {
    item: "item",
    inverted: "inverted"
};

// This function will try and add a battery warning characteristic to the provided service
function addBinarySensorCharacteristic(characteristic, optional) {
    try {
        let [item] = this._getAndCheckItemType(BINARY_CONFIG.item, ['Contact', 'Switch']);
        let inverted = this._checkInvertedConf(BINARY_CONFIG.inverted);

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
        if(optional) {
            this._log.debug(msg);
        } else {
            throw new Error(msg);
        }
    }
}

function addCarbonDioxideDetectedCharacteristic(service) {
    addBinarySensorCharacteristic.bind(this)(service.getCharacteristic(this.Characteristic.CarbonDioxideDetected));
}

function addContactSensorCharacteristic(service) {
    addBinarySensorCharacteristic.bind(this)(service.getCharacteristic(this.Characteristic.ContactSensorState));
}

function addCarbonMonoxideDetectedCharacteristic(service) {
    addBinarySensorCharacteristic.bind(this)(service.getCharacteristic(this.Characteristic.CarbonMonoxideDetected));
}

function addFilterChangeIndicationCharacteristic(service) {
    addBinarySensorCharacteristic.bind(this)(service.getCharacteristic(this.Characteristic.FilterChangeIndication));
}

function addLeakDetectedCharacteristic(service) {
    addBinarySensorCharacteristic.bind(this)(service.getCharacteristic(this.Characteristic.LeakDetected));
}

function addMotionDetectedCharacteristic(service) {
    addBinarySensorCharacteristic.bind(this)(service.getCharacteristic(this.Characteristic.MotionDetected));
}

function addOccupancyDetectedCharacteristic(service) {
    addBinarySensorCharacteristic.bind(this)(service.getCharacteristic(this.Characteristic.OccupancyDetected));
}

function addSmokeDetectedCharacteristic(service) {
    addBinarySensorCharacteristic.bind(this)(service.getCharacteristic(this.Characteristic.SmokeDetected));
}

module.exports = {
    addCarbonDioxideDetectedCharacteristic,
    addContactSensorCharacteristic,
    addCarbonMonoxideDetectedCharacteristic,
    addFilterChangeIndicationCharacteristic,
    addLeakDetectedCharacteristic,
    addMotionDetectedCharacteristic,
    addOccupancyDetectedCharacteristic,
    addSmokeDetectedCharacteristic
};
