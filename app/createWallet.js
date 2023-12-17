// Import dependencies
const bip32 = require('bip32')
const bip39 = require('bip39')
const bitcoin = require('bitcoinjs-lib')

// Define the network
const network = bitcoin.networks.testnet // Use networks.testnet for testnet

// Derivation path
const path = `m/49'/0'/0'/0` // Use m/49'/1'/0'/0 for testnet

let mnemonic = bip39.generateMnemonic()
const seed = bip39.mnemonicToSeedSync(mnemonic)
let root = bip32.fromSeed(seed, network)

let account = root.derivePath(path)
let node = account.derive(0).derive(0)

let btcAddress = bitcoin.payments.p2pkh({
  pubkey: node.publicKey,
  network: network,
}).address

console.log(`

Wallet generated:

 - Address  : ${btcAddress},
 - Key : ${node.toWIF()},
 - Mnemonic : ${mnemonic}

`)

//PS D:\lab2-BLC> node D:\lab2-BLC\app\createWallet.js   


// Wallet generated:

//  - Address  : mpyxvakDk4Yb8ogQGacUKCXEf2TLciAQgE,
//  - Key : cTAsg5rFvpyC3bMssYLnMTpjwveLuJ5LjwpWMyg6F6EhBATJsebC,
//  - Mnemonic : raven diamond remain honey modify unusual taxi eyebrow load cross smart question


// PS D:\lab2-BLC> node D:\lab2-BLC\app\createWallet.js


// Wallet generated:

//  - Address  : n3yPSbWg4bAdAaKdEPifb8imu8GsvUs6yX,
//  - Key : cPSJsUn7hjFoV3Y3tmxvy4q91LSFSqDaqAtsEJ1hy5pC4d6mLGyn,
//  - Mnemonic : spawn eight funny morning crucial stool mass since mirror ill rug obey
