import { expect } from 'chai';
import { spy } from 'sinon';

import Speaker, {
  calculateInputModeDelta,
  calculateVolumeDelta,
  chainPromises } from '../src/Speaker';

describe('chainPromises', function () {
  it('should call the promises n times', function (done) {
    const pspy = spy();
    const pCreator = () => new Promise((resolve, reject) => {
      pspy();
      return resolve();
    });

    chainPromises(4, pCreator)
    .then(resolve => {
      expect(pspy.callCount).to.equal(4);
      done();
    })
    .catch(done);
  });
});

describe('Speaker', function () {
  describe('#state', function () {
    it('should return the right state', function () {
      const s = new Speaker('a', 'b', 'c', 'd');
      expect(s.state).to.eql({
        powerMode: 'a',
        volume: 'b',
        inputMode: 'c',
        bluetoothMode: 'd'
      });
    });
  });

  describe('calculateInputModeDelta()', function () {
    it('should calculate the right distance between rca and coaxial', function () {
      expect(calculateInputModeDelta('rca', 'coaxial')).to.equal(1);
    });
    it('should calculate the right distance between rca and optical', function () {
      expect(calculateInputModeDelta('rca', 'optical')).to.equal(3);
    });
    it('should calculate the right distance between 35mm and coaxial', function () {
      expect(calculateInputModeDelta('35mm', 'coaxial')).to.equal(5);
    });
    it('should wrap around', function () {
      expect(calculateInputModeDelta('optical', 'rca')).to.equal(3);
    });
    it('should do nothing', function () {
      expect(calculateInputModeDelta('optical', 'optical')).to.equal(0);
    });
  });

  describe('calculateVolumeDelta()', function () {
    it('should calculate the count and function up', function () {
      expect(calculateVolumeDelta(4, 7)).to.eql({ count: 6, f: 'volumeUp' });
    });
    it('should calculate the count and function down', function () {
      expect(calculateVolumeDelta(4, 2)).to.eql({ count: 4, f: 'volumeDown' });
    });
    it('should count zero', function () {
      expect(calculateVolumeDelta(4, 4)).to.eql({ count: 0, f: 'volumeUp' });
    });
  });

  describe('#powerOn()', function () {
    it('should toggle power and set the state', function () {
      const s = new Speaker('off');
      const toggleSpy = spy();
      s._togglePower = toggleSpy;
      s.powerOn();
      expect(toggleSpy.calledOnce).to.be.true;
      expect(s.powerMode).to.equal('on');
    });
  });

  describe('#powerOff()', function () {
    it('should toggle power and set the state', function () {
      const s = new Speaker('on');
      const toggleSpy = spy();
      s._togglePower = toggleSpy;
      s.powerOff();
      expect(toggleSpy.calledOnce).to.be.true;
      expect(s.powerMode).to.equal('off');
    });
  });

  describe('#inputMode()', function () {
    it('should call _changeInputMode the right number of times', function (done) {
      const s = new Speaker('on', null, '35mm');
      const changeInputSpy = spy();
      const changeInputSpyCreator = () => new Promise((resolve, reject) => {
        changeInputSpy();
        return resolve();
      });
      s._changeInputMode = changeInputSpyCreator;
      s.setInputMode('coaxial')
      .then(() => {
        expect(changeInputSpy.callCount).to.equal(5);
        expect(s.inputMode).to.equal('coaxial');
        done();
      })
      .catch(done);
    });
    it('should not call _changeInputMode', function (done) {
      const s = new Speaker('on', null, '35mm');
      const changeInputSpy = spy();
      const changeInputSpyCreator = () => new Promise((resolve, reject) => {
        changeInputSpy();
        return resolve();
      });
      s._changeInputMode = changeInputSpyCreator;
      s.setInputMode('35mm')
      .then(() => {
        expect(changeInputSpy.called).to.be.false;
        expect(s.inputMode).to.equal('35mm');
        done();
      })
      .catch(done);
    });
  });

  describe('#volume()', function () {
    it('should call volumeUp the right number of times', function (done) {
      const s = new Speaker('on', 4);
      const volumeUpSpy = spy();
      const volumeUpSpyCreator = () => new Promise((resolve, reject) => {
        volumeUpSpy();
        return resolve();
      });
      s.volumeUp = volumeUpSpyCreator;
      s.setVolume(7)
      .then(() => {
        expect(volumeUpSpy.callCount).to.equal(6);
        expect(s.volume).to.equal(7);
        done();
      })
      .catch(done);
    });
    it('should call volumeDown the right number of times', function (done) {
      const s = new Speaker('on', 8);
      const volumeDownSpy = spy();
      const volumeDownSpyCreator = () => new Promise((resolve, reject) => {
        volumeDownSpy();
        return resolve();
      });
      s.volumeDown = volumeDownSpyCreator;
      s.setVolume(3)
      .then(() => {
        expect(volumeDownSpy.callCount).to.equal(10);
        expect(s.volume).to.equal(3);
        done();
      })
      .catch(done);
    });
  });

  describe('#update()', function () {
    it('should call powerOn', function () {
      const s = new Speaker('off');
      const toggleSpy = spy();
      s._togglePower = toggleSpy;

      s.update({ powerMode: 'on' });

      expect(toggleSpy.calledOnce).to.be.true;
      expect(s.powerMode).to.equal('on');
    });
    it('should not call powerOn', function () {
      const s = new Speaker('on');
      const toggleSpy = spy();
      s._togglePower = toggleSpy;

      s.update({ powerMode: 'on' });

      expect(toggleSpy.calledOnce).to.be.false;
      expect(s.powerMode).to.equal('on');
    });
    it('should call powerOff', function () {
      const s = new Speaker('on');
      const toggleSpy = spy();
      s._togglePower = toggleSpy;

      s.update({ powerMode: 'off' });

      expect(toggleSpy.calledOnce).to.be.true;
      expect(s.powerMode).to.equal('off');
    });
    it('should call volumeUp', function () {
      const s = new Speaker('on', 5);
      const volumeSpy = spy();
      s.setVolume = volumeSpy;

      s.update({ volume: 7 });

      expect(volumeSpy.calledOnce).to.be.true;
    });
  });
});
