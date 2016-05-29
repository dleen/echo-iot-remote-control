import Device from './Device';

const VOLUME_UP_HALF = 'KEY_VOLUMEUP';
const VOLUME_DOWN_HALF = 'KEY_VOLUMEDOWN';
const VOLUME_MUTE = 'KEY_MUTE';
const MODE_BLUETOOTH = 'KEY_BLUETOOTH';
const CHANGE_MODE = 'KEY_MODE';
const POWER_TOGGLE = 'KEY_POWER';

const NUM_CHANNELS = 6;

const inputModeMapping = {
  'rca': 0,
  'coaxial': 1,
  '35mm': 2,
  'optical': 3
  // TODO: 4
  // TODO: 5
};

export const callTimes = (n, f) => {
  while(n-- > 0) f();
}

export const chainPromises = (n, pCreator) => {
  if (n === 0) return Promise.resolve();
  if (n === 1) return pCreator();
  return pCreator().then(() => chainPromises(n - 1, pCreator));
}

/**
 * Javascript's modulo operator % returns negative results for (-x) % y. This
 * returns a positive result.
 */
function mod(n, m) {
  return ((n % m) + m) % m;
}

export function calculateInputModeDelta(currentMode, targetMode) {
  const currentVal = inputModeMapping[currentMode];
  const targetVal = inputModeMapping[targetMode];
  return mod(targetVal - currentVal, NUM_CHANNELS);
}

export function calculateVolumeDelta(currentVolume, targetVolume) {
  const count = targetVolume - currentVolume;
  if (count >= 0) {
    return {
      count: 2 * count,
      f: 'volumeUp'
    }
  } else {
    return {
      count: -2 * count,
      f: 'volumeDown'
    }
  }
}

export default class Speaker extends Device {
  constructor(powerMode, volume, inputMode, bluetoothMode) {
    super('Vizio');
    this.powerMode = powerMode;
    this._volume = volume;
    this._inputMode = inputMode;
    this.bluetoothMode = bluetoothMode;
  }

  volumeUp = () => {
    return this.sendCommandDelayed(VOLUME_UP_HALF, 250);
  }

  volumeDown = () => {
    return this.sendCommandDelayed(VOLUME_DOWN_HALF, 250);
  }

  mute() {
    return this.sendCommand(VOLUME_MUTE);
  }

  _toggleBluetooth() {
    return this.sendCommand(MODE_BLUETOOTH);
  }

  _changeInputMode = () => {
    console.log('_changeInputMode');
    return this.sendCommandDelayed(CHANGE_MODE, 250);
  }

  _togglePower() {
    return this.sendCommand(POWER_TOGGLE);
  }

  powerOn() {
    if (this.powerMode === 'off') {
      this._togglePower();
      this.powerMode = 'on';
    }
  }

  powerOff() {
    if (this.powerMode === 'on') {
      this._togglePower();
      this.powerMode = 'off';
    }
  }

  bluetoothOn() {
    if (this.bluetoothMode === 'off') {
      this._toggleBluetooth();
      this.bluetoothMode = 'on';
    }
  }

  bluetoothOff() {
    if (this.bluetoothMode === 'on') {
      this._toggleBluetooth();
      this.bluetoothMode = 'off';
    }
  }

  setInputMode(mode) {
    let count = calculateInputModeDelta(this.inputMode, mode);
    return chainPromises(count, this._changeInputMode)
      .then(() => { this._inputMode = mode; return }, err => console.log(err));
  }

  get inputMode() {
    return this._inputMode;
  }

  setVolume(volume) {
    let { count, f } = calculateVolumeDelta(this._volume, volume);
    return chainPromises(count, this[f])
      .then(() => { this._volume = volume; return }, err => console.log(err));
  }

  get volume() {
    return this._volume;
  }

  update(delta) {
    if (delta.powerMode) {
      delta.powerMode === 'on' ? this.powerOn() : this.powerOff();
    }
    if (delta.volume) {
      this.setVolume(delta.volume);
    }
    if (delta.inputMode) {
      this.setInputMode(delta.inputMode);
    }
    if (delta.bluetoothMode) {
      delta.bluetoothMode === 'on' ? this.bluetoothOn() : this.bluetoothOff();
    }
  }

  get state() {
    return {
      powerMode: this.powerMode,
      volume: this.volume,
      inputMode: this.inputMode,
      bluetoothMode: this.bluetoothMode
    }
  }

}
