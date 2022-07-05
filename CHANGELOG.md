# Changelog of homebridge-openhab2-complete
## Changelog

### V1.3.5
* Removed `Faucet` and `Irrigation System` in favor of generic `Valve`
* Added configuration options for HTTP(S) basic authentication
  * Making basic auth optional (Thanks @Matsuo3rd)
* Swing item now read-write
* Fixed swing item usage in Binary.js (Thanks @Matsuo3rd)
* Complying with openHAB's correct event subscription filtering (see https://github.com/openhab/openhab-core/pull/2986, thanks @Matsuo3rd)

#### Issues
* Closes #105

### V1.3.4
* Added option to change light behaviour with `sendOnOnlyWhenOff` option
* Fixed documentation

#### Issues
* Closes #57
* Closes #102

### V1.3.3
* Fixed wrong variable name

#### Issues
* Closes #100

### V1.3.2
  * Missed one occurence of the `request` dependency

#### Issues
* Closes #99

### V1.3.0
#### Important Information
This is proabably the last release of this plugin. Since the native HomeKit integration of OpenHAB has significantly improved (still lacking some of the available Service of this plugin), I don't think there is much value in this plugin. As part of my OpenHAB 3 migration I  updated this code to support OH3, finally put some bug fixes that happened over the last year into a release and replaced the depricated `request` package. So I am certain this plugin will continue functioning, and I will continue merging PRs into upstream, but don't expect a new release, unless my test run of OH3's native HomeKit integration fails.

#### Breaking changes
I reworked the UUID generation, now using the included mechanism (Issue #88). This however will probably reset the items already added to Home.app (once!). Please be aware that there will probably be some work required to re-organize the Home.app!

* OpenHAB 3 Support (Thanks @D-J-See and @DanielKnoop)
* Fixed UUID generation issue by using supplied function
* Fixed `TypeError: service.on is not a function` error during item creation
* Honoring homebridge's item caching
* Exchanged depricated `request` for `needle`

#### Issues
* Closes #88

### V1.2.0
* Extended `NumericSensor` and `NumericSensorActor` capabilities to support `Rollershutter` and `Dimmer` types.
* Homebridge no longer crashes if openHAB's host is not available
* Support for scientifically notated numbers (e.g. `7E+1`)
* Fixed wrong heater/cooler state
* Enabling support for user-defined min/max values:
  * minTemp, maxTemp, minTempStep for Thermostat, HeaterCooler and Temperature Sensor
  * minFanSpeed, maxFanSpeed, minFanStep for HeaterCooler, AirPurifier and Humidifier/Dehumidifier
* Fixed documentation issue around `activeItem` and `activeItemInverted` for Air Purifier, Irrigation System, Humidifier/Dehumidifier.
* Fixed missing `LEVEL_CONFIG` for Filter Maintenance Sensor, CO Sensor and CO2 Sensor
* Reworked thermostat and added warning for Heater/Cooler, see README
* Added `durationItemMax` to the Valve Service

#### Issues:
* Closes #60
* Closes #70
* Closes #73
* Closes #74
* Closes #79
* Closes #80
* Closes #82
* Closes #83
* Closes #84

### V1.1.0
* Updated Readme to fix typo's
* Added possibility to arbitrary group items using the grouping feature of iOS 13
* Added slat type accessory
* Added audio type accessories: Microphone & Speaker

### V1.0.0
* Updated Readme to fix typo's
* Valve and Faucet should now be able to change state of openHAB item (changed configuration and requirements for Valve and Faucet items, see README)
* 'heatingItem' and 'coolingItem' of Thermostat now actually support 'Contact' type
* Reworked 'Thermostat' and 'Temperature Sensor' to support a wider range of numbers (now from -100 to +200) and also support exotic temperature units (Fahrenheit :P)
* Reworked light based on issues #13 and #43
* Added numeric battery state and battery warnings for _every_ accessory type
* Added vertical and horizontal tilt angle's for `Window Covering`'s slats
* Reworked `Security System` behaviour, using a single `String` item in comparision to a complex `Switch` construct

#### Issues:
* Closes #9
* (Hopefully finally) closes #13
* Closes #17
* Closes #43
* Closes #24
* Closes #33
* Closes #38
* Closes #32
* Closes #34
* Closes #35

**Breaking changes**:
* Changed `item` to `currentTempItem` within `temp` accessory
* `Valve` and `Faucet` configuration and requirements changed significantly, consult the relevant section in the `README.md`
* `Security System` moved to a single `String` item within OpenHAB

### V0.10.2
* Fixed minor issues from Github.

### V0.10.1
* Fixed a logic bug for inverted `Window Covering` Accessory using inverted `Rollershutter` items
* Fixed light off bug

#### Issues:
* Closes #11, #12, #13

### V0.10.0
* Allowing grouping of same type accessory inside configuration
* Added Air Quality Sensor
* Added Climate Control Accessories:
  * Humidifier/Dehumidifier
  * Heater/Cooler
  * Air Purifier
* Added Watering Accessories:
  * Faucet
  * Valve
  * Irrigation
* Added Garage Door Opener Accessory
* Support for `Number` types with Unit of Measurement
  
**Breaking changes**:
* Renamed light sensor's accessory type from `lightSensor` to `lux`

#### Issues:
* Closes #8

### V0.9.0
* Removed `clone` dependency, since it caused unexpected behaviour
* Improved fan in order to support non-binary items to control the fan speed
* Fixed an issue, where not supported characteristics were still being exposed to HomeKit
* Reworked thermostat to extend usage for AUTO mode and mode item

#### Issues:
* Closes #2, #4, #5, #7

### V0.8.2
* Created own caching mechanism, supporting this use case & improving UX performance & stress to openHAB.
* Improved startup performance due to bulk sync of item states

### V0.8.0
* Added optional `multiplier` and `stateMultiplier` to `WindowCovering`, `Door` and `Window`, in order to multiply openHAB's item state and show it differently in HomeKit
* Added optional `manuMode` to `WindowCovering`, `Door` and `Window`
* Bug fixing:
  * `Rollerhutter` items now receive an `UP` or `DOWN` command if target state is `100`/`0`
  * Fixed issue with lights, where there was a feedback loop based on subscriptions
* Performance improvements:
  * No more duplicate subscriptions on the same item
  * Caching of states improves updating speed when launching Home.app significantly
  * Caching of types improves startup speed of homebridge

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

**Breaking Changes:**
* Renamed `habBatteryItem` key in configurations with Battery Warning Characteristic to `batteryItem`
* Renamed `habBatteryItemStateWarning` key in configurations with Battery Warning Characteristics `batteryItemInverted: "false" | "true"`

### V0.3.0
* Support for Window Covering Service (Supported openHAB item: `Rollershutter`)

### V0.2.0
* Support for Humidity Sensor Service (Supported openHAB item: `Number`)
* Support for Temperature Sensor Service (Supported openHAB item: `Number`)
* Added Battery Warning Characteristic to Humidity & Temperature Sensor Services (Supported openHAB item: `Switch`)
* Support for Thermostat Service (Supported openHAB item: Compound service of `Number` and `Switch`)

**Breaking changes:**
* Renamed `habItem` key in configuration to `item`

### V0.1.0
* Initial release
* Support for Lightbulb Service (Supported openHAB items: `Switch`, `Dimmer` and `Color`)
* Support for Switch Service (Supported openHAB item: `Switch`)