'use strict';

const {BinaryActorAccessory} = require('./BinaryActor');
const {getState} = require('./Accessory');

const IN_USE_CONF = {
   inUseItem: "inUseItem"
};

class OutletAccessory extends BinaryActorAccessory {

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
        this._configureOnCharacteristic(outletService);
        this._configureInUseCharacteristic(outletService);
        return outletService;

    }

    _configureInUseCharacteristic(outletService) {
       if(this._config[IN_USE_CONF.inUseItem]) {
           this._inUseItem = this._config[IN_USE_CONF.inUseItem];
           this._inUseType = this._getAndCheckItemType(this._inUseItem, ['Switch', 'Contact', 'Number'], true);

           if(this._inUseType === "Switch") {
               outletService.getCharacteristic(this.Characteristic.OutletInUse)
                   .on('get', getState.bind(this, this._inUseItem, {
                       "ON": true,
                       "OFF": false
                   }));
           } else if (this._inUseType === "Contact") {
               outletService.getCharacteristic(this.Characteristic.OutletInUse)
                   .on('get', getState.bind(this, this._inUseItem, {
                       "OPEN": true,
                       "CLOSED": false
                   }));
           } else if (this._inUseType === "Number") {
               outletService.getCharacteristic(this.Characteristic.OutletInUse)
                   .on('get', getState.bind(this, this._inUseItem, function(value) {
                       return parseFloat(value) > 0;
                   }));
           }
       } else {
           outletService.getCharacteristic(this.Characteristic.OutletInUse)
               .on('get', getState.bind(this, this._item, {
                   "ON": true,
                   "OFF": false
               }));
       }
    }

}

const type = "outlet";

function createAccessory(platform, config) {
    return new OutletAccessory(platform, config);
}

module.exports = {createAccessory, type};
