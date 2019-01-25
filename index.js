const fs = require('fs');

const version = require('./package').version;
const platformName = require('./package').name;
const platformPrettyName = 'openHAB2-Complete';

const SerialNumberGenerator = require('./util/SerialNumberGenerator');
const {OpenHAB} = require('./util/OpenHAB');

module.exports = (homebridge) => {
    homebridge.registerPlatform(platformName, platformPrettyName, OpenHABComplete);
};

const OpenHABComplete = class {
    constructor(log, config, api) {

        this._log = log;
        this._config = config;

        if(!(this._config.host)) {
            const msg = `OpenHAB host not configured!`;
            this._log.error(msg);
            throw new Error(msg);
        } else if(!(api)) {
           const msg = `API element not set, please update your homebridge installation`;
           this._log.error(msg);
           throw new Error(msg);
       } else {
            this._platform = {
                openHAB: new OpenHAB(config.host, config.port),
                api:  api,
                log: log
            };
        }

        this._factories = {};

        // Loading accessories from file system
        this._log(`Loading accessories...`);
        let accessoryDirectory = "./accessory";
        let accessoryFiles = fs.readdirSync(accessoryDirectory, {"withFileTypes": true});
        accessoryFiles.forEach(function (accessoryFile) {
            if(accessoryFile.isFile()) {
                let accessoryFilePath = `${accessoryDirectory}/${accessoryFile.name}`;

                let accessoryType = require(accessoryFilePath).type;
                if(accessoryType === undefined || !(typeof accessoryType === "string")) {
                    this._log.warn(`Ignoring ${accessoryFilePath} due to missing 'type' definition`);
                } else {
                    this._log.debug(`Found accessory of type ${accessoryType}`);
                    let accessoryFactory = require(accessoryFilePath).createAccessory;
                    if(accessoryFactory === undefined || !(typeof accessoryFactory === "function")) {
                        this._log.warn(`Ignoring ${accessoryFilePath}, due to missing 'createAccessory' definition`);
                    } else {
                        this._log(`Loading and activating accessory ${type}`);
                        this._factories[type] = require(accessoryFilePath).createAccessory;
                    }
                }
            }
        });

        this._log.info(`'OpenHAB2 - Complete Edition' Plugin Loaded - Version ${version}`);
    }

    accessories(callback) {
        let _accessories = [];
        const { accessories } = this._config;
        accessories.forEach(acc => {
            if (!(acc.type)) {
                this._log.warn(`Invalid configuration: Accessory type is invalid: ${JSON.stringify(acc)}, skipping`);
                return;
            }

            const factory = this._factories[acc.type];
            if (factory === undefined) {
                this._log.warn(`Invalid configuration: Accessory type is unknown: ${JSON.stringify(acc)}, skipping`);
                return;
            }

            if(acc.name) {
                acc.serialNumber = SerialNumberGenerator.generate(acc.name);
            } else {
                this._log.warn(`Invalid configuration: Accessory name is unknown: ${JSON.stringify(acc)}, skipping`);
                return;
            }

            this._log.debug(`Found accessory in config: "${acc.name}"`);

            acc.version = version;

            try {
                // Checked that: 'serialNumber' 'version' 'name' exists and 'type' is valid
                const accessory = factory(this._platform, acc);
                _accessories.push(accessory);
                this._log.info(`Added accessory ${acc.name}`);
            } catch (e) {
                this._log(`Unable to add accessory ${acc.name}: ${e}, skipping`);
            }
        });
        callback(_accessories);
    }
};
