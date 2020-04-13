'use strict';

const {getState, setState} = require('../../util/Util');

const BINARY_CONFIG = {
    item: "item",
    inverted: "inverted"
};

const {CURRENT_TARGET_DOOR_CONFIG} = require('./CurrentTargetPositionDiscrete');


function addBinarySensorCharacteristicWithTransformation(service, characteristic, CONFIG, transformation, optional) {
    try {
        let [item] = this._getAndCheckItemType(CONFIG.item, ['Contact', 'Switch']);
        let inverted = this._checkInvertedConf(CONFIG.inverted);

        this._log.debug(`Creating binary sensor characteristic for ${this.name} with item ${item} and inverted set to ${inverted}`);

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

function addBinarySensorCharacteristic(service, characteristic, CONFIG, optional) {
    let inverted = this._checkInvertedConf(CONFIG.inverted);
    let transformation = {
        "OFF": inverted,
        "ON": !inverted,
        "CLOSED": inverted,
        "OPEN": !inverted
    };
    addBinarySensorCharacteristicWithTransformation.bind(this)(service, characteristic, CONFIG, transformation, optional);
}

function addBinarySensorActorCharacteristicWithTransformation(service, characteristic, CONFIG, transformation, optional) {
    try {
        let [item] = this._getAndCheckItemType(CONFIG.item, ['Switch']);
        let inverted = this._checkInvertedConf(CONFIG.inverted);

        this._log.debug(`Creating binary actor characteristic for ${this.name} with item ${item} and inverted set to ${inverted}`);

        characteristic.on('set', setState.bind(this,
                item,
                transformation
            ))
            .on('get', getState.bind(this,
                item,
                transformation
            ));

        this._subscribeCharacteristic(characteristic,
            item,
            transformation
        );
    } catch(e) {
        let msg = `Not configuring binary actor characteristic for ${this.name}: ${e.message}`;
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

function addObstructionDetectedCharacteristic(service, optional) {
    try {
        addBinarySensorCharacteristic.bind(this)(service, service.getCharacteristic(this.Characteristic.ObstructionDetected), {item: CURRENT_TARGET_DOOR_CONFIG.obstructionItem, inverted: CURRENT_TARGET_DOOR_CONFIG.obstructionItemInverted}, optional);
    } catch(e) {
        this._log.debug(`Unable to add obstruction detected characteristic: ${e}, adding default behaviour`);
        service.getCharacteristic(this.Characteristic.ObstructionDetected).on('get', function(callback) {
            callback(null, false);
        });
    }
}

function addOnCharacteristic(service, optional) {
    let inverted = this._checkInvertedConf(BINARY_CONFIG.inverted);
    let transformation = {
        "OFF": inverted ,
        "ON": !inverted,
        [!inverted]: "ON",
        [inverted]: "OFF"
    };
    addBinarySensorActorCharacteristicWithTransformation.bind(this)(service, service.getCharacteristic(this.Characteristic.On), BINARY_CONFIG, transformation, optional);
}

function addActiveCharacteristic(service, optional) {
    let inverted = this._checkInvertedConf(BINARY_CONFIG.inverted);
    let transformation = {
        "OFF": inverted ? 1 : 0,
        "ON": inverted ? 0 : 1,
        [inverted ? 0 : 1]: "ON",
        [inverted ? 1 : 0]: "OFF"
    };
    addBinarySensorActorCharacteristicWithTransformation.bind(this)(service, service.getCharacteristic(this.Characteristic.Active), BINARY_CONFIG, transformation, optional);
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
    addObstructionDetectedCharacteristic,
    addOnCharacteristic,
    addActiveCharacteristic,
    addBinarySensorCharacteristicWithTransformation,
    addBinarySensorActorCharacteristicWithTransformation
};
