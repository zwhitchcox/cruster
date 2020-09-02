const sdk = require('etcher-sdk')
const { geteuid, platform } = require('process')

const adapters = [
	new sdk.scanner.adapters.BlockDeviceAdapter({
		includeSystemDrives: () => true,
	}),
];

// Can't use permissions.isElevated() here as it returns a promise and we need to set
// module.exports = scanner right now.
if (platform !== 'linux' || geteuid() === 0) {
	adapters.push(new sdk.scanner.adapters.UsbbootDeviceAdapter());
}

if (
	platform === 'win32' &&
	sdk.scanner.adapters.DriverlessDeviceAdapter !== undefined
) {
	adapters.push(new sdk.scanner.adapters.DriverlessDeviceAdapter());
}

module.exports.scanner = new sdk.scanner.Scanner(adapters);