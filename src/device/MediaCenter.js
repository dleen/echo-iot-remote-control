import Projector from './Projector';
import Speaker from './Speaker';

export default class MediaCenter {
  constructor(speaker, projector) {
    this.speaker = speaker;
    this.projector = projector;
  }

  static fromState(state) {
    const { powerMode, volume, inputMode, bluetoothMode } = state.speaker;
    const speaker = new Speaker(powerMode, volume, inputMode, bluetoothMode);
    const projector =
      new Projector(state.projector.powerMode, state.projector.hdmiMode);
    return new MediaCenter(speaker, projector);
  }

  update(delta) {
    if (delta.speaker) this.speaker.update(delta.speaker);
    if (delta.projector) this.projector.update(delta.projector);
  }

  get state() {
    return {
      speaker: this.speaker.state,
      projector: this.projector.state
    }
  }
}
