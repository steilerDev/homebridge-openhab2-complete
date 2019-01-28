'use strict';

const Accessory = require('../util/Accessory');
const {addSecuritySystemStateCharacteristic} = require('./characteristic/CurrentTargetSecuritySystem');

class SecuritySystemAccessory extends Accessory.Accessory {

    constructor(platform, config) {
        super(platform, config);

        // Services will be retrieved by homebridge
        this._services = [
            this._getAccessoryInformationService('Security System'),
            this._getPrimaryService()
        ]
    }

    _getPrimaryService() {
        this._log.debug(`Creating security system service for ${this.name}`);
        let securitySystemService = new this.Service.SecuritySystem(this.name);
        addSecuritySystemStateCharacteristic.bind(this)(securitySystemService);
        return securitySystemService;
    }
}

const type = "security";

function createAccessory(platform, config) {
    return new SecuritySystemAccessory(platform, config);
}

module.exports = {createAccessory, type};
