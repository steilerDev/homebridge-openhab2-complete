'use strict';

function getAccessoryInformationService(platform, config, model) {
    let Characteristic = platform["api"].hap.Characteristic;
    let Service = platform["api"].hap.Service;
    return new Service.AccessoryInformation()
        .setCharacteristic(Characteristic.Name, config.name)
        .setCharacteristic(Characteristic.Manufacturer, 'steilerDev')
        .setCharacteristic(Characteristic.Model, `openHAB2 ${model}`)
        .setCharacteristic(Characteristic.SerialNumber, config.serialNumber)
        .setCharacteristic(Characteristic.FirmwareRevision, config.version)
        .setCharacteristic(Characteristic.HardwareRevision, config.version);
}

module.exports = {
    getAccessoryInformationService: getAccessoryInformationService
};