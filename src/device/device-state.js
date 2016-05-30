import { thingShadow } from 'aws-iot-device-sdk';

import MediaCenter from './MediaCenter';

const iotThingConfig = require('../config/iot-thing-config.json');

let thingShadows;
let mediaCenter;

export function register() {
  thingShadows = thingShadow({
    ...iotThingConfig,
    clientId: process.env.USER.concat(Math.floor((Math.random() * 100000) + 1))
  });

  thingShadows.register('RaspberryPi', {
    persistentSubscribe: true
  });

  thingShadows.on('connect', function() {
    console.log('connect', 'Connected to IoT');
    thingShadows.get('RaspberryPi');
  });

  thingShadows.on('status', function(thingName, stat, clientToken, stateObject) {
    console.log('stateObject', JSON.stringify(stateObject, null, 2));
    if (mediaCenter === null || mediaCenter === undefined) {
      mediaCenter = MediaCenter.fromState(stateObject.state.desired);
    }

    console.log('status', thingName, stat, clientToken, stateObject);
  });

  thingShadows.on('error', function(error) {
    console.log('error', error);
  });

  thingShadows.on('delta', function(thingName, stateObject) {
    console.log('received delta on ' + thingName + ': ' +
      JSON.stringify(stateObject));
    mediaCenter.update(stateObject.state);
    thingShadows.update(thingName, {
      state: {
        reported: stateObject.state
      }
    });
  });

  thingShadows.on('timeout', function(thingName, clientToken) {
    console.warn('timeout: ' + thingName + ', clientToken=' + clientToken);
  });
}
