# Homebridge Plugin for OpenHAB2 - Complete Edition
> Exceeding features of [homebridge-openhab2](https://www.npmjs.com/package/homebridge-openhab2) and [openHAB's Homekit Plugin](https://www.openhab.org/addons/integrations/homekit/) since `v.0.3.0`

[![NPM](https://nodei.co/npm/homebridge-openhab2-complete.png)](https://nodei.co/npm/homebridge-openhab2-complete/)

This [homebridge](https://github.com/nfarina/homebridge) plugin for [openHAB](https://www.openhab.org) has the expectation to fully support all services offered by Apple's Homekit Accessory Protocol (HAP), as far as it is feasible based on the Item types offered by OpenHAB (see [below](#supported-hap-services) for the currently supported 21 accessories and `CHANGELOG.md` for my roadmap). In opposite to the existing [openHAB homebridge plugin](https://www.npmjs.com/package/homebridge-openhab2) or the native [openHAB Homekit Plugin](https://www.openhab.org/addons/integrations/homekit/) this plugin requires explicit declaration of accessories in the homebridge configuration and does not use openHAB's tagging system, which leads to a little more effort during configuration, but should prove more reliable and functional in more complex installations. See [Comparisson](#comparison) below.

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

## Supported HAP Services
The following is a list of all services that are currently supported and which values are required within the accessory configuration. Every accessory needs a `name` (as shown in HomeKit later) and a `type`. 

**Note: Due to the fact, that this is an early stage of development the configuration layout is not yet fixed and will change in the near future!**

* Complex Accessories:
  * [Lightbulb](#lightbulb) 
    * Homebridge configuration type: `light`
  * [Thermostat](#thermostat)
    * Homebridge configuration type: `thermostat`
  * [Security System](#security-system)
    * Homebridge configuration type: `security`
* Position Based Actors:
  * [Window Covering](#window-covering)
    * Homebridge configuration type: `windowcovering`
  * [Door](#door)
    * Homebridge configuration type: `door`
  * [Window](#window)
    * Homebridge configuration type: `window`
  * [Lock Mechanism](#lock-mechanism)
    * Homebridge configuration type: `lock`
* Numeric Sensors:
  * [Temperature Sensor](#temperature-sensor)
    * Homebridge configuration type: `temp`
  * [Humidity Sensor](#humidity-sensor)
    * Homebridge configuration type: `humidity`
  * [Light Sensor](#light-sensor)
    * Homebridge configuration type: `lightSensor`
* Binary Actors:
  * [Switch](#switch)
    * Homebridge configuration type: `switch`
  * [Fan](#fan)
    * Homebridge configuration type: `fan`
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
  
The following services will be implemented in the near future:
* Water service accessories
  * Valve
  * Faucet
  * Irrigation
* Climate service accessories
  * HeaterCooler
  * Humidifier/Dehumidifier
  * Air Purifier

The following services are also defined by the HomeKit protocol, but since I don't know a good way to map them to openHAB items, I currently don't plan to implement them. Let me know if you have any ideas, by opening an issue!
* Garage Door Opener
* Air Quality Sensor
* Slat
* Microphone
* Speaker
* Camera RTP Stream Management
* Doorbell
* Stateless Programmable Switch

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

### Thermostat
This service describes a thermostat.

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
    "tempUnit": "Celsius"
}
```
* `currentTempItem`: The openHAB item representing the current temperature as measured by the thermostat
  * Needs to be of type `Number` within openHAB
* `targetTempItem`: The openHAB item representing the target temperature inside the room
  * Needs to be of type `Number` within openHAB
* `currentHumidityItem` *(optional)*: The openHAB item representing the current humidity as measured by the thermostat
  * Needs to be of type `Number` within openHAB
* `targetHumidityItem` *(optional)*: The openHAB item representing the target humidity inside the room
  * Needs to be of type `Number` within openHAB
* `heatingItem` *(optional, if `coolingItem` is present, otherwise required)*: The openHAB item showing, if the room is currently being heated
  * Needs to be of type `Switch` or `Contact` within openHAB
* `coolingItem` *(optional, if `heatingItem` is present, otherwise required)*: The openHAB item showing, if the room is currently being cooled
  * Needs to be of type `Switch` or `Contact` within openHAB
* `tempUnit` *(optional)*: Gives the measurement unit of the thermostat, currently does not change anything inside HomeKit
  * Default: `Celsius`
  * Allowed values: `Celsius` & `Fahrenheit`

### Security System
```
{
    "name": "An items name, as shown in Homekit later",
    "type": "security"
    "homeItem": "Itemname-within-OpenHAB",
    "homeItemInverted": "false",
    "awayItem": "Itemname-within-OpenHAB",
    "awayItemInverted": "false",
    "sleepItem": "Itemname-within-OpenHAB",
    "sleepItemInverted": "false",
    "alarmItem": "Itemname-within-OpenHAB",
    "alarmItemInverted": "false"
}
```
* `homeItem` *(optional)*: The openHAB item representing if the system is in home mode
  * Needs to be of type `Switch` within openHAB
* `homeItemInverted` *(optional)*: If `homeItem`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*
* `awayItem` *(optional)*: The openHAB item representing if the system is in away mode
  * Needs to be of type `Switch` within openHAB
* `awayItemInverted` *(optional)*: If `awayItem`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*
* `sleepItem` *(optional)*: The openHAB item representing if the system is in sleep mode
  * Needs to be of type `Switch` within openHAB
* `sleepItemInverted` *(optional)*: If `sleepItem`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*
* `alarmItem` *(optional)*: The openHAB item representing if the system is currently sounding an alarm
  * Needs to be of type `Switch` within openHAB
* `alarmItemInverted` *(optional)*: If `alarmItem`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*

Each item (`homeItem`, `awayItem`, `sleepItem`, `alarmItem`) is optional, only one of them needs to be defined. When switching between the states (`Home Armed`, `Away Armed`, `Sleep Armed` & `Off`) the respective item gets turned on and all other will be turned off. The state of the system is determined which item in the order `alarmItem` -> `homeItem` -> `awayItem` -> `sleepItem` is turned on first, if all items are off the state is `OFF`.

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
    "stateItemInverted": "false"
    "stateItemMultiplier": "1",
    "manuMode": "false"
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
  
### Temperature Sensor
This service describes a temperature sensor.

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "temp",
    "item": "Itemname-within-OpenHAB",
    "batteryItem": "Itemname-within-OpenHAB",
    "batteryItemInverted": "false"
}
```
* `item`: The openHAB item representing the current temperature
  * Needs to be of type `Number` within openHAB
* `batteryItem` *(optional)*: The openHAB item representing a battery warning for this accessory. If the item has the state `ON` or `OPEN` the battery warning will be triggered
  * Needs to be of type `Switch` or `Contact` within openHAB
* `batteryItemInverted` *(optional)*: If `batteryItem`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*

### Humidity Sensor
This service describes a humidity sensor.

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "humidity",
    "item": "Itemname-within-OpenHAB",
    "batteryItem": "Itemname-within-OpenHAB",
    "batteryItemInverted": "false"
}
```
* `item`: The openHAB item representing the current humidity 
  * Needs to be of type `Number` within openHAB
* `batteryItem` *(optional)*: The openHAB item representing a battery warning for this accessory. If the item has the state `ON` or `OPEN` the battery warning will be triggered
  * Needs to be of type `Switch` or `Contact` within openHAB
* `batteryItemInverted` *(optional)*: If `batteryItem`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*

### Light Sensor
This service describes a light sensor.

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "lightSensor",
    "item": "Itemname-within-OpenHAB",
    "batteryItem": "Itemname-within-OpenHAB",
    "batteryItemInverted": "false"
}
```
* `item`: The openHAB item representing the current light in lux 
  * Needs to be of type `Number` within openHAB
* `batteryItem` *(optional)*: The openHAB item representing a battery warning for this accessory. If the item has the state `ON` or `OPEN` the battery warning will be triggered
  * Needs to be of type `Switch` or `Contact` within openHAB
* `batteryItemInverted` *(optional)*: If `batteryItem`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*

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

### Fan
This service describes a fan.

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "fan",
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
    "inverted": "true",
    "batteryItem": "Itemname-within-OpenHAB",
    "batteryItemInverted": "false"
}
```
* `item`: The openHAB item showing, if motion is detected
  * Needs to be of type `Switch` or `Contact` within openHAB
* `inverted` *(optional)*: If `item`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*
* `batteryItem` *(optional)*: The openHAB item representing a battery warning for this accessory. If the item has the state `ON` or `OPEN` the battery warning will be triggered
  * Needs to be of type `Switch` or `Contact` within openHAB
* `batteryItemInverted` *(optional)*: If `batteryItem`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*

### Occupancy Sensor
This service describes an occupancy sensor.

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "occupancy",
    "item": "Itemname-within-OpenHAB",
    "inverted": "true",
    "batteryItem": "Itemname-within-OpenHAB",
    "batteryItemInverted": "false"
}
```
* `item`: The openHAB item showing, if occupancy is detected
  * Needs to be of type `Switch` or `Contact` within openHAB
* `inverted` *(optional)*: If `item`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*
* `batteryItem` *(optional)*: The openHAB item representing a battery warning for this accessory. If the item has the state `ON` or `OPEN` the battery warning will be triggered
  * Needs to be of type `Switch` or `Contact` within openHAB
* `batteryItemInverted` *(optional)*: If `batteryItem`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*

### Leak Sensor
This service describes a leak sensor.

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "leak",
    "item": "Itemname-within-OpenHAB",
    "inverted": "true",
    "batteryItem": "Itemname-within-OpenHAB",
    "batteryItemInverted": "false"
}
```
* `item`: The openHAB item showing, if a leak is detected
  * Needs to be of type `Switch` or `Contact` within openHAB
* `inverted` *(optional)*: If `item`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*
* `batteryItem` *(optional)*: The openHAB item representing a battery warning for this accessory. If the item has the state `ON` or `OPEN` the battery warning will be triggered
  * Needs to be of type `Switch` or `Contact` within openHAB
* `batteryItemInverted` *(optional)*: If `batteryItem`'s state needs to be interpreted inverted, set this value to `"true"` 
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
    "levelItem": "Itemname-within-OpenHAB",
    "batteryItem": "Itemname-within-OpenHAB",
    "batteryItemInverted": "false"
}
```
* `item`: The openHAB item showing, if carbon monoxide is detected
  * Needs to be of type `Switch` or `Contact` within openHAB
* `inverted` *(optional)*: If `item`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*
* `levelItem` *(optional)*: The openHAB item representing the current carbon monoxide level, measured by the sensor
  * Needs to be of type `Number` within openHAB
* `batteryItem` *(optional)*: The openHAB item representing a battery warning for this accessory. If the item has the state `ON` or `OPEN` the battery warning will be triggered
  * Needs to be of type `Switch` or `Contact` within openHAB
* `batteryItemInverted` *(optional)*: If `batteryItem`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*

### Carbon Dioxide Sensor
This service describes a carbon dioxide sensor.

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "co2",
    "item": "Itemname-within-OpenHAB",
    "inverted": "true",
    "levelItem": "Itemname-within-OpenHAB",
    "batteryItem": "Itemname-within-OpenHAB",
    "batteryItemInverted": "false"
}
```
* `item`: The openHAB item showing, if carbon dioxide is detected
  * Needs to be of type `Switch` or `Contact` within openHAB
* `inverted` *(optional)*: If `item`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*
* `levelItem` *(optional)*: The openHAB item representing the current carbon dioxide level, measured by the sensor
  * Needs to be of type `Number` within openHAB
* `batteryItem` *(optional)*: The openHAB item representing a battery warning for this accessory. If the item has the state `ON` or `OPEN` the battery warning will be triggered
  * Needs to be of type `Switch` or `Contact` within openHAB
* `batteryItemInverted` *(optional)*: If `batteryItem`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*

### Contact Sensor
This service describes a contact sensor.

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "contact",
    "item": "Itemname-within-OpenHAB",
    "inverted": "true",
    "batteryItem": "Itemname-within-OpenHAB",
    "batteryItemInverted": "false",
}
```
* `item`: The openHAB item showing, if contact is detected
  * Needs to be of type `Switch` or `Contact` within openHAB
* `inverted` *(optional)*: If `item`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*
* `batteryItem` *(optional)*: The openHAB item representing a battery warning for this accessory. If the item has the state `ON` or `OPEN` the battery warning will be triggered
  * Needs to be of type `Switch` or `Contact` within openHAB
* `batteryItemInverted` *(optional)*: If `batteryItem`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*

### Smoke Sensor
This service describes a smoke sensor.

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "smoke",
    "item": "Itemname-within-OpenHAB",
    "inverted": "true",
    "batteryItem": "Itemname-within-OpenHAB",
    "batteryItemInverted": "false",
}
```
* `item`: The openHAB item showing, if smoke is detected
  * Needs to be of type `Switch` or `Contact` within openHAB
* `inverted` *(optional)*: If `item`'s state needs to be interpreted inverted, set this value to `"true"` 
  * Default: `"false"`
  * Allowed values: `"true"` & `"false"` *don't forget the quotes*
* `batteryItem` *(optional)*: The openHAB item representing a battery warning for this accessory. If the item has the state `ON` or `OPEN` the battery warning will be triggered
  * Needs to be of type `Switch` or `Contact` within openHAB
* `batteryItemInverted` *(optional)*: If `batteryItem`'s state needs to be interpreted inverted, set this value to `"true"` 
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
  * Needs to be of type `Number` within openHAB

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
4 accessory types supported | 21 different accessory types supported
Light item in openHAB gets triggered multiple times from single user interaction | Light item in openHAB receives only one command per user interaction
No support for items with notification capabilities | Many HomeKit services can notify the user about a state change. Those accessories are only supported in this plugin

Concluding, I personally might only consider using the [OpenHAB homebridge plugin](https://www.npmjs.com/package/homebridge-openhab2) in smaller, less diverse installations. However my own installation has a a lot of different device types, that I want to fully include in HomeKit, therefore this plugin is the only feasible way for me and everyone alike.