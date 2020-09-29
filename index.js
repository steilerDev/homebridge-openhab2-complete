const fs = require('fs');
const {sleep} = require('./util/Util');

const version = require('./package').version;
const platformName = require('./package').name;
const platformPrettyName = 'openHAB2-Complete';

const SerialNumberGenerator = require('./util/SerialNumberGenerator');
const {OpenHAB} = require('./util/OpenHAB');

const {Accessory} = require('./util/Accessory');

const UUID = {
    AccessoryInformationService: "0000003E-0000-1000-8000-0026BB765291",
    BatteryService: "00000096-0000-1000-8000-0026BB765291"
};

const {BATTERY_CONFIG} = require('./accessory/characteristic/Battery');

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
            sleep(2);
            this._log.debug(`Checking if openHAB host (${config.host}) is online...`);
            online = this._platform.openHAB.isOnline();
        }
        sleep(10);
        this._log.info(`openHAB host (${config.host}) is online, now syncing...`);
        this._platform.openHAB.syncItemTypes();

        this._log.info(`'OpenHAB2 - Complete Edition' plugin loaded - Version ${version} - dev`);
        this._log.info(`---`);
    }

    accessories(callback) {
        let _accessories = [];
        const configuration = this._config.accessories;
        this._log.info(`Loading accessories from configuration, this might take a while...`);
        configuration.forEach(function(acc) {
            let accessory = this.parseAccessoryConfiguration(acc, _accessories);
            if(accessory !== undefined) {
                if(accessory instanceof Array) {
                    _accessories = _accessories.concat(accessory);
                } else {
                    _accessories.push(accessory);
                }
            }
        }.bind(this));
        this._platform.openHAB.startSubscription();
        this._platform.openHAB.syncItemValues();
        for(let val of _accessories) {
            this._platform.api.registerPlatformAccessories(platformName, platformPrettyName, val.getAccessory());
        }
        this._log.info(`Finished loading ${_accessories.length} accessories from configuration`);
        this._log.info(`---`);
        callback(_accessories);
    }

    parseAccessoryConfiguration(configuration) {
        try {
            if (!(configuration.type)) {
                throw new Error(`Invalid configuration: Accessory type is undefined: ${JSON.stringify(configuration)}`);
            }

            if(configuration.type === "group") {
                if(configuration.items && configuration.items instanceof Array) {
                    let groupAccessoryConfig = {};

                    if (configuration.name) {
                        groupAccessoryConfig.serialNumber = SerialNumberGenerator.generate(configuration.name, configuration.type);
                        groupAccessoryConfig.name = configuration.name;
                        groupAccessoryConfig.version = version;
                        if (configuration.model) {
                            groupAccessoryConfig.model = configuration.model;
                        } else {
                            groupAccessoryConfig.model = "Generic Accessory Group"
                        }
                        // Merging battery items
                        groupAccessoryConfig[BATTERY_CONFIG.batteryItem] = configuration[BATTERY_CONFIG.batteryItem];
                        groupAccessoryConfig[BATTERY_CONFIG.batteryItemInverted] = configuration[BATTERY_CONFIG.batteryItemInverted];
                        groupAccessoryConfig[BATTERY_CONFIG.batteryItemThreshold] = configuration[BATTERY_CONFIG.batteryItemThreshold];
                        groupAccessoryConfig[BATTERY_CONFIG.batteryItemChargingState] = configuration[BATTERY_CONFIG.batteryItemChargingState];
                        groupAccessoryConfig[BATTERY_CONFIG.batteryItemChargingStateInverted] = configuration[BATTERY_CONFIG.batteryItemChargingState];
                    } else {
                        throw new Error(`Invalid configuration: Accessory name is undefined: ${JSON.stringify(configuration)}`);
                    }

                    this._log.debug(`Found accessory group in config: '${groupAccessoryConfig.name}' (${configuration.model})`);
                    let accessoryGroup = [];

                    // Get all accessory from the group
                    for (let i = 0; i < configuration.items.length; i++) {
                        let accessory = this.parseAccessoryConfiguration(configuration.items[i]);
                        if (accessory !== undefined) {
                            if (accessory instanceof Array) {
                                accessoryGroup = accessoryGroup.concat(accessory);
                            } else {
                                accessoryGroup.push(accessory);
                            }
                        }
                    }

                    // Merge all provided services, except battery and accessory information services
                    let groupAccessoryServices = [];
                    for (let i = 0; i < accessoryGroup.length; i++) {
                        let groupedAccessory = accessoryGroup[i];
                        for (let n = 0; n < groupedAccessory._services.length; n++) {
                            let groupedService = groupedAccessory._services[n];
                            if (groupedService.UUID === UUID.AccessoryInformationService) {
                                this._log.debug(`Ignoring Accessory Information Service for grouped accessory ${groupAccessoryConfig.name}`)
                            } else if (groupedService.UUID === UUID.BatteryService) {
                                this._log.debug(`Ignoring Battery Service for grouped accessory ${groupAccessoryConfig.name}`)
                            } else {
                                groupedService.subtype = `${groupedAccessory.uuid_base}`;
                                groupAccessoryServices.push(groupedService);
                            }
                        }
                    }
                    this._log.debug(`Creating grouped accessory ${groupAccessoryConfig.name} (${configuration.model}) with ${accessoryGroup.length} accessories and ${groupAccessoryServices.length} services`);
                    let groupAccessory = new Accessory(this._platform, groupAccessoryConfig);
                    groupAccessory._services = groupAccessory._services.concat(groupAccessoryServices);
                    groupAccessory._services.unshift(groupAccessory._getAccessoryInformationService(groupAccessoryConfig.model));
                    this._log.info(`Created grouped accessory ${groupAccessoryConfig.name} (${configuration.model}) with ${accessoryGroup.length} accessories and ${groupAccessoryServices.length} services`);
                    return groupAccessory;
                } else {
                   throw new Error(`Invalid configuration: Accessory group does not define items: ${JSON.stringify(configuration)}`);
                }
            } else {
                // Not an accessory group
                const factory = this._factories[configuration.type];
                if (factory === undefined) {
                    throw new Error(`Invalid configuration: Accessory type is unknown: ${configuration.type}`);
                }

                //
                // Multiple items of the same type grouped in a configuration array
                //
                if(configuration.items && configuration.items instanceof Array) {
                    let accessoryTypeGroup = [];
                    for (let i = 0; i < configuration.items.length; i++) {
                        let accessoryConfiguration = configuration.items[i];
                        accessoryConfiguration.type = configuration.type;
                        let accessory = this.parseAccessoryConfiguration(accessoryConfiguration);
                        if(accessory !== undefined) {
                            accessoryTypeGroup.push(accessory);
                        }
                    }
                    return accessoryTypeGroup;
                } else {
                    //
                    // Single item
                    //
                    if (configuration.name) {
                        configuration.serialNumber = SerialNumberGenerator.generate(configuration.name, configuration.type);
                    } else {
                        throw new Error(`Invalid configuration: Accessory name is undefined: ${JSON.stringify(configuration)}`);
                    }

                    this._log.debug(`Found accessory in config: '${configuration.name}' (${configuration.type})`);
                    configuration.version = version;
                    // Checked that: 'serialNumber' 'version' 'name' exists and 'type' is valid
                    const accessory = factory(this._platform, configuration);
                    this._log(`Added accessory ${configuration.name} (Type: ${configuration.type})`);
                    return accessory;
                }
            }
        } catch (e) {
            this._log.warn(`Unable to add accessory ${configuration.name}: ${e}, skipping`);
            return undefined;
        }
    }
};
