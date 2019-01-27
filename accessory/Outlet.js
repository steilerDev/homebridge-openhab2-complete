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
        let transformation;
        try {

            [this._inUseItem, this._inUseType] = this._getAndCheckItemType(IN_USE_CONF.inUseItem, ['Switch', 'Contact', 'Number'], true);

            if (this._inUseType === "Switch") {
                transformation = {
                    "ON": true,
                    "OFF": false
                };
            } else if (this._inUseType === "Contact") {
                transformation = {
                    "OPEN": true,
                    "CLOSED": false
                }
            } else if (this._inUseType === "Number") {
                transformation = function (value) {
                    return parseFloat(value) > 0;
                };
            }
            outletService.getCharacteristic(this.Characteristic.OutletInUse)
                .on('get', getState.bind(this,
                    this._inUseItem,
                    transformation
                ));
            this._subscribeCharacteristic(outletService,
                this.Characteristic.OutletInUse,
                this._inUseItem,
                transformation
            );
        } catch {
            let transformation = {
                "ON": true,
                "OFF": false
            };
            outletService.getCharacteristic(this.Characteristic.OutletInUse)
                .on('get', getState.bind(this,
                    this._item,
                    transformation
                ));
            this._subscribeCharacteristic(outletService,
                this.Characteristic.OutletInUse,
                this._item,
                transformation
            );
        }
    }

}

const type = "outlet";

function createAccessory(platform, config) {
    return new OutletAccessory(platform, config);
}

module.exports = {createAccessory, type};
