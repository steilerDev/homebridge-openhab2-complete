# Changelog of homebridge-openhab2-complete
## Roadmap
### V0.8.0 (planned)
* Implement remaining Services:
  * Water Service Class with
    * Valve
    * Faucet
    * Irrigation
  * Climate Service Class with [Active, Current, Target]
    * Thermostat rework
    * HeaterCooler
    * Humidifier/Dehumidifier
    * Air Purifier
* More efficient configuration layout
* Code audit & documentation
* Extension of `WondowCovering`, `Door` and `Window` to allow manual mode and optional multipliers for state
    

## Changelog
### V0.8.0 (unreleased)
* Added optional `multiplier` and `stateMultiplier` to `WindowCovering`, `Door` and `Window`, in order to multiply openHAB's item state and show it differently in HomeKit
* Added optional `manuMode` to `WindowCovering`, `Door` and `Window`
* Bug fixing:
  * `Rollerhutter` items now receive an `UP` or `DOWN` command if target state is `100`/`0`
  * Fixed issue with lights, where there was a feedback loop based on subscriptions
* Performance improvements:
  * No more duplicate subscriptions on the same item
  * Caching of states improves updating speed when launching Home.app significantly

### V0.7.0
* Major rework to clean up and support subscription
* Subscription supported for every accessory type
* Binary actors can now have `inverted`
* Added `Contact` support for `heatingItem` and `coolingItem` inside thermostat
* Added `stateItem` and `stateItemInverted` to lock mechanism service

### V0.6.0
* Addition of Binary Actors (supported openHAB item: `Switch`):
  * Switch
  * Fan
  * Outlet (with optional Outlet In Use Characteristic)
* Addition of Lock Mechanism Service (supported openHAB item: `Switch`)
* Addition of Security System Service (supported openHAB item: `Switch`)
* Addition of Binary Sensor Filter Maintenance

### V0.5.0
* Addition of CurrentPosition/TargetPosition Actors (Supported openHAB items: `Rollershutter`, `Number` and `Switch`) with optional item representing the service's state (Supported openHAB items: `Rollershutter`, `Number`, `Switch`, `Contact`)
  * Rework of Window Covering Service to use shared functionalities
  * Door Service
  * Window Service
* Removed `mode` from Thermostat Service, now derived from the present of `heatingItem` and/or `coolingItem`

### V0.4.0
* Support for Binary Sensors (Supported openHAB items: `Switch` and `Contact`):
  * Motion Sensor Service (with optional Battery Warning Characteristic)
  * Leak Sensor Service (with optional Battery Warning Characteristic)
  * Carbon Monoxide Sensor (with optional Battery Warning & Level Characteristic)
  * Carbon Dioxide Sensor (with optional Battery Warning & Level Characteristic)
  * Contact Sensor Service (with optional Battery Warning Characteristic)
  * Occupancy Sensor Service (with optional Battery Warning Characteristic)
  * Smoke Sensor Service (with optional Battery Warning Characteristic)
* Support for Light Sensor (Supported openHAB item: `Number`)
* Supporting `Contact` and `Switch` type for Battery Warning Service
* Added optional `stateItem` to Window Covering Service

Breaking Changes:
* Renamed `habBatteryItem` key in configurations with Battery Warning Characteristic to `batteryItem`
* Renamed `habBatteryItemStateWarning` key in configurations with Battery Warning Characteristics `batteryItemInverted: "false" | "true"`

### V0.3.0
* Support for Window Covering Service (Supported openHAB item: `Rollershutter`)

### V0.2.0
* Support for Humidity Sensor Service (Supported openHAB item: `Number`)
* Support for Temperature Sensor Service (Supported openHAB item: `Number`)
* Added Battery Warning Characteristic to Humidity & Temperature Sensor Services (Supported openHAB item: `Switch`)
* Support for Thermostat Service (Supported openHAB item: Compound service of `Number` and `Switch`)

Breaking changes:

* Renamed `habItem` key in configuration to `item`


### V0.1.0
* Initial release
* Support for Lightbulb Service (Supported openHAB items: `Switch`, `Dimmer` and `Color`)
* Support for Switch Service (Supported openHAB item: `Switch`)