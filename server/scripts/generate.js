const { secp256k1 } = require('ethereum-cryptography/secp256k1');
const { toHex } = require('ethereum-cryptography/utils');
const { keccak256 } = require('ethereum-cryptography/keccak');

// Function to generate Ethereum-style address
function generateAddress() {
  // Generate random private key
  const privateKey = secp256k1.utils.randomPrivateKey();
  console.log('Private Key:', toHex(privateKey));

  // Derive the public key
  const publicKey = secp256k1.getPublicKey(privateKey);
  console.log('Public Key:', toHex(publicKey));

  // Hash the public key (excluding the first byte) using Keccak-256
  const publicKeyHash = keccak256(publicKey.slice(1));

  // Take the last 20 bytes to generate the public address
  const address = `0x${toHex(publicKeyHash.slice(-20))}`;
  console.log('Ethereum Address:', address);

  return { privateKey: toHex(privateKey), publicKey: toHex(publicKey), address };
}

// Execute the function
generateAddress();
