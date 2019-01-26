# Homebridge Plugin for OpenHAB2 - Complete Edition

> Exceeding features of [homebridge-openhab2](https://www.npmjs.com/package/homebridge-openhab2) and [openHAB's Homekit Plugin](https://www.openhab.org/addons/integrations/homekit/) since `v.0.3.0`

[![NPM](https://nodei.co/npm/homebridge-openhab2-complete.png)](https://nodei.co/npm/homebridge-openhab2-complete/)

This [homebridge](https://github.com/nfarina/homebridge) plugin for [openHAB](https://www.openhab.org) has the expectation to fully support all Services offered by Apple's Homekit Accessory Protocol (HAP), as far as it is feasible based on the Item types offered by OpenHAB. In opposite to the existing [openHAB homebridge plugin](https://www.npmjs.com/package/homebridge-openhab2) or the native [openHAB Homekit Plugin](https://www.openhab.org/addons/integrations/homekit/) this plugin requires explicit declaration of accessories in the homebridge configuration and does not use openHAB's tagging system, which leads to a little more effort during configuration, but should prove more reliable and functional in more complex installations. See [Comparisson](#comparison) below.


## Installation

*Note: Please install [homebridge](https://www.npmjs.com/package/homebridge) first.*

```
npm install -g homebridge-openhab2-complete
```

## Configuration

This is a platform plugin, that will register all accessories within the Bridge provided by homebridge. The following shows the general homebridge configuration (`config.json`), see the [Supported HAP Services below](#supported-hap-services), in order to get the detailed configuration for each Service.

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
* `host`: The IP or hostname of your openHAB instance. The Protocol specifier (`http://`) is optional, defaults to `http://` (independent of the port)
* `port`: Optional if not the default port of the protocol specified in `host`
* `accessory`: An array of accessories exposed to HomeKit, see the next chapter for available services and their configurations.

## Supported HAP Services
The following is a list of all Services that are currently supported and which values are required within the accessory configuration.

**Note: Due to the fact, that this is an early stage of development the configuration layout is not yet fixed and will change in the near future!**
 
* [Switch](#switch)
* [Lightbulb](#lightbulb)
* [Temperature Sensor](#temperature-sensor)
* [Humidity Sensor](#humidity-sensor)
* [Thermostat](#thermostat)
* [Window Covering](#window-covering)
* [Motion Sensor](#motion-sensor)
* [Leak Sensor](#leak-sensor)
* [Carbon Monoxide Sensor](#carbon-monoxide-sensor)
* [Carbon Dioxide Sensor](#carbon-dioxide-sensor)
* [Contact Sensor](#contact-sensor)
* [Smoke Sensor](#smoke-sensor)
* [Light Sensor](#light-sensor)

### Switch

This service describes a binary switch.

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "switch",
    "item": "Itemname-within-OpenHAB"
}
```
* `item` is expected to be of type `Switch` within openHAB

### Lightbulb

This service describes a lightbulb.

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "light",
    "item": "Itemname-within-OpenHAB"
}
```
* `item` is expected to be of type `Switch`, `Dimmer` or `Color` within openHAB (This changes the functionality within HomeKit)

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
* `item` is expected to be of type `Number` within openHAB 
* `batteryItem` (optional) defines an openHAB item of type `Switch` or `Contact` that represents a battery warning for the service, if the item has the state `ON` or `OPEN` the battery warning will be triggered
* `batteryItemInverted` (optional, default: `"false"`, allowed values `"true"` & `"false"` don't forget the quotes!) if `batteryItem`'s state needs to be interpreted inverted (`OFF` or `CLOSED` to trigger the warning) set this value to `"true"` 

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
* `item` is expected to be of type `Number` within openHAB 
* `batteryItem` (optional) defines an openHAB item of type `Switch` or `Contact` that represents a battery warning for the service, if the item has the state `ON` or `OPEN` the battery warning will be triggered
* `batteryItemInverted` (optional, default: `"false"`, allowed values `"true"` & `"false"` don't forget the quotes!) if `batteryItem`'s state needs to be interpreted inverted (`OFF` or `CLOSED` to trigger the warning) set this value to `"true"` 

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
    "mode": "HeatingCooling",
    "heatingItem": "Itemname-within-OpenHAB",
    "coolingItem": "Itemname-within-OpenHAB",
    "tempUnit": "Celsius"
}
```
* `currentTempItem` is expected to be of type `Number` within openHAB
* `targetTempItem` is expected to be of type `Number` within openHAB and writable
* `currentHumidityItem` (optional) is expected to be of type `Number` within openHAB
* `targetHumidityItem` (optional) is expected to be of type `Number` within openHAB and writable
* `mode` (optional, default `HeatingCooling`, allowed values: `HeatingCooling`, `Heating` & `Cooling`) represents the available mode for this thermostat
* `heatingItem` (optional if `mode: "Cooling"` otherwise required) is expected to be of type `Switch`, showing if the thermostat is currently heating the room
* `coolingItem` (optional if `mode: "Heating"` otherwise required) is expected to be of type `Switch`, showing if the thermostat is currently cooling the room
* `tempUnit` (optional, default `Celsius`, allowed values `Celsius` & `Fahrenheit`)

### Window Covering

This service describes motorized window coverings or shades - examples include shutters, blinds, awnings etc.

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "windowcovering", 
    "item": "Itemname-within-OpenHAB",
    "inverted": "false"
    "stateItem": "Itemname-within-OpenHAB",
    "stateItemInverted": "false"
}
```
* `item` is expected to be of type `Rollershutter`, `Number` or `Switch` within openHAB
* `inverted` (optional, default: `"false"`, allowed values `"true"` & `"false"` don't forget the quotes!) if `item`'s state needs to be interpreted inverted, set this value to `"true"` 
* `stateItem` (optional) is expected to be of type `Rollershutter`, `Number`, `Switch` or `Contact` and will be used to determine the state of the Window Covering instead of `item`'s state
* `stateItemInverted` (optional, default: `"false"`, allowed values `"true"` & `"false"` don't forget the quotes!) if `stateItem`'s state needs to be interpreted inverted, set this value to `"true"` 

### Door 

This service describes a motorized door

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "door", 
    "item": "Itemname-within-OpenHAB",
    "inverted": "false"
    "stateItem": "Itemname-within-OpenHAB",
    "stateItemInverted": "false"
}
```
* `item` is expected to be of type `Rollershutter`, `Number` or `Switch` within openHAB
* `inverted` (optional, default: `"false"`, allowed values `"true"` & `"false"` don't forget the quotes!) if `item`'s state needs to be interpreted inverted, set this value to `"true"` 
* `stateItem` (optional) is expected to be of type `Rollershutter`, `Number`, `Switch` or `Contact` and will be used to determine the state of the Door instead of `item`'s state
* `stateItemInverted` (optional, default: `"false"`, allowed values `"true"` & `"false"` don't forget the quotes!) if `stateItem`'s state needs to be interpreted inverted, set this value to `"true"` 

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
* `item` is expected to be of type `Switch` or `Contact` within openHAB 
* `inverted` (optional, default: `"false"`, allowed values `"true"` & `"false"` don't forget the quotes!) if `item`'s state needs to be interpreted inverted (`OFF` or `CLOSED` to show motion was detected) set this value to `"true"` 
* `batteryItem` (optional) defines an openHAB item of type `Switch` or `Contact` that represents a battery warning for the service, if the item has the state `ON` or `OPEN` the battery warning will be triggered
* `batteryItemInverted` (optional, default: `"false"`, allowed values `"true"` & `"false"` don't forget the quotes!) if `batteryItem`'s state needs to be interpreted inverted (`OFF` or `CLOSED` to trigger the warning) set this value to `"true"` 

### Leak Sensor

This service describes a leak sensor.

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
* `item` is expected to be of type `Switch` or `Contact` within openHAB 
* `inverted` (optional, default: `"false"`, allowed values `"true"` & `"false"` don't forget the quotes!) if `item`'s state needs to be interpreted inverted (`OFF` or `CLOSED` to show leakage was detected) set this value to `"true"` 
* `batteryItem` (optional) defines an openHAB item of type `Switch` or `Contact` that represents a battery warning for the service, if the item has the state `ON` or `OPEN` the battery warning will be triggered
* `batteryItemInverted` (optional, default: `"false"`, allowed values `"true"` & `"false"` don't forget the quotes!) if `batteryItem`'s state needs to be interpreted inverted (`OFF` or `CLOSED` to trigger the warning) set this value to `"true"` 

### Carbon Monoxide Sensor

This service describes a carbon monoxide sensor.

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "co",
    "item": "Itemname-within-OpenHAB",
    "inverted": "true",
    "batteryItem": "Itemname-within-OpenHAB",
    "batteryItemInverted": "false",
    "levelItem": "Itemname-within-OpenHAB"
}
```
* `item` is expected to be of type `Switch` or `Contact` within openHAB 
* `inverted` (optional, default: `"false"`, allowed values `"true"` & `"false"` don't forget the quotes!) if `item`'s state needs to be interpreted inverted (`OFF` or `CLOSED` to show Carbon Monoxide was detected) set this value to `"true"` 
* `batteryItem` (optional) defines an openHAB item of type `Switch` or `Contact` that represents a battery warning for the service, if the item has the state `ON` or `OPEN` the battery warning will be triggered
* `batteryItemInverted` (optional, default: `"false"`, allowed values `"true"` & `"false"` don't forget the quotes!) if `batteryItem`'s state needs to be interpreted inverted (`OFF` or `CLOSED` to trigger the warning) set this value to `"true"` 
* `levelItem` (optional) defines an openHAB item of type `Number` that represents the Carbon Monoxid level of the sensor

### Carbon Dioxide Sensor

This service describes a carbon dioxide sensor.

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "co2",
    "item": "Itemname-within-OpenHAB",
    "inverted": "true",
    "batteryItem": "Itemname-within-OpenHAB",
    "batteryItemInverted": "false",
    "levelItem": "Itemname-within-OpenHAB"
}
```
* `item` is expected to be of type `Switch` or `Contact` within openHAB 
* `inverted` (optional, default: `"false"`, allowed values `"true"` & `"false"` don't forget the quotes!) if `item`'s state needs to be interpreted inverted (`OFF` or `CLOSED` to show Carbon Dioxide was detected) set this value to `"true"` 
* `batteryItem` (optional) defines an openHAB item of type `Switch` or `Contact` that represents a battery warning for the service, if the item has the state `ON` or `OPEN` the battery warning will be triggered
* `batteryItemInverted` (optional, default: `"false"`, allowed values `"true"` & `"false"` don't forget the quotes!) if `batteryItem`'s state needs to be interpreted inverted (`OFF` or `CLOSED` to trigger the warning) set this value to `"true"` 
* `levelItem` (optional) defines an openHAB item of type `Number` that represents the Carbon Monoxid level of the sensor

### Contact Sensor

This service describes a contact sensor.

```
{
    "name": "An items name, as shown in Homekit later",
    "type": "co2",
    "item": "Itemname-within-OpenHAB",
    "inverted": "true",
    "batteryItem": "Itemname-within-OpenHAB",
    "batteryItemInverted": "false",
}
```
* `item` is expected to be of type `Switch` or `Contact` within openHAB 
* `inverted` (optional, default: `"false"`, allowed values `"true"` & `"false"` don't forget the quotes!) if `item`'s state needs to be interpreted inverted (`OFF` or `CLOSED` to show contact was detected) set this value to `"true"` 
* `batteryItem` (optional) defines an openHAB item of type `Switch` or `Contact` that represents a battery warning for the service, if the item has the state `ON` or `OPEN` the battery warning will be triggered
* `batteryItemInverted` (optional, default: `"false"`, allowed values `"true"` & `"false"` don't forget the quotes!) if `batteryItem`'s state needs to be interpreted inverted (`OFF` or `CLOSED` to trigger the warning) set this value to `"true"` 

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
* `item` is expected to be of type `Switch` or `Contact` within openHAB 
* `inverted` (optional, default: `"false"`, allowed values `"true"` & `"false"` don't forget the quotes!) if `item`'s state needs to be interpreted inverted (`OFF` or `CLOSED` to show smoke was detected) set this value to `"true"` 
* `batteryItem` (optional) defines an openHAB item of type `Switch` or `Contact` that represents a battery warning for the service, if the item has the state `ON` or `OPEN` the battery warning will be triggered
* `batteryItemInverted` (optional, default: `"false"`, allowed values `"true"` & `"false"` don't forget the quotes!) if `batteryItem`'s state needs to be interpreted inverted (`OFF` or `CLOSED` to trigger the warning) set this value to `"true"` 

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
* `item` is expected to be of type `Number` within openHAB 
* `batteryItem` (optional) defines an openHAB item of type `Switch` or `Contact` that represents a battery warning for the service, if the item has the state `ON` or `OPEN` the battery warning will be triggered
* `batteryItemInverted` (optional, default: `"false"`, allowed values `"true"` & `"false"` don't forget the quotes!) if `batteryItem`'s state needs to be interpreted inverted (`OFF` or `CLOSED` to trigger the warning) set this value to `"true"` 

## Additional Services & Notes from the Developer

Obviously the aim of this project is a full coverage of the HAP specification. Due to the limitations of smart devices in my home I can only test a subset and would love to have your feedback and input for this project.

Due to the very limited documentation on homebridge plugin development I have not implemented a dynamic platform (there is only [this partly complete wiki entry](https://github.com/nfarina/homebridge/wiki/On-Programming-Dynamic-Platforms)). If anyone of you knows how to do it, please contact me directly!

If you have feedback or suggestions how to better represent the Services as openHAB Items, feel free to open an [issue](https://github.com/steilerDev/homebridge-openhab2-complete/issues).

If you would like to contribute just send me a pull request. In order to add a new service you have to modify/add the following parts:
1. Create your own accessory class within `./accessory`
2. The only *required* functions are `getServices()` (returning an array of `HAP.Service` with attached `HAP.Characteristic`) and `identify()` (which does not need to do anything). Those are implemented in the `Accessory` super class and don't need to be overridden. Make sure that `this._services` is populated and reflects your service
3. Define `const type = "YourTypeName"` (this will be used inside `config.json` to identify an accessory of your type) and `function createAccessory(platform, config)` returning an instance of your Accessory.
4. Finally expose `type` and `createAccessory` through `module.exports = {type, createAccessory}`
    
See the `./accessory/Switch.js` accessory for a simple Service and use it as a skeleton


## Comparision

| [homebridge-openhab2 plugin](https://www.npmjs.com/package/homebridge-openhab2) | openHAB2 - Complete Edition
--- | --- 
Verly little configuration within homebridge/openHAB, only tags within `*.items` files and inclusion within sitemap, obviously requiring both to be created manually | Explicit declaration within `config.json` not requiring instable openHAB `Metadata Provider` (removes items if state is `NULL`) and de-couples homebridge configuration from openHAB
Support only 1:1 mappings between Items and HomeKit Services | Supports composite items (e.g. Thermostat)
No documentation to support extension | Simple concept for extending functionality
Uses `SSE` to receive push notifications from openHAB about state changes | Polling of states through REST interface
Battery Warnings not supported | Battery Warnings supported
Thermostats never really worked | Thermostats working perfectly
Two binary sensors supported without sub-characteristics | Seven distinct binary sensor types with sub-characteristics supported

Concluding, I personally would use the [OpenHAB homebridge plugin](https://www.npmjs.com/package/homebridge-openhab2) in smaller, less diverse installations. However my own installation has a magnitude of different devices, that I want to fully include in HomeKit, therefore this plugin is the only feasible way for me and everyone alike.