'use strict'
require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const EthereumTx = require('ethereumjs-tx').Transaction
const Web3 = require('web3')
const web3 = new Web3( new Web3.providers.HttpProvider('https://rinkeby.infura.io/v3/1d04d697cad349b48e6eab70a6571045'))
var path = require('path');
const abiArray = require('./abi/points')
const tokenAddress = '0x7072085d110D330E55FD4985a047AE142d46eb92'
const contract = new web3.eth.Contract(abiArray.points,tokenAddress)
const _key = '5e03ec28f586af03fdab3bcc64aac8bf42fdeec34b4de7346d05df08335f94ba'
const defaultAccount = '0x25Ddb0a09c45741c14f7039e2655c21c6697a2d4'
const gas_limit = 410000
// Constants
const PORT = 8080
const HOST = '0.0.0.0'

// App
const app = express()
// parse body params and attache them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('html'))
  // viewed at http://localhost:8080
  app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/html/index.html'));
  });

app.get('/balance', async (req, res) => {
  web3.eth.defaultAccount = '0x25Ddb0a09c45741c14f7039e2655c21c6697a2d4'
  let balances = 0;
  console.log(req.query);
  if (req.query.type == 0)
  {
    balances = await contract.methods.CashBalances(req.query.walletAddress).call()
  }
  else if (req.query.type == 1)
  {
    balances = await contract.methods.LoyalBalances(req.query.walletAddress).call()
  }
  else {
    res.send('error')
  }
    
  res.send({ balances })
})

app.post('/points', async (req, res) => {
  let txData;
  const { txType, address, amount, type } = req.body;
  if (txType == 'new')
  {
    txData = contract.methods.mint(address, amount, type).encodeABI()
  }
  else if (txType == 'use')
  {
    txData = contract.methods.burn(address, amount, type).encodeABI()
  }
  else {
    res.send({ Error: 'Invalid points type' })
  }
  const gasPrice = await web3.eth.getGasPrice()
  const nonce  = await web3.eth.getTransactionCount(defaultAccount);
  const rawTransaction = {
    nonce: web3.utils.toHex(nonce),
    gasLimit: web3.utils.toHex((gas_limit.gasLimit + 1000000).toString()),
    gasPrice: web3.utils.toHex(gasPrice.toString()),
    to: tokenAddress,
    from: defaultAccount,
    value: '0x0',
    data: txData
  };

  var privateKey = new Buffer.from(_key, 'hex');
  var transaction = new EthereumTx(rawTransaction, { chain: 'rinkeby'});
  transaction.sign(privateKey);
  var serializedTx = transaction.serialize().toString('hex');
  const results = await web3.eth.sendSignedTransaction(
  '0x' + serializedTx, function(err, result) {
      if(err) {
          console.log(err);
          return err;
      } else {
          console.log(result);
          return result;
      }
  });
  res.send({ results })
})

app.listen(PORT, HOST)
console.log(`Running on http://${HOST}:${PORT}`)
