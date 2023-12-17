const bitcoin = require('bitcoinjs-lib');
const axios = require('axios');
const bs58check = require('bs58check');

const getAddressUTXO = async (address) => {
  try {
    const response = await axios.get(`https://blockstream.info/testnet/api/address/${address}/utxo`);
    const utxos = response.data;
    const unspentUtxos = utxos.filter(utxo => utxo.status.confirmed === true);
    return unspentUtxos;
  } catch (error) {
    console.error("Lỗi khi lấy UTXOs:", error.message);
    throw error;
  }
};

const createAndSignTransaction = async (privateKey, utxos, destinationAddress) => {
  try {
    console.log("Khóa Riêng:", privateKey.toString('hex'));
    if (!Array.isArray(utxos) || utxos.length === 0) {
      throw new Error("Không có UTXO chưa sử dụng.");
    }
    const totalAmount = utxos.reduce((acc, utxo) => acc + utxo.value, 0);
    const amountToSend = Math.floor((1 / 4) * totalAmount);
    const psbt = new bitcoin.Psbt({ network: bitcoin.networks.testnet });
    
    utxos.forEach((utxo, index) => {
      console.log(`Thêm input ${index}:`, utxo);
      psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        witnessUtxo: utxo.witnessUtxo || {
          script: Buffer.from(utxo.scriptPubKey, 'hex'),
          value: utxo.value,
        },
      });
    });

    console.log("Output:", {
      address: destinationAddress,
      value: amountToSend,
    });

    psbt.addOutput({
      address: destinationAddress,
      value: amountToSend,
    });

    const nonWitnessUtxos = utxos.map(utxo => {
      return {
        script: Buffer.from(utxo.scriptPubKey, 'hex'),
        value: utxo.value,
        witnessUtxo: utxo.witnessUtxo,
      };
    });

    nonWitnessUtxos.forEach((nonWitnessUtxo, index) => {
      console.log(`Ký input ${index}:`, nonWitnessUtxo);
      console.log(`Bằng private key:`, privateKey.toString('hex'));
      const keyPair = bitcoin.ECPair.fromPrivateKey(privateKey);
      const witnessScript = nonWitnessUtxo.witnessUtxo && nonWitnessUtxo.witnessUtxo.witnessScript
        ? Buffer.from(nonWitnessUtxo.witnessUtxo.witnessScript, 'hex')
        : undefined;
      
        psbt.signInput(index, keyPair, {
          nonWitnessUtxo: [nonWitnessUtxo],
          witnessScript: witnessScript,
        });
        
    });

    const tx = psbt.finalizeAllInputs().extractTransaction().toHex();
    return tx;
  } catch (error) {
    console.error("Lỗi khi tạo và ký giao dịch:", error.message);
    throw error;
  }
};


const main = async () => {
  try {
    const sourceAddress = 'mpyxvakDk4Yb8ogQGacUKCXEf2TLciAQgE';
    const utxos = await getAddressUTXO(sourceAddress);
    const privateKeyValue = 'cTAsg5rFvpyC3bMssYLnMTpjwveLuJ5LjwpWMyg6F6EhBATJsebC';
    console.log("Giá trị Khóa Riêng:", privateKeyValue);
    const decodedKey = bs58check.decode(privateKeyValue);
    const privateKeyBuffer = Buffer.from(decodedKey.length >= 32 ? decodedKey.slice(-32) : decodedKey);


    console.log("Buffer Khóa Riêng:", privateKeyBuffer.toString('hex'));
    if (!privateKeyBuffer || privateKeyBuffer.length !== 32) {
      throw new Error("Khóa riêng không được cung cấp hoặc không hợp lệ.");
    }
    const destinationAddress = 'n3yPSbWg4bAdAaKdEPifb8imu8GsvUs6yX';
    console.log("Tạo và ký giao dịch...");
    const signedTransactionHex = await createAndSignTransaction(privateKeyBuffer, utxos, destinationAddress);
    console.log("Chuỗi Giao Dịch Đã Ký:", signedTransactionHex);
  } catch (error) {
    console.error("Lỗi:", error.message);
  }
};

main();
