const exec = require('child_process').exec;

const PROG = 'irsend';
const COMMON_ARGS = ['-d', '/run/lirc/lircd-lirc0', 'SEND_ONCE'];

export default class Device {
  constructor(name) {
    this.name = name;
  }

  sendCommand(command) {
    return new Promise((resolve, reject) => {
      exec([PROG, ...COMMON_ARGS, this.name, command].join(' '),
           {}, (err, stdout, stderr) =>
        err ? reject(err) : resolve({ stdout, stderr }))
    });
  }

  sendCommandDelayed(command, delay) {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(this.sendCommand(command)), delay);
    });
  }
}
