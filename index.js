/*
Config file:
    "platforms" : [
        {
            platform: "openHAB2-REST"
            host: "http://hc.steilergroup.net"
            port: 80
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
    homebridge.registerAccessory(platformName, accessorySwitchPrettyName, SwitchAccessory);
};

const SerialNumberPrefixes = {
    switch: 'SW',
};

const OpenHABREST = class {
    constructor(log, config, api) {
        this.log = log;
        this.log(`OpenHAB2 REST Plugin Loaded - Version ${version}`);
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
            this.log(`Found accessory in config: "${acc.name}"`);
            if (acc.type === undefined || acc.type.length === 0) {
                throw new Error('Invalid configuration: Accessory type is invalid.');
            }

            const factory = this._factories[acc.type];
            if (factory === undefined) {
                this.log(`Invalid configuration: Accessory type is unknown: ${util.inspect(acc)}`);
                this.log('Skipping.');
                return;
            }

            acc.serialNumber = SerialNumberGenerator.generate(SerialNumberPrefixes[acc.type], acc.name);

            acc.version = version;

            const accessory = factory(acc);
            _accessories.push(accessory);
        });
        callback(_accessories);
    }

    _createSwitch(acc) {
        return new SwitchAccessory(this.api, this.log, acc, this.config.host, this.config.port);
    }
};
