'use strict';

const {setState, getState} = require('../../util/Util');

const CURRENT_TARGET_SECURITY_CONFIG = {
    item: "item"
};

const securitySystemTransformation = {
    StayArm: 0,
    0: "StayArm",
    AwayArm: 1,
    1: "AwayArm",
    NightArm: 2,
    2: "NightArm",
    Disarmed: 3,
    3: "Disarmed: 3",
    AlarmTriggered: 4,
    4: "AlarmTriggered"
};

function addSecuritySystemStateCharacteristic(service) {
    let currentSystemCharacteristic = service.getCharacteristic(this.Characteristic.SecuritySystemCurrentState);
    let targetSystemCharacteristic = service.getCharacteristic(this.Characteristic.SecuritySystemTargetState);
    try {
        let [item] = this._getAndCheckItemType(CURRENT_TARGET_SECURITY_CONFIG.item, ['String']);

        this._log.debug(`Creating security system characteristic for ${this.name} with item ${item}`);

        currentSystemCharacteristic.on('get', getState.bind(this,
            item,
            securitySystemTransformation
        ));
        this._subscribeCharacteristic(currentSystemCharacteristic,
            item,
            securitySystemTransformation
        );

        targetSystemCharacteristic.on('get', getState.bind(this,
            item,
            securitySystemTransformation
        ));
        targetSystemCharacteristic.on('set', setState.bind(this,
            item,
            securitySystemTransformation
        ));
        this._subscribeCharacteristic(targetSystemCharacteristic,
            item,
            securitySystemTransformation
        );

    } catch (e) {
        service.removeCharacteristic(currentSystemCharacteristic);
        service.removeCharacteristic(targetSystemCharacteristic);
        throw new Error(`Not configuring security system characteristic for ${this.name}: ${e.message}`);
    }
}

module.exports = {addSecuritySystemStateCharacteristic};

