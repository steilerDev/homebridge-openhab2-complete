'use strict';

const {addNumericSensorActorCharacteristic} = require('./Numeric');

const LEVEL_CONFIG = {
    levelItem: "levelItem"
};

function addCarbonDioxideLevelCharacteristic(service) {
    addNumericSensorActorCharacteristic.bind(this)(service,
        service.getCharacteristic(this.Characteristic.CarbonDioxideLevel),
        {item: LEVEL_CONFIG.levelItem}
    );
}

function addCarbonMonoxideLevelCharacteristic(service) {
    addNumericSensorActorCharacteristic.bind(this)(service,
        service.getCharacteristic(this.Characteristic.CarbonMonoxideLevel),
        {item: LEVEL_CONFIG.levelItem}
    );
}

function addFilterLifeLevelCharacteristic(service) {
    addNumericSensorActorCharacteristic.bind(this)(service,
        service.getCharacteristic(this.Characteristic.FilterLifeLevel),
        {item: LEVEL_CONFIG.levelItem}
    );
}

module.exports = {
    addCarbonDioxideLevelCharacteristic,
    addCarbonMonoxideLevelCharacteristic,
    addFilterLifeLevelCharacteristic
};
