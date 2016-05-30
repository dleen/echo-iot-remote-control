import Device from './Device';

const POWER_ON = 'KEY_POWER';
const POWER_OFF = 'KEY_POWER2';
const HDMI_1 = 'KEY_MODE';
const HDMI_2 = 'KEY_SWITCHVIDEOMODE';

export default class Projector extends Device {
  constructor(powerMode, hdmiMode) {
    super('Optoma');
    this.powerMode = powerMode;
    this.hdmiMode = hdmiMode;
  }

  powerOn() {
    return this.sendCommand(POWER_ON);
  }

  powerOff() {
    return this.sendCommand(POWER_OFF);
  }

  hdmi1() {
    return this.sendCommand(HDMI_1);
  }

  hdmi2() {
    return this.sendCommand(HDMI_2);
  }

  update(delta) {
    if (delta.powerMode) {
      delta.powerMode === 'on' ? this.powerOn() : this.powerOff();
      this.powerMode = delta.powerMode;
    }
    if (delta.hdmiMode) {
      delta.hdmiMode === 'hdmi1' ? this.hdmi1() : this.hdmi2();
      this.hdmiMode = delta.hdmiMode;
    }
  }

  get state() {
    return {
      powerMode: this.powerMode,
      hdmiMode: this.hdmiMode
    }
  }
}
