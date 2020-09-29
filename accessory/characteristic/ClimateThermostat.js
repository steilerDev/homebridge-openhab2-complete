'use strict';

const {addNumericSensorCharacteristic, addNumericSensorActorCharacteristic} = require('./Numeric');
const {addBinarySensorCharacteristicWithTransformation, addBinarySensorActorCharacteristicWithTransformation} = require('./Binary');

const CLIMATE_THERMOSTAT_CONFIG = {
    heatingItem: "heatingItem",
    heatingItemInverted: "heatingItemInverted",
    coolingItem: "coolingItem",
    coolingItemInverted: "coolingItemInverted",
    modeItem: "modeItem",
    modeItemCapability: "modeItemCapability"
};

function addCurrentHeatingCoolingStateCharacteristic(service) {
    let [heatingItem] = this._getAndCheckItemType(CLIMATE_THERMOSTAT_CONFIG.heatingItem, ['Switch'], true);
    let [coolingItem] = this._getAndCheckItemType(CLIMATE_THERMOSTAT_CONFIG.coolingItem, ['Switch'], true);
    let [modeItem] = this._getAndCheckItemType(CLIMATE_THERMOSTAT_CONFIG.modeItem, ['Number'], true);

    let OFF = 0;
    let HEAT = 1;
    let COOL = 2;
    let AUTO = 3;

    if(modeItem !== null) {
        this._log.debug(`Creating 'CurrentHeatingCoolingState' characteristic for ${this.name} with ${modeItem}`);
        let currentHeatingCoolingStateCharacteristic = service.getCharacteristic(this.Characteristic.CurrentHeatingCoolingState);
        let modeItemCapability = this._config[CLIMATE_THERMOSTAT_CONFIG.modeItemCapability];
        if(modeItemCapability !== undefined) {
            switch(modeItemCapability) {
                case "Heating":
                    currentHeatingCoolingStateCharacteristic.setProps({
                        validValues: [OFF,HEAT]
                    });
                    break;
                case "Cooling":
                    currentHeatingCoolingStateCharacteristic.setProps({
                        validValues: [OFF,COOL]
                    });
                    break;
                case "HeatingCooling":
                    break;
                default:
                    throw new Error(`modeItemCapability has invalid value: ${modeItemCapability}`);
            }
        }
        addNumericSensorCharacteristic.bind(this)(service, currentHeatingCoolingStateCharacteristic, {item: CLIMATE_THERMOSTAT_CONFIG.modeItem});
    } else if(!(heatingItem || coolingItem)) {
        throw new Error(`heatingItem or coolingItem need to be set, if modeItem is not present: ${JSON.stringify(this._config)}`);
    } else {
        this._log.debug(`Creating 'CurrentHeatingCoolingState' characteristic for ${this.name} with heatingItem (${heatingItem})/coolingItem (${coolingItem})`);
        let currentHeatingCoolingStateCharacteristic = service.getCharacteristic(this.Characteristic.CurrentHeatingCoolingState);
        if(heatingItem) {
            this._log.debug(`Creating 'CurrentHeatingCoolingState' characteristic for ${this.name} with heatingItem (${heatingItem})`);
            let inverted = this._checkInvertedConf(CLIMATE_THERMOSTAT_CONFIG.heatingItemInverted);
            let transformation = {
                "OFF": inverted ? HEAT : OFF,
                "ON": inverted ? OFF : HEAT
            };
            addBinarySensorCharacteristicWithTransformation.bind(this)(service, currentHeatingCoolingStateCharacteristic, {item: CLIMATE_THERMOSTAT_CONFIG.heatingItem, inverted: CLIMATE_THERMOSTAT_CONFIG.heatingItemInverted}, transformation);
            currentHeatingCoolingStateCharacteristic.setProps({
                validValues: [OFF,HEAT]
            });
        } else if (coolingItem) {
            this._log.debug(`Creating 'CurrentHeatingCoolingState' characteristic for ${this.name} with coolingItem (${coolingItem})`);
            let inverted = this._checkInvertedConf(CLIMATE_THERMOSTAT_CONFIG.coolingItemInverted);
            let transformation = {
                "OFF": inverted ? COOL : OFF,
                "ON": inverted ? OFF : COOL
            };
            addBinarySensorCharacteristicWithTransformation.bind(this)(service, currentHeatingCoolingStateCharacteristic, {
                item: CLIMATE_THERMOSTAT_CONFIG.coolingItem,
                inverted: CLIMATE_THERMOSTAT_CONFIG.coolingItemInverted
            }, transformation);
            currentHeatingCoolingStateCharacteristic.setProps({
                validValues: [OFF, COOL]
            });
        }
    }
}

