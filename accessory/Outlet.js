'use strict';

const {Accessory} = require('../util/Accessory');
const {addOnCharacteristic} = require('./characteristic/On');
const {addOutletInUseCharacteristic} = require('./characteristic/InUse');

class OutletAccessory extends Accessory {

    constructor(platform, config) {
        super(platform, config);
        this._services.push([
            this._getAccessoryInformationService('Outlet'),
            this._getPrimaryService()
        ]);
    }

    _getPrimaryService() {
        this._log.debug(`Creating outlet service for ${this.name}`);
        let primaryService = new this.Service.Outlet(this.name);
        addOnCharacteristic.bind(this)(primaryService);
        addOutletInUseCharacteristic.bind(this)(primaryService);
        return primaryService;
    }
}

const type = "outlet";

function createAccessory(platform, config) {
    return new OutletAccessory(platform, config);
}

module.exports = {createAccessory, type};
