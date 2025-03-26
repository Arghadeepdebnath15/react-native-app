// Script to find and display the local network IP address
const { networkInterfaces } = require('os');

// Get all network interfaces
const nets = networkInterfaces();
const results = {};

// Loop through interfaces to find valid IPv4 addresses
for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    // Skip over non-IPv4 and internal (loopback) addresses
    if (net.family === 'IPv4' && !net.internal) {
      if (!results[name]) {
        results[name] = [];
      }
      results[name].push(net.address);
    }
  }
}

console.log('\n=== LOCAL IP ADDRESSES ===');
console.log('Use one of these IP addresses to access your app from other devices:');

// Display all found IP addresses
let foundAddresses = false;
for (const [key, addresses] of Object.entries(results)) {
  for (const address of addresses) {
    console.log(`\nInterface: ${key}`);
    console.log(`IP Address: ${address}`);
    console.log(`Frontend URL: http://${address}:3000`);
    console.log(`Backend API: http://${address}:5000/api/products`);
    foundAddresses = true;
  }
}

if (!foundAddresses) {
  console.log('\nNo network interfaces found. Make sure you are connected to a network.');
}

console.log('\n=========================\n'); 