function addTargetHeatingCoolingStateCharacteristic(service) {
    let [heatingItem] = this._getAndCheckItemType(CLIMATE_THERMOSTAT_CONFIG.heatingItem, ['Switch'], true);
    let [coolingItem] = this._getAndCheckItemType(CLIMATE_THERMOSTAT_CONFIG.coolingItem, ['Switch'], true);
    let [modeItem] = this._getAndCheckItemType(CLIMATE_THERMOSTAT_CONFIG.modeItem, ['Number'], true);

    let OFF = 0;
    let HEAT = 1;
    let COOL = 2;
    let AUTO = 3;

    if (modeItem !== null) {
        this._log.debug(`Creating 'TargetHeatingCoolingState' characteristic for ${this.name} with ${modeItem}`);
        let targetHeatingCoolingStateCharacteristic = service.getCharacteristic(this.Characteristic.TargetHeatingCoolingState);
        let modeItemCapability = this._config[CLIMATE_THERMOSTAT_CONFIG.modeItemCapability];
        if(modeItemCapability !== undefined) {
            switch(modeItemCapability) {
                case "Heating":
                    targetHeatingCoolingStateCharacteristic.setProps({
                        validValues: [OFF,HEAT,AUTO]
                    });
                    break;
                case "Cooling":
                    targetHeatingCoolingStateCharacteristic.setProps({
                        validValues: [OFF,COOL,AUTO]
                    });
                    break;
                case "HeatingCooling":
                    break;
                default:
                    throw new Error(`modeItemCapability has invalid value: ${modeItemCapability}`);
            }
        }
        addNumericSensorActorCharacteristic.bind(this)(service, targetHeatingCoolingStateCharacteristic, {item: CLIMATE_THERMOSTAT_CONFIG.modeItem});
    } else if(!(heatingItem || coolingItem)) {
        throw new Error(`heatingItem and/or coolingItem needs to be set: ${JSON.stringify(this._config)}`);
    } else {
        let targetHeatingCoolingStateCharacteristic = service.getCharacteristic(this.Characteristic.TargetHeatingCoolingState);
        if(heatingItem) {
            this._log.debug(`Creating 'TargetHeatingCoolingState' characteristic for ${this.name} with heatingItem (${heatingItem})`);
            let inverted = this._checkInvertedConf(CLIMATE_THERMOSTAT_CONFIG.heatingItemInverted);
            let transformation = {
                "OFF": inverted ? HEAT : AUTO,
                "ON": inverted ? AUTO : HEAT,
                [inverted ? AUTO : HEAT]: "ON",
                [inverted ? HEAT : AUTO]: "OFF"
            };

            addBinarySensorActorCharacteristicWithTransformation.bind(this)(service, targetHeatingCoolingStateCharacteristic, {item: CLIMATE_THERMOSTAT_CONFIG.heatingItem, inverted: CLIMATE_THERMOSTAT_CONFIG.heatingItemInverted}, transformation);
            targetHeatingCoolingStateCharacteristic.setProps({
                validValues: [HEAT,AUTO]
            });
        } else if (coolingItem) {
            this._log.debug(`Creating 'CurrentHeatingCoolingState' characteristic for ${this.name} with coolingItem (${coolingItem})`);
            let inverted = this._checkInvertedConf(CLIMATE_THERMOSTAT_CONFIG.coolingItemInverted);
            let transformation = {
                "OFF": inverted ? COOL : AUTO,
                "ON": inverted ? AUTO : COOL,
                [inverted ? AUTO : COOL]: "ON",
                [inverted ? COOL : AUTO]: "OFF"
            };
            addBinarySensorActorCharacteristicWithTransformation.bind(this)(service, targetHeatingCoolingStateCharacteristic, {
                item: CLIMATE_THERMOSTAT_CONFIG.coolingItem,
                inverted: CLIMATE_THERMOSTAT_CONFIG.coolingItemInverted
            }, transformation);
            targetHeatingCoolingStateCharacteristic.setProps({
                validValues: [COOL,AUTO]
            });
        }
    }
}

module.exports = {
    addCurrentHeatingCoolingStateCharacteristic,
    addTargetHeatingCoolingStateCharacteristic
};