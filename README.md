# Homebridge Plugin for OpenHAB2 - Complete Edition
> Exceeding features of [homebridge-openhab2](https://www.npmjs.com/package/homebridge-openhab2) and [openHAB's Homekit Plugin](https://www.openhab.org/addons/integrations/homekit/) since `v.0.3.0`

[![NPM](https://nodei.co/npm/homebridge-openhab2-complete.png)](https://nodei.co/npm/homebridge-openhab2-complete/)

This [homebridge](https://github.com/nfarina/homebridge) plugin for [openHAB](https://www.openhab.org) fully supports all services offered by Apple's HomeKit Accessory Protocol (HAP), as far as it is feasible based on the item types offered by OpenHAB (see [below](#supported-hap-services) for the currently supported 32 accessories). In opposite to the existing [openHAB homebridge plugin](https://www.npmjs.com/package/homebridge-openhab2) or the native [openHAB Homekit Plugin](https://www.openhab.org/addons/integrations/homekit/), this plugin requires explicit declaration of accessories in the homebridge configuration and does not use openHAB's tagging system, which leads to a little more effort during configuration, but proves more reliable and functional in more complex installations. See [Comparisson](#comparison) below.

## Installation
*Note: Please install [homebridge](https://www.npmjs.com/package/homebridge) first.*

```
npm install -g homebridge-openhab2-complete
```

Some people are experiencing dependency issues between homebridge's node version and the required node version for this project. My local setup is based on [oznu's homebridge docker container](https://github.com/oznu/docker-homebridge), where I never ran into any problems. In order to install the plugin in the docker, just add `npm install homebridge-openhab2-complete` to the `startup.sh` script inside the mapped docker volume.

## Configuration
This is a platform plugin, that will register all accessories within the Bridge provided by homebridge. The following shows the general homebridge configuration (`config.json`), see the [Supported HAP Services below](#supported-hap-services), in order to get the detailed configuration for each service.

```
{
    "bridge": {
        ...
    },

    "accessories": [
        ...
    ],

    "platforms": [
        {
            "platform": "openHAB2-Complete",
            "host": "http://192.168.0.100",
            "port": "8080",
            "accessories": [
                {
                    "name": "An items name, as shown in Homekit later",
                    "type": "switch",
                    "item": "Itemname-within-OpenHAB"
                },
                ...
            ]
        },
        ...
    ]
}
```
* `platform` has to be `"openHAB2-Complete"`
* `host`: The IP or hostname of your openHAB instance. The Protocol specifier (`http://`) is optional, defaults to `http://` (independent of the specified port)
* `port`: *(optional)* If not specified the default port of the specified `host` protocol is used.
* `accessory`: An array of accessories exposed to HomeKit, see the next chapter for available services and their configurations.

Alternatively you can group accessories of the same `type` in a sub-array:
```
...
    "platforms": [
        {
            ...
            "accessories": [
                {
                    "type": "switch",
                    "items": [
                        {
                            "name": "An items name, as shown in Homekit later",
                            "item": "Itemname-within-OpenHAB"
                        },
                        {
                            "name": "An items name, as shown in Homekit later",
                            "item": "Itemname-within-OpenHAB"
                        },
                        ...
                    ]
                },
                ...
            ]
        },
...
```

## Supported HAP Services
The following is a list of all services that are currently supported and which values are required within the accessory configuration. Every accessory needs a `name` (as shown in HomeKit later) and a `type`. 

* Complex Accessories:
  * [Lightbulb](#lightbulb) 
    * Homebridge configuration type: `light`
  * [Fan](#fan)
    * Homebridge configuration type: `fan`
  * [Security System](#security-system)
    * Homebridge configuration type: `security`
* Climate Control Accessories:
  * [Thermostat](#thermostat)
    * Homebridge configuration type: `thermostat`
  * [Humidifier/Dehumidifier](#humidifierdehumidifier)
    * Homebridge configuration type: `humidifier`
  * [Heater/Cooler](#heatercooler)
    * Homebridge configuration type: `heatercooler`
  * [Air Purifier](#air-purifier)
    * Homebridge configuration type: `airpurifier`
* Audio Accessories:
  * [Speaker](#speaker)
    * Homebridge configuration type: `speaker`
  * [Microphone](#microphone)
    * Homebridge configuration type: `microphone`
* Watering Accessories:
  * [Faucet](#faucet)
    * Homebridge configuration type: `faucet`
  * [Valve](#valve)
    * Homebridge configuration type: `valve`
  * [Irrigation System](#irrigation-system)
    * Homebridge configuration type: `irrigation`
* Position Based Actors:
  * [Window Covering](#window-covering)
    * Homebridge configuration type: `windowcovering`
  * [Door](#door)
    * Homebridge configuration type: `door`
  * [Window](#window)
    * Homebridge configuration type: `window`
  * [Lock Mechanism](#lock-mechanism)
    * Homebridge configuration type: `lock`
  * [Garage Door Opener](#garage-door-opener)
    * Homebridge configuration type: `garage`
  * [Slat](#slat)
    * Homebridge configuration type: `slat`
* Numeric Sensors:
  * [Temperature Sensor](#temperature-sensor)
    * Homebridge configuration type: `temp`
  * [Humidity Sensor](#humidity-sensor)
    * Homebridge configuration type: `humidity`
  * [Light Sensor](#light-sensor)
    * Homebridge configuration type: `lux`
  * [Air Quality Sensor](#air-quality-sensor)
    * Homebridge configuration type: `air`
* Binary Actors:
  * [Switch](#switch)
    * Homebridge configuration type: `switch`
  * [Outlet](#outlet)
    * Homebridge configuration type: `outlet`
* Binary Sensors:
  * [Motion Sensor](#motion-sensor)
    * Homebridge configuration type: `motion`
  * [Occupancy Sensor](#occupancy-sensor)
    * Homebridge configuration type: `occupancy`
  * [Leak Sensor](#leak-sensor)
    * Homebridge configuration type: `leak`
  * [Carbon Monoxide Sensor](#carbon-monoxide-sensor)
    * Homebridge configuration type: `co`
  * [Carbon Dioxide Sensor](#carbon-dioxide-sensor)
    * Homebridge configuration type: `co2`
  * [Contact Sensor](#contact-sensor)
    * Homebridge configuration type: `contact`
  * [Smoke Sensor](#smoke-sensor)
    * Homebridge configuration type: `smoke`
  * [Filter Maintenance Sensor](#filter-maintenance-sensor)
    * Homebridge configuration type: `filter`
  
The following services are also defined by the HomeKit protocol, but since I don't know a good way to map them to openHAB items, I currently don't plan to implement them. Let me know if you have any ideas, by opening an issue!
* Camera RTP Stream Management
* Doorbell
* Stateless Programmable Switch

## Configuration for every accessory
### Grouping
Since iOS 13 multiple accessories can be grouped within a single accessory. This can be -as far as I have tested- done in an arbitrary way. The syntax to define a grouped item is as follows:
```
{
    {
        "type": "group",
        "name": "Group Name",
        "model": "Group Type Model",
        "batteryItem": "Itemname-within-OpenHAB",
        "batteryItemThreshold": "20",
        "items": [
            {
                "type": "homebridge-openhab2-complete item type",
                "name": "An items name, as shown in Homekit later",
                "item": "Itemname-within-OpenHAB"
            }, {
                "type": "homebridge-openhab2-complete item type",
                "items": [
                    {
                        "name": "An items name, as shown in Homekit later",
                        "item": "Itemname-within-OpenHAB",
                    }, {
                        ...
                    }
                ]
            }
        ]
    }
```
* `type`: Needs to be `"group"`
* `name`: The name as shown in HomeKit later (in some instances I have experienced that this name is dropped in favor of the first item's name)
* `model` *(optional)*: A model description, defining the grouping. This is only shown in the expanded settings of the group.
* `batteryItem`, `batteryItemThreshold`, ... *(optional)*: A battery service can only be defined on the most upper level for the whole group. See [Battery Levels and Warnings](#battery-levels-and-warnings) for more information on the syntax. All `BatteryServices` defined in the `items` array will be ignored!
* `items`: An array of item definitions. As shown in the example, the different items will be defined here, as if they were outside of the group, either through single item definition or multiple definitions of the same type in a sub-array. Those configuration styles can be combined!

### Battery Levels and Warnings
Every accessory can be configured to show battery warnings and battery levels. The following configuration can be optionally added to every item:
```
{
    "batteryItem": "Itemname-within-OpenHAB",
    "batteryItemThreshold": "10",
    "batteryItemInverted": "false",
    "batteryItemChargingState": "Itemname-within-OpenHAB",
    "batteryItemChargingStateInverted": "false"
}
```

* `batteryItem` *(optional)*: The openHAB item representing the battery level for this accessory.
  * Needs to be of type `Switch`, `Contact` or `Number` within openHAB
  * **Note**: If the type is `Number`, then the battery warning will be based on `batteryItemThreshold` and the battery level will be the value of the item
  * **Note**: If the type is `Switch` or `Contact` the `BatteryLevel` will always show 0% and for states `ON` or `OPEN` a battery warning will be triggered
* `batteryItemInverted` *(optional)*: If `batteryItem`'s state needs to be interpreted inverted, set this value to `"true"` (Only for types `Switch` and `Contact`)
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*
* `batteryItemThreshold` *(optional)*: The threshold of `batteryItem`'s numeric value, below a warning will be triggered
  * Default: `"20"`
  * Allowed values: All integers
* `batteryItemChargingState`: The openHAB item representing if the device is currently charging
  * Needs to be of type `Switch` or `Contact` within openHAB
  * Default: Item will be reported as 'Not chargeable' to HomeKit if this item is not available
* `batteryItemChargingStateInverted` *(optional)*: If `batteryItemChargingState`'s state needs to be interpreted inverted, set this value to `"true"`
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*
  
## Available accessory types
### Lightbulb
This service describes a lightbulb.

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "light",
    "item": "Itemname-within-OpenHAB"
}
```
* `item`: The openHAB item controlled by this accessory
  * Needs to be of type `Switch`, `Dimmer` or `Color` within openHAB (HomeKit will correctly display brightness *-in case of `Dimmer` or `Color`-* and color settings *-in case of `Color`-*)
  
### Fan
This service describes a fan.

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "fan",
    "item": "Itemname-within-OpenHAB"
}
```
* `item`: The openHAB item controlled by this accessory
  * Needs to be of type `Switch`, `Number` or `Dimmer` within openHAB (HomeKit will correctly display fan speed control *-in case of `Number` or `Dimmer`-*)

### Security System
This service describes a security system.

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "security",
    "item": "Itemname-within-OpenHAB"
}
```
* `item`: The openHAB item representing the state of the security system
  * Needs to be of type `String` within openHAB
  * Allowed values (Every other value will be ignored and shown as an error)
    * `StayArm`: The home is occupied and the residents are active, shown as `Home` in the Home.app
    * `AwayArm`: The home is unoccupied, shown as `Away` in the Home.app
    * `NightArm`: The home is occupied and the residents are sleeping, shown as `Night` in the Home.app
    * `Disarmed`: The security system is disabled, shown as `Off` in the Home.app
    * `AlarmTriggered`: The security alarm is triggered

### Thermostat
This service describes a thermostat.

*Important notes on Thermostat Capabilities*
* A thermostat can have the capability to cool, heat or do both
* The `modeItem` will precede `heatingItem` or `coolingItem` (when `modeItem` is defined, `heatingItem` and `coolingItem` will be ignored)
  * If `modeItem` is present while `modeItemCharacteristic` is present the allowed values for `modeItem` will be restricted based on `modeItemCharacteristic` (see below)
* If `modeItem` is not present, one of the following is required: `heatingItem` or `coolingItem`
  * Based on those, the capability to heat or cool will be derived
  * If both are present, `coolingItem` will be ignored, therefore the item will only be able to either cool or heat

*Important notes on Thermostat Capabilities*

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "thermostat",
    "currentTempItem": "Itemname-within-OpenHAB",
    "targetTempItem": "Itemname-within-OpenHAB",
    "currentHumidityItem": "Itemname-within-OpenHAB",
    "targetHumidityItem": "Itemname-within-OpenHAB",
    "heatingItem": "Itemname-within-OpenHAB",
    "coolingItem": "Itemname-within-OpenHAB",
    "tempUnit": "Celsius",
    "heatingThresholdTempItem": "Itemname-within-OpenHAB",
    "coolingThresholdTempItem": "Itemname-within-OpenHAB",
    "modeItem": "Itemname-within-OpenHAB",
    "modeItemCharacteristic": "HeatingCooling",
    "minTemp": "-100",
    "maxTemp": "200",
    "minTempStep": "0.1"
}
```


* `currentTempItem`: The openHAB item representing the current temperature as measured by the thermostat
  * Needs to be of type `Number`, `Rollershutter`, or `Dimmer` within openHAB 
  
    *(Note: When using `Dimmer` or `Rollershutter` type and OpenHAB receives a non numeric command like `ON`, `OFF`, `INCREASE`, `DECREASE`, `UP` or `DOWN` this might lead to unexpected behaviour and/or non-responsive HomeKit items. This exception is not covered by this plugin and the user needs to ensure a consistent state)*
* `targetTempItem`: The openHAB item representing the target temperature inside the room
  * Needs to be of type `Number`, `Rollershutter`, or `Dimmer` within openHAB 
  
    *(Note: When using `Dimmer` or `Rollershutter` type and OpenHAB receives a non numeric command like `ON`, `OFF`, `INCREASE`, `DECREASE`, `UP` or `DOWN` this might lead to unexpected behaviour and/or non-responsive HomeKit items. This exception is not covered by this plugin and the user needs to ensure a consistent state)*
* `currentHumidityItem` *(optional)*: The openHAB item representing the current humidity as measured by the thermostat
  * Needs to be of type `Number`, `Rollershutter`, or `Dimmer` within openHAB 
  
    *(Note: When using `Dimmer` or `Rollershutter` type and OpenHAB receives a non numeric command like `ON`, `OFF`, `INCREASE`, `DECREASE`, `UP` or `DOWN` this might lead to unexpected behaviour and/or non-responsive HomeKit items. This exception is not covered by this plugin and the user needs to ensure a consistent state)*
* `targetHumidityItem` *(optional)*: The openHAB item representing the target humidity inside the room
  * Needs to be of type `Number`, `Rollershutter`, or `Dimmer` within openHAB 
  
    *(Note: When using `Dimmer` or `Rollershutter` type and OpenHAB receives a non numeric command like `ON`, `OFF`, `INCREASE`, `DECREASE`, `UP` or `DOWN` this might lead to unexpected behaviour and/or non-responsive HomeKit items. This exception is not covered by this plugin and the user needs to ensure a consistent state)*

* `heatingItem` *(optional, see Important Notes above)*: The openHAB item showing, if the room is currently being heated
  * Needs to be of type `Switch` within openHAB
* `coolingItem` *(optional, see Important Notes above)*: The openHAB item showing, if the room is currently being cooled
  * Needs to be of type `Switch` within openHAB
* `tempUnit` *(optional)*: Gives the measurement unit of the thermostat. HomeKit always expects the input to be in degrees celsius, therefore specifying Fahrenheit as a unit, the plugin will convert the values to be shown correctly on the fly.
  * Default: `Celsius`
  * Allowed values: `Celsius` & `Fahrenheit`
* `heatingThresholdTempItem` *(optional)*: The openHAB item describing the heating threshold in Celsius for devices that support simultaneous heating and cooling. The value of this characteristic represents the 'minimum temperature' that mus be reached before heating is turned on.
  * Needs to be of type `Number`, `Rollershutter`, or `Dimmer` within openHAB 
  
    *(Note: When using `Dimmer` or `Rollershutter` type and OpenHAB receives a non numeric command like `ON`, `OFF`, `INCREASE`, `DECREASE`, `UP` or `DOWN` this might lead to unexpected behaviour and/or non-responsive HomeKit items. This exception is not covered by this plugin and the user needs to ensure a consistent state)*
* `coolingThresholdTempItem` *(optional)*: The openHAB item describing the cooling threshold in Celsius for devices that support simultaneous heating and cooling. The value of this characteristic represents the 'maximum temperature' that mus be reached before cooling is turned on.
  * Needs to be of type `Number`, `Rollershutter`, or `Dimmer` within openHAB 
  
    *(Note: When using `Dimmer` or `Rollershutter` type and OpenHAB receives a non numeric command like `ON`, `OFF`, `INCREASE`, `DECREASE`, `UP` or `DOWN` this might lead to unexpected behaviour and/or non-responsive HomeKit items. This exception is not covered by this plugin and the user needs to ensure a consistent state)*
* `modeItem` *(optional)*: If your thermostat can be set to heating, cooling or auto mode through an item, and/or reports back its current configuration use this item, otherwise the heating/cooling capabilities are deferred from `heatingItem` and `coolingItem`.
  * Needs to be of type `Number` within openHAB
  * Only discrete values are recognized:
    * 0 ≙ `Off`
    * 1 ≙ `Heating`
    * 2 ≙ `Cooling`
    * 3 ≙ `Auto`
* `modeItemCharacteristic` *(optional)*: If you are using `modeItem` the discrete values accepted and shown in the app can be restricted:
  * Allowed values: `Heating` (will restrict `modeItem` to `0`, `1`, `3`), `Cooling` (will restrict `modeItem` to `0`, `2`, `3`) or `HeatingCooling` (will not restrict `modeItem`)
  * Default `HeatingCooling`
* `minTemp` *(optional)*: If you need to change the minimum allowed temperature, the `currentTempItem` is reading
  * Needs to be an float
  * Default: `-100`
* `maxTemp` *(optional)*: If you need to change the maximum allowed temperature, the `currentTempItem` is reading
  * Needs to be a float
  * Default: `200`
* `minTempStep` *(optional)*: If you need to change the granularity of the `currentTempItem` reading/writing (Note: Home.app seem to not allow a greater granularity than 0.5 in the UI, however the reported values might be more granular)
  * Needs to be a float
  * Default: `0.1`

### Humidifier/Dehumidifier
This service describes a humidifier and/or dehumidifier accessory.

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "humidifier",
    "currentHumidityItem": "Itemname-within-OpenHAB",
    "item": "Itemname-within-OpenHAB",
    "inverted": "false",
    "humidifierItem": "Itemname-within-OpenHAB",
    "dehumidifierItem": "Itemname-within-OpenHAB",
    "modeItem": "Itemname-within-OpenHAB",
    "humidifierThresholdItem": "Itemname-within-OpenHAB",
    "dehumidifierThresholdItem": "Itemname-within-OpenHAB",
    "waterLevelItem": "Itemname-within-OpenHAB",
    "swingItem": "Itemname-within-OpenHAB",
    "swingItemInverted": "false",
    "rotationSpeedItem": "Itemname-within-OpenHAB",
    "minFanSpeed": "0",
    "maxFanSpeed": "100",
    "minFanStep": "1"
}
```

* `currentHumidityItem`: The openHAB item representing the current humidity
  * Needs to be of type `Number`, `Rollershutter`, or `Dimmer` within openHAB 
  
    *(Note: When using `Dimmer` or `Rollershutter` type and OpenHAB receives a non numeric command like `ON`, `OFF`, `INCREASE`, `DECREASE`, `UP` or `DOWN` this might lead to unexpected behaviour and/or non-responsive HomeKit items. This exception is not covered by this plugin and the user needs to ensure a consistent state)*
* `item`: The openHAB item showing, if the (de-)humidfier is currently active
  * Needs to be of type `Switch` or `Contact` within openHAB
* `inverted` *(optional)*: If `activeItem`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*
* `humidifierItem` *(optional, if `dehumidifierItem` is present, otherwise required)*: The openHAB item showing, if the room is currently humidified
  * Needs to be of type `Switch` or `Contact` within openHAB
* `dehumidifierItem` *(optional, if `humidifierItem` is present, otherwise required)*: The openHAB item showing, if the room is currently dehumidified
  * Needs to be of type `Switch` or `Contact` within openHAB
* `modeItem`: *(optional)* If your (de-)humidifier can be set to humidifying, dehumidifying or auto mode through an item, and/or reports back its current configuration use this item, otherwise the humidifying/dehumidifying capabilities are deferred from `humidifierItem` and `dehumidifierItem` and will not be changeable.
  * Needs to be of type `Number` within openHAB
  * Only discrete values are recognized:
    * 0 ≙ `Humidifier or Dehumidifier`
    * 1 ≙ `Humidifier`
    * 2 ≙ `Dehumidifier`
* `humidifierThresholdItem`: *(optional)* The openHAB item describing the humidifying threshold. The value of this characteristic represents the 'minimum relative humidity' that mus be reached before humidifying is turned on.
  * Needs to be of type `Number`, `Rollershutter`, or `Dimmer` within openHAB 
  
    *(Note: When using `Dimmer` or `Rollershutter` type and OpenHAB receives a non numeric command like `ON`, `OFF`, `INCREASE`, `DECREASE`, `UP` or `DOWN` this might lead to unexpected behaviour and/or non-responsive HomeKit items. This exception is not covered by this plugin and the user needs to ensure a consistent state)*
* `dehumidifierThresholdItem`: *(optional)* The openHAB item describing the dehumidifying threshold. The value of this characteristic represents the 'maximum relative humidity' that mus be reached before dehumidifying is turned on.
  * Needs to be of type `Number`, `Rollershutter`, or `Dimmer` within openHAB 
  
    *(Note: When using `Dimmer` or `Rollershutter` type and OpenHAB receives a non numeric command like `ON`, `OFF`, `INCREASE`, `DECREASE`, `UP` or `DOWN` this might lead to unexpected behaviour and/or non-responsive HomeKit items. This exception is not covered by this plugin and the user needs to ensure a consistent state)*
* `waterLevelItem`: *(optional)* The openHAB item representing the current water level 
  * Needs to be of type `Number`, `Rollershutter`, or `Dimmer` within openHAB 
  
    *(Note: When using `Dimmer` or `Rollershutter` type and OpenHAB receives a non numeric command like `ON`, `OFF`, `INCREASE`, `DECREASE`, `UP` or `DOWN` this might lead to unexpected behaviour and/or non-responsive HomeKit items. This exception is not covered by this plugin and the user needs to ensure a consistent state)*
* `swingItem`: *(optional)* The openHAB item showing, if swing is active
  * Needs to be of type `Switch` or `Contact` within openHAB
* `swingItemInverted` *(optional)*: If `swingItem`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*
* `rotationSpeedItem`: *(optional)* The openHAB item representing the rotation speed
  * Needs to be of type `Number`, `Rollershutter`, or `Dimmer` within openHAB 
  
    *(Note: When using `Dimmer` or `Rollershutter` type and OpenHAB receives a non numeric command like `ON`, `OFF`, `INCREASE`, `DECREASE`, `UP` or `DOWN` this might lead to unexpected behaviour and/or non-responsive HomeKit items. This exception is not covered by this plugin and the user needs to ensure a consistent state)*
* `minFanSpeed` *(optional)*: If you need to change the minimum allowed fan speed, the `rotationSpeedItem` is reading in percent
  * Needs to be an float
  * Default: `0`
* `maxFanSpeed` *(optional)*: If you need to change the maximum allowed fan speed, the `rotationSpeedItem` is reading in percent
  * Needs to be a float
  * Default: `100`
* `minTempStep` *(optional)*: If you need to change the granularity of the `rotationSpeedItem` reading/writing (Note: Home.app seem to not allow a greater granularity than 0.5 in the UI, however the reported values might be more granular)
  * Needs to be a float
  * Default: `1`

### Heater/Cooler 
This service describes a heater and/or cooler accessory.

*Important notes on Heater/Cooler*

The Heater/Cooler implementation within HomeKit clashes with OpenHAB. The Heater/Cooler is usable but there might be bugs around the mode. If the swing item and rotation speed item are not required, it is recommended to use the Thermostat Service!

*Important notes on Heater/Cooler*


```
{
    "name": "An items name, as shown in Homekit later",
    "type": "heatercooler",
    "currentTempItem": "Itemname-within-OpenHAB",
    "item": "Itemname-within-OpenHAB",
    "inverted": "false",
    "heatingItem": "Itemname-within-OpenHAB",
    "coolingItem": "Itemname-within-OpenHAB",
    "modeItem": "Itemname-within-OpenHAB",
    "heatingThresholdTempItem": "Itemname-within-OpenHAB",
    "coolingThresholdTempItem": "Itemname-within-OpenHAB",
    "swingItem": "Itemname-within-OpenHAB",
    "swingItemInverted": "false",
    "rotationSpeedItem": "Itemname-within-OpenHAB",
    "tempUnit": "Celsius",
    "minTemp": "-100",
    "maxTemp": "200",
    "minTempStep": "0.1"
    "minFanSpeed": "0",
    "maxFanSpeed": "100",
    "minFanStep": "1"
}
```

* `currentTempItem`: The openHAB item representing the current temperature
  * Needs to be of type `Number`, `Rollershutter`, or `Dimmer` within openHAB 
  
    *(Note: When using `Dimmer` or `Rollershutter` type and OpenHAB receives a non numeric command like `ON`, `OFF`, `INCREASE`, `DECREASE`, `UP` or `DOWN` this might lead to unexpected behaviour and/or non-responsive HomeKit items. This exception is not covered by this plugin and the user needs to ensure a consistent state)*
* `item`: The openHAB item showing, if the heater/cooler is currently active
  * Needs to be of type `Switch` or `Contact` within openHAB
* `inverted` *(optional)*: If `activeItem`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*
* `heatingItem` *(optional, if `coolingItem` is present, otherwise required)*: The openHAB item showing, if the room is currently being heated
  * Needs to be of type `Switch` or `Contact` within openHAB
* `coolingItem` *(optional, if `heatingItem` is present, otherwise required)*: The openHAB item showing, if the room is currently being cooled
  * Needs to be of type `Switch` or `Contact` within openHAB
* `modeItem`: *(optional)* If your heater/cooler can be set to heating, cooling or auto mode through an item, and/or reports back its current configuration use this item, otherwise the heating/cooling capabilities are deferred from `heatingItem` and `coolingItem` and will not be changeable.
  * Needs to be of type `Number` within openHAB
  * Only discrete values are recognized:
    * 0 ≙ `Auto`
    * 1 ≙ `Heat`
    * 2 ≙ `Cool`
* `heatingThresholdTempItem`: *(optional)* The openHAB item describing the heating threshold in Celsius for devices that support simultaneous heating and cooling. The value of this characteristic represents the 'minimum temperature' that mus be reached before heating is turned on.
  * Needs to be of type `Number`, `Rollershutter`, or `Dimmer` within openHAB 
  
    *(Note: When using `Dimmer` or `Rollershutter` type and OpenHAB receives a non numeric command like `ON`, `OFF`, `INCREASE`, `DECREASE`, `UP` or `DOWN` this might lead to unexpected behaviour and/or non-responsive HomeKit items. This exception is not covered by this plugin and the user needs to ensure a consistent state)*
* `coolingThresholdTempItem`: *(optional)* The openHAB item describing the cooling threshold in Celsius for devices that support simultaneous heating and cooling. The value of this characteristic represents the 'maximum temperature' that mus be reached before cooling is turned on.
  * Needs to be of type `Number`, `Rollershutter`, or `Dimmer` within openHAB 
  
    *(Note: When using `Dimmer` or `Rollershutter` type and OpenHAB receives a non numeric command like `ON`, `OFF`, `INCREASE`, `DECREASE`, `UP` or `DOWN` this might lead to unexpected behaviour and/or non-responsive HomeKit items. This exception is not covered by this plugin and the user needs to ensure a consistent state)*
* `swingItem`: *(optional)* The openHAB item showing, if swing is active
  * Needs to be of type `Switch` or `Contact` within openHAB
* `swingItemInverted` *(optional)*: If `swingItem`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*
* `rotationSpeedItem`: *(optional)* The openHAB item representing the rotation speed
  * Needs to be of type `Number`, `Rollershutter`, or `Dimmer` within openHAB 
  
    *(Note: When using `Dimmer` or `Rollershutter` type and OpenHAB receives a non numeric command like `ON`, `OFF`, `INCREASE`, `DECREASE`, `UP` or `DOWN` this might lead to unexpected behaviour and/or non-responsive HomeKit items. This exception is not covered by this plugin and the user needs to ensure a consistent state)*
* `tempUnit` *(optional)*: Gives the measurement unit of the thermostat, currently does not change anything inside HomeKit
  * Default: `Celsius`
  * Allowed values: `Celsius` & `Fahrenheit`
* `minTemp` *(optional)*: If you need to change the minimum allowed temperature, the `currentTempItem` is reading
  * Needs to be an float
  * Default: `-100`
* `maxTemp` *(optional)*: If you need to change the maximum allowed temperature, the `currentTempItem` is reading
  * Needs to be a float
  * Default: `200`
* `minTempStep` *(optional)*: If you need to change the granularity of the `currentTempItem` reading/writing (Note: Home.app seem to not allow a greater granularity than 0.5 in the UI, however the reported values might be more granular)
  * Needs to be a float
  * Default: `0.1`
* `minFanSpeed` *(optional)*: If you need to change the minimum allowed fan speed, the `rotationSpeedItem` is reading in percent
  * Needs to be an float
  * Default: `0`
* `maxFanSpeed` *(optional)*: If you need to change the maximum allowed fan speed, the `rotationSpeedItem` is reading in percent
  * Needs to be a float
  * Default: `100`
* `minTempStep` *(optional)*: If you need to change the granularity of the `rotationSpeedItem` reading/writing (Note: Home.app seem to not allow a greater granularity than 0.5 in the UI, however the reported values might be more granular)
  * Needs to be a float
  * Default: `1`

### Air Purifier
This service describes an air purifier accessory.

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "airpurifier",
    "purifyingItem": "Itemname-within-OpenHAB",
    "modeItem": "Itemname-within-OpenHAB",
    "item": "Itemname-within-OpenHAB",
    "inverted": "false",
    "swingItem": "Itemname-within-OpenHAB",
    "swingItemInverted": "false",
    "rotationSpeedItem": "Itemname-within-OpenHAB",
    "minFanSpeed": "0",
    "maxFanSpeed": "100",
    "minFanStep": "1"
}
```
* `purifyingItem`: The openHAB item showing, if the air purifier is currently purifying the air
  * Needs to be of type `Switch` or `Contact` within openHAB
* `modeItem`: The openHAB item showing, if the air purifier is currently in Manual (`OFF` or `CLOSED`) or Automatic Mode (`ON` or `OPEN`)
  * Needs to be of type `Switch` or `Contact` within openHAB
* `item`: The openHAB item showing, if the air purifier is currently active
  * Needs to be of type `Switch` or `Contact` within openHAB
* `inverted` *(optional)*: If `activeItem`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*
* `swingItem`: *(optional)* The openHAB item showing, if swing is active
  * Needs to be of type `Switch` or `Contact` within openHAB
* `swingItemInverted` *(optional)*: If `swingItem`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*
* `rotationSpeedItem`: *(optional)* The openHAB item representing the rotation speed
  * Needs to be of type `Number`, `Rollershutter`, or `Dimmer` within openHAB 
  
    *(Note: When using `Dimmer` or `Rollershutter` type and OpenHAB receives a non numeric command like `ON`, `OFF`, `INCREASE`, `DECREASE`, `UP` or `DOWN` this might lead to unexpected behaviour and/or non-responsive HomeKit items. This exception is not covered by this plugin and the user needs to ensure a consistent state)*
* `minFanSpeed` *(optional)*: If you need to change the minimum allowed fan speed, the `rotationSpeedItem` is reading in percent
  * Needs to be an float
  * Default: `0`
* `maxFanSpeed` *(optional)*: If you need to change the maximum allowed fan speed, the `rotationSpeedItem` is reading in percent
  * Needs to be a float
  * Default: `100`
* `minFanStep` *(optional)*: If you need to change the granularity of the `rotationSpeedItem` reading/writing (Note: Home.app seem to not allow a greater granularity than 0.5 in the UI, however the reported values might be more granular)
  * Needs to be a float
  * Default: `1`

### Speaker
This service is used to control the audio output settings on a speaker device.

**Note:** Even though `Speaker` is part of Apple's HAP specification, this accessory is shown as "not supported" in the Home.app.

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "speaker",
    "muteItem": "Itemname-within-OpenHAB",
    "muteItemInverted": "true",
    "volumeItem": "Itemname-within-OpenHAB"
    
}
```
* `muteItem`: The openHAB item showing, if the speaker is muted
  * Needs to be of type `Switch` within openHAB
* `muteItemInverted` *(optional)*: If `muteItem`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*
* `volumeItem` *(optional)*: The openHAB item controlling the speaker's volume
  * Needs to be of type `Number`, `Rollershutter`, or `Dimmer` within openHAB 
  
    *(Note: When using `Dimmer` or `Rollershutter` type and OpenHAB receives a non numeric command like `ON`, `OFF`, `INCREASE`, `DECREASE`, `UP` or `DOWN` this might lead to unexpected behaviour and/or non-responsive HomeKit items. This exception is not covered by this plugin and the user needs to ensure a consistent state)*
  
### Microphone
This service is used to control the audio input settings on an audio device (primarily used for microphones).

**Note:** Even though `Microphone` is part of Apple's HAP specification, this accessory is shown as "not supported" in the Home.app.
```
{
    "name": "An items name, as shown in Homekit later",
    "type": "microphone",
    "muteItem": "Itemname-within-OpenHAB",
    "muteItemInverted": "true",
    "volumeItem": "Itemname-within-OpenHAB"
    
}
```
* `muteItem`: The openHAB item showing, if the microphone is muted
  * Needs to be of type `Switch` within openHAB
* `muteItemInverted` *(optional)*: If `muteItem`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*
* `volumeItem` *(optional)*: The openHAB item controlling the microphone's volume
  * Needs to be of type `Number`, `Rollershutter`, or `Dimmer` within openHAB 
  
    *(Note: When using `Dimmer` or `Rollershutter` type and OpenHAB receives a non numeric command like `ON`, `OFF`, `INCREASE`, `DECREASE`, `UP` or `DOWN` this might lead to unexpected behaviour and/or non-responsive HomeKit items. This exception is not covered by this plugin and the user needs to ensure a consistent state)*

### Faucet
This service describes a faucet.

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "faucet",
    "item": "Itemname-within-OpenHAB",
    "inverted": "true"
}
```
* `item`: The openHAB item showing, if the faucet is currently active 
  * Needs to be of type `Switch` within openHAB
* `inverted` *(optional)*: If `item`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*
 
### Valve
This service describes a valve.

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "valve",
    "item": "Itemname-within-OpenHAB",
    "inverted": "true",
    "inUseItem": "Itemname-within-OpenHAB",
    "inUseItemInverted": "true",
    "durationItem": "Itemname-within-OpenHAB",
    "valveType": "generic"
}
```
* `item`: The openHAB item showing, if the valve is currently active
  * Needs to be of type `Switch` within openHAB
* `inverted` *(optional)*: If `item`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*
* `inUseItem` Representing, if the valve is currently in use (if `Switch` is `ON`, `Contact` is `OPEN` or `Number` is greater than 0)
  * Needs to be of type `Switch`, `Contact` or `Number` within openHAB
* `inUseItemInverted` *(optional)*: If `inUseItem`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*
* `durationItem` *(optional)*: This item will be set by HomeKit to show the duration for the watering. This item should also be decreased, to show the remaining watering time
  * Needs to be of type `Number` within openHAB
* `valveType` *(optional)*: The type of valve described by this service.
  * Default: `generic`
  * Allowed values: `generic`, `irrigation`, `showerhead`, `faucet`
 
### Irrigation System
This service describes an irrigation system.

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "irrigation",
    "item": "Itemname-within-OpenHAB",
    "inverted": "true",
    "inUseItem": "Itemname-within-OpenHAB",
    "inUseItemInverted": "true",
    "durationItem": "Itemname-within-OpenHAB",
    "durationItemMax": "3600",
    "programMode": "manual",
    "programModeItem": "Itemname-within-OpenHAB"
}
```
* `item`: The openHAB item showing, if the valve is currently active
  * Needs to be of type `Switch` or `Contact` within openHAB
* `inverted` *(optional)*: If `activeItem`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*
* `inUseItem` Representing, if the valve is currently in use (if `Switch` is `ON`, `Contact` is `OPEN` or `Number` is greater than 0)
  * Needs to be of type `Switch`, `Contact` or `Number` within openHAB
* `inUseItemInverted` *(optional)*: If `inUseItem`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*
* `durationItem` *(optional)*: This item will be set by HomeKit to show the duration for the watering. This item should also be decreased, to show the remaining watering time
  * Needs to be of type `Number` within openHAB
* `durationItemMax` *(optional)*: The maximum amount of seconds, the `durationItem` can be set to.
  * Needs to be a float
  * Default: `"3600"`
* `programMode` *(optional)*: The current program mode of this accessory.
  * Default: `noprogram`
  * Allowed values: `noprogram`, `scheduled`, `manual`
* `programModeItem` *(optional)*: If your accessory can dynamically report its program mode, use this item as an alternative to `programMode`.
  * Needs to be of type `Number` within openHAB
  * Only discrete values are recognized:
    * 0 ≙ `No Program scheduled`
    * 1 ≙ `Program scheduled`
    * 2 ≙ `Manual Mode`
 
### Window Covering
This service describes motorized window coverings or shades - examples include shutters, blinds, awnings etc.

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "windowcovering", 
    "item": "Itemname-within-OpenHAB",
    "inverted": "false",
    "multiplier": "1",
    "stateItem": "Itemname-within-OpenHAB",
    "stateItemInverted": "false",
    "stateItemMultiplier": "1",
    "manuMode": "false",
    "horizontalTiltItem": "Itemname-within-OpenHAB",
    "horizontalTiltItemRangeStart": "-90",
    "horizontalTiltItemRangeEnd": "90",
    "verticalTiltItem": "Itemname-within-openHAB",
    "verticalTiltItemRangeStart": "-90",
    "verticalTiltItemRangeEnd": "90"
}
```
* `item`: The openHAB item representing the window covering, receiving commands about the target position and determining the current position (if `stateItem` is not set)
  * Needs to be of type `Rollershutter`, `Number` or `Switch` within openHAB
* `inverted` *(optional)*: If `item`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*
* `multiplier` *(optional)*: If `item`'s state need to be multiplied by a fixed amount to make sense to HomeKit, set this to a number (e.g. if your device stores its state in a float range from 0 to 1, where HomeKit expects integer numbers from 0 to 100 use a multiplier of 100)
  * Default: `"1"`
  * Needs to be a number *don't forget the quotes*
* `stateItem` *(optional)*: The openHAB item, used to determine the state of the window covering instead of `item`'s state
  * Needs to be of type `Rollershutter`, `Number`, `Switch` or `Contact` within openHAB
* `stateItemInverted` *(optional)*: If `stateItem`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*
* `stateItemMultiplier` *(optional)*: If `stateItem`'s state need to be multiplied by a fixed amount to make sense to HomeKit, set this to a number (e.g. if your device stores its state in a float range from 0 to 1, where HomeKit expects integer numbers from 0 to 100 use a multiplier of 100)
  * Default: `"1"`
  * Needs to be a number *don't forget the quotes*
* `manuMode` *(optional)*: If your item can be operated manually, you should enable this mode to not see `Opening...` or `Closing...` on the item when manipulating the state manually (This is due to the fact that HomeKit stores a `TargetState` value and compares it to the `ActualState` to show this metadata. The `manuMode` automatically changes the `TargetState` of the item, when the `ActualState` is changed)
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*
* `horizontalTiltItem` *(optional)*: An item representing the angle of horizontal slats. 
  * Needs to be of type `Number`, `Rollershutter`, or `Dimmer` within openHAB 
  
    *(Note: When using `Dimmer` or `Rollershutter` type and OpenHAB receives a non numeric command like `ON`, `OFF`, `INCREASE`, `DECREASE`, `UP` or `DOWN` this might lead to unexpected behaviour and/or non-responsive HomeKit items. This exception is not covered by this plugin and the user needs to ensure a consistent state)*
  * Allowed value range: `-90` to `90` (for different ranges, see `horizontalTiltItemRangeStart` and `horizontalTiltItemRangeEnd`):
    * A value of 0 indicates that the slats are rotated to a fully open position
    * A value of -90 indicates that the slats are rotated all the way in a direction where the user-facing edge is higher than the window-facing edge
    * A value of 90 indicates that the slats are rotated all the way in a direction where the window-facing edge is higher than the user-facing edge
* `horizontalTiltItemRangeStart` *(optional)*: If the range of the openHAB item does not start at `-90` (e.g. if the angle is represented in percent from 0 to 100) set this value. The range will be mapped linearly.
  * Default: `"-90"`
  * Allowed values: All integers
* `horizontalTiltItemRangeEnd` *(optional)*: If the range of the openHAB item does not end at `90` (e.g. if the angle is represented in percent from 0 to 100) set this value. The range will be mapped linearly.
  * Default: `"90"`
  * Allowed values: All integers
* `verticalTiltItem` *(optional)*: An item representing the angle of vertical slats. 
  * Needs to be of type `Number`, `Rollershutter`, or `Dimmer` within openHAB 
  
    *(Note: When using `Dimmer` or `Rollershutter` type and OpenHAB receives a non numeric command like `ON`, `OFF`, `INCREASE`, `DECREASE`, `UP` or `DOWN` this might lead to unexpected behaviour and/or non-responsive HomeKit items. This exception is not covered by this plugin and the user needs to ensure a consistent state)*
  * Allowed value range: `-90` to `90` (for different ranges, see `verticalTiltItemRangeStart` and `verticalTiltItemRangeEnd`):
    * A value of 0 indicates that the slats are rotated to a fully open position
    * A value of -90 indicates that the slats are rotated all the way in a direction where the user-facing edge is to the left of the window-facing edge
    * A value of 90 indicates that the slats are rotated all the way in a direction where the user-facing edge is to the right of the window-facing edge
* `verticalTiltItemRangeStart` *(optional)*: If the range of the openHAB item does not start at `-90` (e.g. if the angle is represented in percent from 0 to 100) set this value. The range will be mapped linearly.
  * Default: `"-90"`
  * Allowed values: All integers
* `verticalTiltItemRangeEnd` *(optional)*: If the range of the openHAB item does not end at `90` (e.g. if the angle is represented in percent from 0 to 100) set this value. The range will be mapped linearly.
  * Default: `"90"`
  * Allowed values: All integers
  

### Door 
This service describes a motorized door

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "door", 
    "item": "Itemname-within-OpenHAB",
    "inverted": "false",
    "multiplier": "1",
    "stateItem": "Itemname-within-OpenHAB",
    "stateItemInverted": "false",
    "stateItemMultiplier": "1",
    "manuMode": "false"
}
```
* `item`: The openHAB item representing the door, receiving commands about the target position and determining the current position (if `stateItem` is not set)
  * Needs to be of type `Rollershutter`, `Number` or `Switch` within openHAB
* `inverted` *(optional)*: If `item`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*
* `multiplier` *(optional)*: If `item`'s state need to be multiplied by a fixed amount to make sense to HomeKit, set this to a number (e.g. if your device stores its state in a float range from 0 to 1, where HomeKit expects integer numbers from 0 to 100 use a multiplier of 100)
  * Default: `"1"`
  * Needs to be a number *don't forget the quotes*
* `stateItem` *(optional)*: The openHAB item, used to determine the state of the door instead of `item`'s state
  * Needs to be of type `Rollershutter`, `Number`, `Switch` or `Contact` within openHAB
* `stateItemInverted` *(optional)*: If `stateItem`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*
* `stateItemMultiplier` *(optional)*: If `stateItem`'s state need to be multiplied by a fixed amount to make sense to HomeKit, set this to a number (e.g. if your device stores its state in a float range from 0 to 1, where HomeKit expects integer numbers from 0 to 100 use a multiplier of 100)
  * Default: `"1"`
  * Needs to be a number *don't forget the quotes*
* `manuMode` *(optional)*: If your item can be operated manually, you should enable this mode to not see `Opening...` or `Closing...` on the item when manipulating the state manually (This is due to the fact that HomeKit stores a `TargetState` value and compares it to the `ActualState` to show this metadata. The `manuMode` automatically changes the `TargetState` of the item, when the `ActualState` is changed)
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*

### Window
This service describes a motorized window

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "window", 
    "item": "Itemname-within-OpenHAB",
    "inverted": "false",
    "multiplier": "1",
    "stateItem": "Itemname-within-OpenHAB",
    "stateItemInverted": "false",
    "stateItemMultiplier": "1",
    "manuMode": "false"
}
```
* `item`: The openHAB item representing the window, receiving commands about the target position and determining the current position (if `stateItem` is not set)
  * Needs to be of type `Rollershutter`, `Number` or `Switch` within openHAB
* `inverted` *(optional)*: If `item`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*
* `multiplier` *(optional)*: If `item`'s state need to be multiplied by a fixed amount to make sense to HomeKit, set this to a number (e.g. if your device stores its state in a float range from 0 to 1, where HomeKit expects integer numbers from 0 to 100 use a multiplier of 100)
  * Default: `"1"`
  * Needs to be a number *don't forget the quotes*
* `stateItem` *(optional)*: The openHAB item, used to determine the state of the window instead of `item`'s state
  * Needs to be of type `Rollershutter`, `Number`, `Switch` or `Contact` within openHAB
* `stateItemInverted` *(optional)*: If `stateItem`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*
* `stateItemMultiplier` *(optional)*: If `stateItem`'s state need to be multiplied by a fixed amount to make sense to HomeKit, set this to a number (e.g. if your device stores its state in a float range from 0 to 1, where HomeKit expects integer numbers from 0 to 100 use a multiplier of 100)
  * Default: `"1"`
  * Needs to be a number *don't forget the quotes*
* `manuMode` *(optional)*: If your item can be operated manually, you should enable this mode to not see `Opening...` or `Closing...` on the item when manipulating the state manually (This is due to the fact that HomeKit stores a `TargetState` value and compares it to the `ActualState` to show this metadata. The `manuMode` automatically changes the `TargetState` of the item, when the `ActualState` is changed)
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*

### Lock Mechanism
The HomeKit Lock Mechanism service is designed to expose and control the physical lock mechanism on a device.

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "lock", 
    "item": "Itemname-within-OpenHAB",
    "inverted": "false",
    "stateItem": "Itemname-within-OpenHAB",
    "stateItemInverted": "false"
}
```
* `item`: The openHAB item representing the lock, receiving commands about the target position and determining the current position (if `stateItem` is not set)
  * Needs to be of type `Switch` within openHAB
* `inverted` *(optional)*: If `item`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*
* `stateItem` *(optional)*: The openHAB item, used to determine the state of the lock instead of `item`'s state
  * Needs to be of type `Rollershutter`, `Number`, `Switch` or `Contact` within openHAB
* `stateItemInverted` *(optional)*: If `stateItem`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*
  
### Garage Door Opener 
This service describes a garage door opener tat controls a single door. If a garage has more than one door, then each door should have its own Garage Door Opener Service.

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "garage", 
    "item": "Itemname-within-OpenHAB",
    "inverted": "false",
    "multiplier": "1",
    "stateItem": "Itemname-within-OpenHAB",
    "stateItemInverted": "false",
    "stateItemMultiplier": "1",
    "obstructionItem": "Itemname-within-OpenHAB",
    "obstructionItemInverted": "false"
}
```
* `item`: The openHAB item representing the garage door, receiving commands about the target position and determining the current position (if `stateItem` is not set)
  * Needs to be of type `Rollershutter`, `Number` or `Switch` within openHAB
  * In case of a `Number` item:
    * 100 ≙ OPEN
    * 0 ≙ CLOSED
  * In case of a `Rollershutter` item:
    * For the current state, the accessory behaves like a `Number` item
    * For the target state, the item will receive `UP` and `DOWN` commands
    * If you have an inverted `Rollershutter` item, use the same item as `stateItem` with `stateItemInverted` set to `"true"` and `inverted` set to false
* `inverted` *(optional)*: If `item`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*
* `multiplier` *(optional)*: If `item`'s state need to be multiplied by a fixed amount to make sense to HomeKit, set this to a number (e.g. if your device stores its state in a float range from 0 to 1, where HomeKit expects integer numbers from 0 to 100 use a multiplier of 100)
  * Default: `"1"`
  * Needs to be a number *don't forget the quotes*
* `stateItem` *(optional)*: The openHAB item, used to determine the state of the garage door instead of `item`'s state
  * Needs to be of type `Rollershutter`, `Number`, `Switch` or `Contact` within openHAB
* `stateItemInverted` *(optional)*: If `stateItem`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*
* `stateItemMultiplier` *(optional)*: If `stateItem`'s state need to be multiplied by a fixed amount to make sense to HomeKit, set this to a number (e.g. if your device stores its state in a float range from 0 to 1, where HomeKit expects integer numbers from 0 to 100 use a multiplier of 100)
  * Default: `"1"`
  * Needs to be a number *don't forget the quotes*
* `obstructionItem`: The openHAB item showing, if an obstruction is detected
  * Needs to be of type `Switch` or `Contact` within openHAB
* `obstructionItemInverted` *(optional)*: If `obstructionItem`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*
  
### Slat 
This service describes a slat which tilts on a vertical or a horizontal axis.

**Note:** Even though `Slat` is part of Apple's HAP specification, this accessory is shown as "not supported" in the Home.app.

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "slat",
    "stateItem": "Itemname-within-OpenHAB",
    "stateItemInverted": "false",
    "item": "Itemname-within-OpenHAB",
    "itemRangeStart: "itemRangeStart",
    "itemRangeEnd: "itemRangeEnd",
    "slatType": "horizontal"
}
```
* `stateItem`: The openHAB item describing the current state. The state can be `Fixed` or `Swinging`.
  * Needs to be of type `Switch` or `Contact` within openHAB
  * By default, `OPEN` or `ON` represents a swinging state, and `CLOSED` or `OFF` a fixed state.
* `stateItemInverted` *(optional)*: If `stateItem`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*
* `item` *(optional)*: The openHAB item representing the tilt angle of the slat, if the user can set the slats to a particular tilt angle.
  * Needs to be of type `Number`, `Rollershutter`, or `Dimmer` within openHAB 
  
    *(Note: When using `Dimmer` or `Rollershutter` type and OpenHAB receives a non numeric command like `ON`, `OFF`, `INCREASE`, `DECREASE`, `UP` or `DOWN` this might lead to unexpected behaviour and/or non-responsive HomeKit items. This exception is not covered by this plugin and the user needs to ensure a consistent state)*
  * Allowed value range: `-90` to `90` (for different ranges, see `itemRangeStart` and `itemRangeEnd`):
    * A value of 0 indicates that the slats are rotated to a fully open position
    * If `slatType` is `vertical`:
      * A value of -90 indicates that the slats are rotated all the way in a direction where the user-facing edge is higher than the window-facing edge
      * A value of 90 indicates that the slats are rotated all the way in a direction where the window-facing edge is higher than the user-facing edge
    * If `slatType` is `horizontal`:
      * A value of -90 indicates that the slats are rotated all the way in a direction where the user-facing edge is to the left of the window-facing edge
      * A value of 90 indicates that the slats are rotated all the way in a direction where the user-facing edge is to the right of the window-facing edge
* `itemRangeStart` *(optional)*: If the range of the openHAB item does not start at `-90` (e.g. if the angle is represented in percent from 0 to 100) set this value. The range will be mapped linearly.
  * Default: `"-90"`
  * Allowed values: All integers
* `itemRangeEnd` *(optional)*: If the range of the openHAB item does not end at `90` (e.g. if the angle is represented in percent from 0 to 100) set this value. The range will be mapped linearly.
  * Default: `"90"`
  * Allowed values: All integers
* `slatType` *(optional)*: Describes the type of slats
  * Default: `horizontal`
  * Allowed values: `horizontal` & `vertical`
  
### Temperature Sensor
This service describes a temperature sensor.

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "temp",
    "currentTempItem": "Itemname-within-OpenHAB",
    "tempUnit": "Celsius",
    "minTemp": "-100",
    "maxTemp": "200",
    "minTempStep": "0.1"
}
```
* `currentTempItem`: The openHAB item representing the current temperature
  * Needs to be of type `Number`, `Rollershutter`, or `Dimmer` within openHAB 
  
    *(Note: When using `Dimmer` or `Rollershutter` type and OpenHAB receives a non numeric command like `ON`, `OFF`, `INCREASE`, `DECREASE`, `UP` or `DOWN` this might lead to unexpected behaviour and/or non-responsive HomeKit items. This exception is not covered by this plugin and the user needs to ensure a consistent state)*
* `tempUnit` *(optional)*: Gives the measurement unit of the thermostat. HomeKit always expects the input to be in degrees celsius, therefore specifying Fahrenheit as a unit, the plugin will convert the values to be shown correctly on the fly.
  * Default: `Celsius`
  * Allowed values: `Celsius` & `Fahrenheit`
* `minTemp` *(optional)*: If you need to change the minimum allowed temperature, the `currentTempItem` is reading
  * Needs to be an float
  * Default: `-100`
* `maxTemp` *(optional)*: If you need to change the maximum allowed temperature, the `currentTempItem` is reading
  * Needs to be a float
  * Default: `200`
* `minTempStep` *(optional)*: If you need to change the granularity of the `currentTempItem` reading
  * Needs to be a float
  * Default: `0.1`

### Humidity Sensor
This service describes a humidity sensor.

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "humidity",
    "item": "Itemname-within-OpenHAB"
}
```
* `item`: The openHAB item representing the current humidity 
  * Needs to be of type `Number`, `Rollershutter`, or `Dimmer` within openHAB 
  
    *(Note: When using `Dimmer` or `Rollershutter` type and OpenHAB receives a non numeric command like `ON`, `OFF`, `INCREASE`, `DECREASE`, `UP` or `DOWN` this might lead to unexpected behaviour and/or non-responsive HomeKit items. This exception is not covered by this plugin and the user needs to ensure a consistent state)*

### Light Sensor
This service describes a light sensor.

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "lux",
    "item": "Itemname-within-OpenHAB"
}
```
* `item`: The openHAB item representing the current light in lux 
  * Needs to be of type `Number`, `Rollershutter`, or `Dimmer` within openHAB 
  
    *(Note: When using `Dimmer` or `Rollershutter` type and OpenHAB receives a non numeric command like `ON`, `OFF`, `INCREASE`, `DECREASE`, `UP` or `DOWN` this might lead to unexpected behaviour and/or non-responsive HomeKit items. This exception is not covered by this plugin and the user needs to ensure a consistent state)*

### Air Quality Sensor
This service describes an air quality sensor.

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "air",
    "item": "Itemname-within-OpenHAB"
}
```
* `item`: The openHAB item representing the current air quality, referring to the cumulative air quality recorded by the accessory, which may be based on multiple sensors present.
  * Needs to be of type `Number` within openHAB
  * Only discrete values are recognized:
    * 0 ≙ `UNKNOWN`
    * 1 ≙ `EXCELLENT`
    * 2 ≙ `GOOD`
    * 3 ≙ `FAIR`
    * 4 ≙ `INFERIOR`
    * 5 ≙ `POOR`
  
### Switch
This service describes a binary switch.

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "switch",
    "item": "Itemname-within-OpenHAB",
    "inverted": "false"
}
```
* `item`: The openHAB item controlled by this accessory
  * Needs to be of type `Switch` within openHAB
* `inverted` *(optional)*: If `item`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*


### Outlet
This service describes an outlet.

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "outlet",
    "item": "Itemname-within-OpenHAB",
    "inverted": "true",
    "inUseItem": "Itemname-within-OpenHAB",
    "inUseItemInverted": "false"
}
```
* `item`: The openHAB item controlled by this accessory
  * Needs to be of type `Switch` within openHAB
* `inverted` *(optional)*: If `item`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*
* `inUseItem` *(optional)*: Representing, if the outlet is currently in use (if `Switch` is `ON`, `Contact` is `OPEN` or `Number` is greater than 0)
  * Default: The state of `item` is used to show if the outlet is in use
  * Needs to be of type `Switch`, `Contact` or `Number` within openHAB
* `inUseItemInverted` *(optional)*: If `inUseItem`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*

### Motion Sensor
This service describes a motion sensor.

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "motion",
    "item": "Itemname-within-OpenHAB",
    "inverted": "true"
}
```
* `item`: The openHAB item showing, if motion is detected
  * Needs to be of type `Switch` or `Contact` within openHAB
* `inverted` *(optional)*: If `item`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*

### Occupancy Sensor
This service describes an occupancy sensor.

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "occupancy",
    "item": "Itemname-within-OpenHAB",
    "inverted": "true"
}
```
* `item`: The openHAB item showing, if occupancy is detected
  * Needs to be of type `Switch` or `Contact` within openHAB
* `inverted` *(optional)*: If `item`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*

### Leak Sensor
This service describes a leak sensor.

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "leak",
    "item": "Itemname-within-OpenHAB",
    "inverted": "true"
}
```
* `item`: The openHAB item showing, if a leak is detected
  * Needs to be of type `Switch` or `Contact` within openHAB
* `inverted` *(optional)*: If `item`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*

### Carbon Monoxide Sensor
This service describes a carbon monoxide sensor.

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "co",
    "item": "Itemname-within-OpenHAB",
    "inverted": "true",
    "levelItem": "Itemname-within-OpenHAB"
}
```
* `item`: The openHAB item showing, if carbon monoxide is detected
  * Needs to be of type `Switch` or `Contact` within openHAB
* `inverted` *(optional)*: If `item`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*
* `levelItem` *(optional)*: The openHAB item representing the current carbon monoxide level, measured by the sensor
  * Needs to be of type `Number`, `Rollershutter`, or `Dimmer` within openHAB 
  
    *(Note: When using `Dimmer` or `Rollershutter` type and OpenHAB receives a non numeric command like `ON`, `OFF`, `INCREASE`, `DECREASE`, `UP` or `DOWN` this might lead to unexpected behaviour and/or non-responsive HomeKit items. This exception is not covered by this plugin and the user needs to ensure a consistent state)*

### Carbon Dioxide Sensor
This service describes a carbon dioxide sensor.

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "co2",
    "item": "Itemname-within-OpenHAB",
    "inverted": "true",
    "levelItem": "Itemname-within-OpenHAB"
}
```
* `item`: The openHAB item showing, if carbon dioxide is detected
  * Needs to be of type `Switch` or `Contact` within openHAB
* `inverted` *(optional)*: If `item`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*
* `levelItem` *(optional)*: The openHAB item representing the current carbon dioxide level, measured by the sensor
  * Needs to be of type `Number`, `Rollershutter`, or `Dimmer` within openHAB 
  
    *(Note: When using `Dimmer` or `Rollershutter` type and OpenHAB receives a non numeric command like `ON`, `OFF`, `INCREASE`, `DECREASE`, `UP` or `DOWN` this might lead to unexpected behaviour and/or non-responsive HomeKit items. This exception is not covered by this plugin and the user needs to ensure a consistent state)*

### Contact Sensor
This service describes a contact sensor.

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "contact",
    "item": "Itemname-within-OpenHAB",
    "inverted": "true"
}
```
* `item`: The openHAB item showing, if contact is detected
  * Needs to be of type `Switch` or `Contact` within openHAB
* `inverted` *(optional)*: If `item`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*

### Smoke Sensor
This service describes a smoke sensor.

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "smoke",
    "item": "Itemname-within-OpenHAB",
    "inverted": "true"
}
```
* `item`: The openHAB item showing, if smoke is detected
  * Needs to be of type `Switch` or `Contact` within openHAB
* `inverted` *(optional)*: If `item`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*

### Filter Maintenance Sensor
This service describes a filter maintenance sensor.

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "filter",
    "item": "Itemname-within-OpenHAB",
    "inverted": "true",
    "levelItem": "Itemname-within-OpenHAB"
}
```
* `item`: The openHAB item showing, if filter maintenance is required 
  * Needs to be of type `Switch` or `Contact` within openHAB
* `inverted` *(optional)*: If `item`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*
* `levelItem` *(optional)*: The openHAB item representing the current filter level
  * Needs to be of type `Number`, `Rollershutter`, or `Dimmer` within openHAB 
  
    *(Note: When using `Dimmer` or `Rollershutter` type and OpenHAB receives a non numeric command like `ON`, `OFF`, `INCREASE`, `DECREASE`, `UP` or `DOWN` this might lead to unexpected behaviour and/or non-responsive HomeKit items. This exception is not covered by this plugin and the user needs to ensure a consistent state)*

## Additional Services & Notes from the Developer
Obviously the aim of this project is a full coverage of the HAP specification. Due to the limitations of smart devices in my home I can only test a subset and would love to have your feedback and input for this project.

Due to the very limited documentation on homebridge plugin development I have not implemented a dynamic platform (there is only [this partly complete wiki entry](https://github.com/nfarina/homebridge/wiki/On-Programming-Dynamic-Platforms)). If anyone of you knows how to do it, please contact me directly!

If you have feedback or suggestions how to better represent the services as openHAB Items, feel free to open an [issue](https://github.com/steilerDev/homebridge-openhab2-complete/issues).

If you would like to contribute just send me a pull request. In order to add a new service you have to modify/add the following parts:
1. Create your own accessory class within `./accessory`
2. The only *required* functions are `getServices()` (returning an array of `HAP.Service` with attached `HAP.Characteristic`) and `identify()` (which does not need to do anything). Those are implemented in the `Accessory` super class and don't need to be overridden. Make sure that `this._services` is populated and reflects your service
3. Define `const type = "YourTypeName"` (this will be used inside `config.json` to identify an accessory of your type) and `function createAccessory(platform, config)` returning an instance of your Accessory.
4. Finally expose `type` and `createAccessory` through `module.exports = {type, createAccessory}`
   
My accessories are using centrally defined characteristics inside `./accessory/characteristic`. See `NumericSensor.js` for a simple characteristic implementation and `TemperatureSensor.js` for a simple accessory using this characteristic. This is not a requirement, but highly recommended. 

## Comparision
| [homebridge-openhab2 plugin](https://www.npmjs.com/package/homebridge-openhab2) | openHAB2 - Complete Edition
--- | --- 
Verly little configuration within homebridge/openHAB, only tags within `*.items` files and inclusion within sitemap, obviously requiring both to be created manually | Explicit declaration within `config.json` not requiring instable openHAB `Metadata Provider` (removes items if state is `NULL`) and de-couples homebridge configuration from openHAB
Support only 1:1 mappings between Items and HomeKit services | Supports composite items (e.g. Thermostat, Security System, Battery States, etc.)
Uses `SSE` to receive push notifications from openHAB about state change and requires sitemap definitions | Pulling of states through REST interface & push notifications from openHAB through `SSE` *without*  the requirement of a sitemap
Thermostats never really worked | Thermostats working as expected
4 accessory types supported | 29 different accessory types supported
Light item in openHAB gets triggered multiple times from single user interaction | Light item in openHAB receives only one command per user interaction
No support for items with notification capabilities | Many HomeKit services can notify the user about a state change. Those accessories are only supported in this plugin

Concluding, I personally might only consider using the [OpenHAB homebridge plugin](https://www.npmjs.com/package/homebridge-openhab2) in smaller, less diverse installations. However my own installation has a a lot of different device types, that I want to fully include in HomeKit, therefore this plugin is the only feasible way for me and everyone alike.

# Acknowledgments
First of all, a massive thank you to all the users of this plugin, seeing so many positive responses to my work keeps me going and improving!

A couple of people helped me test this piece of software and by opening issues, pointing me into new and interesting directions and showing me ways to improve this plugin. A couple of them are very persistent and I want to thank you guys:
* Pieter Janssens (@piejanssens) for his [kind words on the openHAB community forum](https://community.openhab.org/t/homekit-holy-grail-homebridge-openhab2-complete/66167)
* Grzegorz (@grzegorz914) for providing quick feedback and opening a couple of helpful PR's
* @EjvindHald for at least the same amount of feedback
* Honorable mentions for finding my bugs and opening great, helpful and responsive issues:
  * @hartmood
  * @maisun
  * @apfelflo89
  * @CHTHSCH
