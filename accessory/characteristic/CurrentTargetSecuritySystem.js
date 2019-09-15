'use strict';

const {setState} = require('../../util/Util');

const CURRENT_TARGET_SECURITY_CONFIG = {
    item: "item"
};

function addSecuritySystemStateCharacteristic(service) {
    let currentSystemCharacteristic = service.getCharacteristic(this.Characteristic.SecuritySystemCurrentState);
    let targetSystemCharacteristic = service.getCharacteristic(this.Characteristic.SecuritySystemTargetState);
    try {
        let [item] = this._getAndCheckItemType(CURRENT_TARGET_SECURITY_CONFIG.item, ['String']);

        this._log.debug(`Creating binary sensor characteristic for ${this.name} with item ${item} and inverted set to ${inverted}`);


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

    } catch (e) {
        service.removeCharacteristic(currentSystemCharacteristic);
        service.removeCharacteristic(targetSystemCharacteristic);
        throw new Error(`Not configuring security system characteristic for ${this.name}: ${e.message}`);
    }
}

function securitySystemTransformation(value) {
    if(isNaN(parseFloat(value))) {
        const STATES = {
            StayArm: 0,
            AwayArm: 1,
            NightArm: 2,
            Disarmed: 3,
            AlarmTriggered: 4
        };
        return STATES[value] === undefined ? -1 : STATES[value];
    } else {
        return parseFloat(value);
    }
}

module.exports = {addSecuritySystemStateCharacteristic};

