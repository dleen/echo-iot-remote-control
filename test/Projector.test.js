import { expect } from 'chai';
import { spy } from 'sinon';

import Projector from '../src/device/Projector';

describe('Projector', function () {
  describe('#state', function () {
    it('should return the right state', function () {
      const p = new Projector('a', 'b');
      expect(p.state).to.eql({ powerMode: 'a', hdmiMode: 'b' });
    });
  });

  describe('#update()', function () {
    it('should call powerOn()', function () {
      const p = new Projector('off', null);
      const powerOnSpy = spy();
      p.powerOn = powerOnSpy;

      p.update({ powerMode: 'on' });

      expect(powerOnSpy.calledOnce).to.be.true;
      expect(p.powerMode).to.equal('on');
    });
    it('should call powerOff()', function () {
      const p = new Projector('on', null);
      const powerOffSpy = spy();
      p.powerOff = powerOffSpy;

      p.update({ powerMode: 'off' });

      expect(powerOffSpy.calledOnce).to.be.true;
      expect(p.powerMode).to.equal('off');
    });
    it('should call hdmi1()', function () {
      const p = new Projector(null, 'hdmi2');
      const hdmi1Spy = spy();
      p.hdmi1 = hdmi1Spy;

      p.update({ hdmiMode: 'hdmi1' });

      expect(hdmi1Spy.calledOnce).to.be.true;
      expect(p.hdmiMode).to.equal('hdmi1');
    });
    it('should call hdmi2()', function () {
      const p = new Projector(null, 'hdmi1');
      const hdmi2Spy = spy();
      p.hdmi2 = hdmi2Spy;

      p.update({ hdmiMode: 'hdmi2' });

      expect(hdmi2Spy.calledOnce).to.be.true;
      expect(p.hdmiMode).to.equal('hdmi2');
    });
  });
});
