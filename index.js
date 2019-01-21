/*
Config file:
    "platforms" : [
        {
            platform: "openHAB2-REST"
            host: "http://hc.steilergroup.net"
            port: 80 // optional
            accessories: [
                {
                    type: "switch",
                    name: "abc",
                    habItem: "abcde"
                }
            ]

    ]
 */


var util = require("util");

const version = require('./package.json').version;

const SerialNumberGenerator = require('./util/SerialNumberGenerator');
const SwitchAccessory = require('./accessory/Switch');

const HOMEBRIDGE = {
    Accessory: null,
    Service: null,
    Characteristic: null,
    UUIDGen: null
};

const platformName = 'homebridge-openhab2-rest';
const platformPrettyName = 'openHAB2-REST';
const accessorySwitchPrettyName = 'openHAB2-REST-Switch';

module.exports = (homebridge) => {
    HOMEBRIDGE.Accessory = homebridge.platformAccessory;
    HOMEBRIDGE.Service = homebridge.hap.Service;
    HOMEBRIDGE.Characteristic = homebridge.hap.Characteristic;
    HOMEBRIDGE.UUIDGen = homebridge.hap.uuid;

    homebridge.registerPlatform(platformName, platformPrettyName, OpenHABREST);
//    homebridge.registerAccessory(platformName, accessorySwitchPrettyName, SwitchAccessory);
};

const SerialNumberPrefixes = {
    switch: 'SW',
};

const OpenHABREST = class {
    constructor(log, config, api) {
        this.log = log;
        this.log.info(`OpenHAB2 REST Plugin Loaded - Version ${version}`);
        this.config = config;
        this.api = api;

        this._factories = {
            switch: this._createSwitch.bind(this)
        };
    }

    accessories(callback) {
        let _accessories = [];
        const { accessories } = this.config;
        accessories.forEach(acc => {
            if (!(acc.type)) {
                this.log.warn(`Invalid configuration: Accessory type is invalid: ${util.inspect(acc)}, skipping`);
                return;
            }

            const factory = this._factories[acc.type];
            if (factory === undefined) {
                this.log.warn(`Invalid configuration: Accessory type is unknown: ${util.inspect(acc)}, skipping`);
                return;
            }

            if(acc.name) {
                acc.serialNumber = SerialNumberGenerator.generate(SerialNumberPrefixes[acc.type], acc.name);
            } else {
                this.log.warn(`Invalid configuration: Accessory name is unknown: ${util.inspect(acc)}, skipping`);
            }

            this.log.debug(`Found accessory in config: "${acc.name}"`);

            if(!(this.config.host)) {
                this.log.error(`No openHAB host defined, skipping`);
            }

            acc.version = version;

            try {
                // Checked that: serial number exists, name exists and type is valid
                const accessory = factory(acc);
                _accessories.push(accessory);
                this.log.info(`Created accessory ${acc.name}`);
            } catch (e) {
                this.log(`Unable to create accessory ${acc.name}: ${e}, skipping`)
            }
        });
        callback(_accessories);
    }

    _createSwitch(acc) {
        return new SwitchAccessory(this.api, this.log, acc, this.config.host, this.config.port);
    }
};
