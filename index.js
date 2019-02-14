const fs = require('fs');
const sleep = require('sleep');

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
                openHAB: new OpenHAB(config.host, config.port, log),
                api:  api,
                log: log
            };
        }

        this._factories = {};

        // Loading accessories from file system
        this._log(`Loading accessory types...`);
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
                        this._log(`Loading and activating accessory type ${accessoryType}`);
                        this._factories[accessoryType] = require(accessoryFilePath).createAccessory;
                    }
                }
            }
        }.bind(this));

        this._log.info(`Waiting for openHAB host (${config.host}) to come online...`);
        let online = false;
        while(!online) {
            sleep.sleep(2);
            this._log.debug(`Checking if openHAB host (${config.host}) is online...`);
            online = this._platform.openHAB.isOnline();
        }
        sleep.sleep(10);
        this._log.info(`openHAB host (${config.host}) is online, now syncing...`);
        this._platform.openHAB.syncItemTypes();

        this._log.info(`'OpenHAB2 - Complete Edition' plugin loaded - Version ${version}`);
        this._log.info(`---`);
    }

    accessories(callback) {
        let _accessories = [];
        const configuration = this._config.accessories;
        this._log.info(`Loading accessories from configuration, this might take a while...`);
        configuration.forEach(function(acc) {
            this.parseAccessoryConfiguration(acc, _accessories);
        }.bind(this));
        this._platform.openHAB.startSubscription();
        this._platform.openHAB.syncItemValues();
        this._log.info(`Finished loading accessories from configuration`);
        this._log.info(`---`);
        callback(_accessories);
    }

    parseAccessoryConfiguration(configuration, accessories) {
        try {
            if (!(configuration.type)) {
                throw new Error(`Invalid configuration: Accessory type is undefined: ${JSON.stringify(configuration)}`);
            }

            const factory = this._factories[configuration.type];
            if (factory === undefined) {
                throw new Error(`Invalid configuration: Accessory type is unknown: ${configuratioconfigurationn.type}`);
            }

            if(configuration.items && configuration.items instanceof Array) {
                configuration.items.forEach(function(acc) {
                    acc.type = configuration.type;
                    this.parseAccessoryConfiguration(acc, accessories);
                }.bind(this));
            } else {
                if (configuration.name) {
                    configuration.serialNumber = SerialNumberGenerator.generate(configuration.name, configuration.type);
                } else {
                    throw new Error(`Invalid configuration: Accessory name is undefined: ${JSON.stringify(configuration)}`);
                }

                this._log.debug(`Found accessory in config: '${configuration.name}' (${configuration.type})`);
                configuration.version = version;
                // Checked that: 'serialNumber' 'version' 'name' exists and 'type' is valid
                const accessory = factory(this._platform, configuration);
                accessories.push(accessory);
                this._log(`Added accessory ${configuration.name} (Type: ${configuration.type})`);
            }
        } catch (e) {
            this._log.warn(`Unable to add accessory ${configuration.name}: ${e}, skipping`);
        }
    }
};
