const util = require("util");

const version = require('./package.json').version;
const platformName = require('./package').name;
const platformPrettyName = 'openHAB2-Complete';

const SerialNumberGenerator = require('./util/SerialNumberGenerator');
const {OpenHAB} = require('./util/OpenHAB');

const SwitchAccessory = require("./accessory/Switch").createSwitchAccessory;
const LightAccessory = require("./accessory/Light").createLightAccessory;
const TemperatureSensorAccessory = require("./accessory/TemperatureSensor").createTemperatureSensorAccessory;
const HumiditySensorAccessory = require("./accessory/HumiditySensor").createHumiditySensorAccessory;
const ThermostatAccessory = require("./accessory/Thermostat").createThermostatAccessory;
const WindowCoveringAccessory = require("./accessory/WindowCovering").createWindowCoveringAccessory;
const MotionSensorAccessory = require("./accessory/MotionSensor").createMotionSensorAccessory;


module.exports = (homebridge) => {
    homebridge.registerPlatform(platformName, platformPrettyName, OpenHABComplete);
};

const OpenHABComplete = class {
    constructor(log, config, api) {

        this._log.error(JSON.stringify(api.hap.Service));
        this._factories = {
            switch: SwitchAccessory,
            light: LightAccessory,
            temp: TemperatureSensorAccessory,
            humidity: HumiditySensorAccessory,
            thermostat: ThermostatAccessory,
            windowcovering: WindowCoveringAccessory,
            motionsensor: MotionSensorAccessory
        };

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
            this._log.error(JSON.stringify(api));
            this._log.error("###############################");


            this._platform = {
                openHAB: new OpenHAB(config.host, config.port),
                api:  api,
                log: log
            };
        }
        this._log.info(`OpenHAB2 - Complete Edition - Plugin Loaded - Version ${version}`);
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
                acc.serialNumber = SerialNumberGenerator.generate(acc.name);
            } else {
                this._log.warn(`Invalid configuration: Accessory name is unknown: ${util.inspect(acc)}, skipping`);
                return;
            }

            this._log.debug(`Found accessory in config: "${acc.name}"`);

            acc.version = version;

            try {
                // Checked that: 'serialNumber' 'version' 'name' exists and 'type' is valid
                this._log(JSON.stringify(this._platform));
                let accessory = factory(this._platform, acc);
                _accessories.push(accessory);
                this._log.info(`Added accessory ${acc.name}`);
            } catch (e) {
                this._log(`Unable to add accessory ${acc.name}: ${e}, skipping`);
            }
        });
        callback(_accessories);
    }
};
