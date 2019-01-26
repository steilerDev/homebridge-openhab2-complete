# Changelog of homebridge-openhab2-complete

## V0.5.0 (unreleased)
* Addition of CurrentPosition/TargetPosition Actors (Supported openHAB items: `Rollershutter`, `Number` and `Switch`) with optional item representing the service's state (Supported openHAB items: `Rollershutter`, `Number`, `Switch`, `Contact`)
    * Rework of Window Covering Service to use share functionalities
    * Door Service
    * Window Service

## V0.4.0
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

## V0.3.0
* Support for Window Covering Service (Supported openHAB item: `Rollershutter`)

## V0.2.0
* Support for Humidity Sensor Service (Supported openHAB item: `Number`)
* Support for Temperature Sensor Service (Supported openHAB item: `Number`)
* Added Battery Warning Characteristic to Humidity & Temperature Sensor Services (Supported openHAB item: `Switch`)
* Support for Thermostat Service (Supported openHAB item: Compound service of `Number` and `Switch`)

Breaking changes:

* Renamed `habItem` key in configuration to `item`


## V0.1.0
* Initial release
* Support for Lightbulb Service (Supported openHAB items: `Switch`, `Dimmer` and `Color`)
* Support for Switch Service (Supported openHAB item: `Switch`)