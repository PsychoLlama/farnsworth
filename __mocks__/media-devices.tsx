const devices = jest.requireActual('media-devices');

jest.spyOn(devices.default, 'getUserMedia');
jest.spyOn(devices.default, 'enumerateDevices');
jest.spyOn(devices.default, 'getDisplayMedia');

module.exports = devices;
