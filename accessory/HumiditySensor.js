'use strict';

const {Accessory}  = require('../util/Accessory');
const {addCurrentRelativeHumidityCharacteristic} = require('./characteristic/Numeric');

class HumiditySensorAccessory extends Accessory {
    constructor(platform, config) {
        super(platform, config);
        this._services.unshift(this._getAccessoryInformationService('Humidity Sensor'));
        this._services.push(this._getPrimaryService());
    }

    _getPrimaryService() {
        this._log.debug(`Creating humidity sensor service for ${this.name}`);
        let primaryService = new this.Service.HumiditySensor(this.name);
        addCurrentRelativeHumidityCharacteristic.bind(this)(primaryService);
        primaryService.isPrimaryService = true;
        return primaryService;
    }
}

const type = "humidity";

function createAccessory(platform, config) {
    return new HumiditySensorAccessory(platform, config);
}

module.exports = {createAccessory, type};

