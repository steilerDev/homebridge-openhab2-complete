'use strict';

const {Accessory} = require('../util/Accessory');
const {addOnCharacteristic} = require('./characteristic/On');
const {addInUseCharacteristic} = require('./characteristic/InUse');

class OutletAccessory extends Accessory {

    constructor(platform, config) {
        super(platform, config);

        // Services will be retrieved by homebridge
        this._services = [
            this._getAccessoryInformationService('Outlet'),
            this._getPrimaryService()
        ]
    }

    _getPrimaryService() {
        this._log.debug(`Creating outlet service for ${this.name} [${this._item}]`);
        let outletService = new this.Service.Outlet(this.name);
        addOnCharacteristic.bind(this)(outletService);
        addInUseCharacteristic.bind(this)(outletService, this.Characteristic.OutletInUse);
        return outletService;
    }
}

const type = "outlet";

function createAccessory(platform, config) {
    return new OutletAccessory(platform, config);
}

module.exports = {createAccessory, type};
