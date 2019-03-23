'use strict';

const Accessory = require('../util/Accessory');
const {addSecuritySystemStateCharacteristic} = require('./characteristic/CurrentTargetSecuritySystem');

class SecuritySystemAccessory extends Accessory.Accessory {

    constructor(platform, config) {
        super(platform, config);
        this._services.push([
            this._getAccessoryInformationService('Security System'),
            this._getPrimaryService()
        ]);
    }

    _getPrimaryService() {
        this._log.debug(`Creating security system service for ${this.name}`);
        let primaryService = new this.Service.SecuritySystem(this.name);
        addSecuritySystemStateCharacteristic.bind(this)(primaryService);
        return primaryService;
    }
}

const type = "security";

function createAccessory(platform, config) {
    return new SecuritySystemAccessory(platform, config);
}

module.exports = {createAccessory, type};
