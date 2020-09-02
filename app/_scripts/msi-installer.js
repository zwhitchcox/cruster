const { MSICreator } = require('electron-wix-msi')

// Step 1: Instantiate the MSICreator
const msiCreator = new MSICreator({
  appDirectory: 'release/cruster-win32-x64',
  description: 'Create/Manage Raspberry PI Kubernetes Clusters',
  exe: 'cruster',
  name: 'Cruster',
  icon: '../logo/icons/apple-icon.png',
  manufacturer: 'Zane Hitchcox',
  version: '0.1.0',
  outputDirectory: 'release'
});

;(async () => {
// Step 2: Create a .wxs template file
const supportBinaries = await msiCreator.create();

// Step 3: Compile the template to a .msi file
await msiCreator.compile();
})()