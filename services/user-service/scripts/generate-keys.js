const crypto = require('crypto');

// Generate Ed25519 key pair for PASETO V4
const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8', 
    format: 'pem'
  }
});

console.log('Generated PASETO V4 Key Pair:');
console.log('=====================================');
console.log('PASETO_PRIVATE_KEY=');
console.log(privateKey);
console.log('PASETO_PUBLIC_KEY=');
console.log(publicKey);
console.log('=====================================');
console.log('Copy these keys to your .env file');