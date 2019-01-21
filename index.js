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
                    habItem: "abcde" // This is expected to be a "Switch" item
                },
                {
                    type: "light",
                    name: "abc",
                    habItem: "abcde"
                }

            ]

    ]
 */


const util = require("util");
const version = require('./package.json').version;
const SerialNumberGenerator = require('./util/SerialNumberGenerator');
const SwitchAccessory = require('./accessory/Switch');
const OpenHAB = require('./util/OpenHAB');

const platformName = 'homebridge-openhab2-rest';
const platformPrettyName = 'openHAB2-REST';

module.exports = (homebridge) => {
    homebridge.registerPlatform(platformName, platformPrettyName, OpenHABREST);
};

const SerialNumberPrefixes = {
    switch: 'SW',
};

const OpenHABREST = class {
    constructor(log, config, api) {
        this._log = log;
        this._config = config;

        if(this._config.host) {
            this._openHAB = new OpenHAB(config.host, config.port);
        } else {
            const msg = `OpenHAB host not configured!`;
            this._log.error(msg);
            throw new Error(msg);
        }

       if(api) {
           this._api = api;
       } else {
           const msg = `API element not set, please update your homebridge installation`;
           this._log.error(msg);
           throw new Error(msg);
       }

        this._factories = {
            switch: this._createSwitch.bind(this)
        };

        this._log.info(`OpenHAB2 REST Plugin Loaded - Version ${version}`);
    }

    accessories(callback) {
        let _accessories = [];
        const { accessories } = this._config;
        accessories.forEach(acc => {
            if (!(acc.type)) {
                this._log.warn(`Invalid configuration: Accessory type is invalid: ${util.inspect(acc)}, skipping`);
                return;
            }

            const factory = this._factories[acc.type];
            if (factory === undefined) {
                this._log.warn(`Invalid configuration: Accessory type is unknown: ${util.inspect(acc)}, skipping`);
                return;
            }

            if(acc.name) {
                acc.serialNumber = SerialNumberGenerator.generate(SerialNumberPrefixes[acc.type], acc.name);
            } else {
                this._log.warn(`Invalid configuration: Accessory name is unknown: ${util.inspect(acc)}, skipping`);
                return;
            }

            this._log.debug(`Found accessory in config: "${acc.name}"`);

            acc.version = version;

            try {
                // Checked that: 'serialNumber' 'version' 'name' exists and 'type' is valid
                const accessory = factory(acc);
                _accessories.push(accessory);
                this._log.info(`Added accessory ${acc.name}`);
            } catch (e) {
                this._log(`Unable to add accessory ${acc.name}: ${e}, skipping`)
                return;
            }
        });
        callback(_accessories);
    }

    _createSwitch(acc) {
        return new SwitchAccessory(this._api, this._log, acc, this._openHAB);
    }
};
