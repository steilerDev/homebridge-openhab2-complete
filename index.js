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
        let accessoryDirectory = `${__dirname}/accessory`;
        let accessoryFiles = fs.readdirSync(accessoryDirectory, {"withFileTypes": true});
        accessoryFiles.forEach(function (accessoryFile) {
            if(accessoryFile.isFile()) {
                let accessoryFilePath = `${accessoryDirectory}/${accessoryFile.name}`;
                let accessoryFileName = accessoryFilePath.split(/[\\/]/).pop();

                let accessoryType = require(accessoryFilePath).type;
                if(accessoryType === undefined || !(typeof accessoryType === "string")) {
                    this._log.warn(`Ignoring ${accessoryFileName} due to missing 'type' definition`);
                } else {
                    this._log.debug(`Found accessory of type ${accessoryType}`);
                    let accessoryFactory = require(accessoryFilePath).createAccessory;
                    if(accessoryFactory === undefined || !(typeof accessoryFactory === "function")) {
                        this._log.warn(`Ignoring ${accessoryFileName}, due to missing 'createAccessory' definition`);
                    } else if (this._factories[accessoryType]) {
                        this._log.warn(`There is already an accessory of type ${accessoryType} loaded, skipping this`);
                    } else {
                        this._log(`Loading and activating accessory ${accessoryType}`);
                        this._factories[accessoryType] = require(accessoryFilePath).createAccessory;
                    }
                }
            }
        }.bind(this));

        this._log.info(`'OpenHAB2 - Complete Edition' plugin loaded - Version ${version}`);
        this._log.info(`---`);
    }

    accessories(callback) {
        let _accessories = [];
        const { accessories } = this._config;
        accessories.forEach(acc => {
            try {
                if (!(acc.type)) {
                    throw new Error(`Invalid configuration: Accessory type is undefined: ${JSON.stringify(acc)}`);
                }

                const factory = this._factories[acc.type];
                if (factory === undefined) {
                    throw new Error(`Invalid configuration: Accessory type is unknown: ${acc.type}`);
                }

                if (acc.name) {
                    acc.serialNumber = SerialNumberGenerator.generate(acc.name, acc.type);
                } else {
                    throw new Error(`Invalid configuration: Accessory name is undefined: ${JSON.stringify(acc)}`);
                }

                this._log.debug(`Found accessory in config: '${acc.name}' (${acc.type})`);

                acc.version = version;

                // Checked that: 'serialNumber' 'version' 'name' exists and 'type' is valid
                const accessory = factory(this._platform, acc);
                _accessories.push(accessory);
                this._log(`Added accessory ${acc.name} (Type: ${acc.type}`);
            } catch (e) {
                this._log.warn(`Unable to add accessory ${acc.name}: ${e}, skipping`);
            }
        });
        callback(_accessories);
    }
};
