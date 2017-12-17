const Web3 = require('web3')
const Tx = require('ethereumjs-tx')

const web3 = new Web3()
web3.setProvider(new web3.providers.HttpProvider('https://rinkeby.infura.io/35d16cN6cJHiZGlnWfZ2'))

const CONTRACT_ADDRESS = '0x737A4FA0eDBcc8c29d74cd2cebA315314E2C608A'

const abi = [
  {
    constant: false,
    inputs: [
      {
        name: 'x',
        type: 'string'
      }
    ],
    name: 'set',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'get',
    outputs: [
      {
        name: 'x',
        type: 'string'
      }
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  }
]

const rootContract = new web3.eth.Contract(abi, CONTRACT_ADDRESS)

const addressFrom = '0x25A885aFBACd312042F8cB7Af4e7D6BbDCDA13D6'
const privKey = '7cba3c2876d2c21a47fdf7e28e444f6c64bd7eefb402b32f00d7269f3ca77ded'

const addressTo = CONTRACT_ADDRESS

function sendSigned(txData, cb) {
  const privateKey = new Buffer(privKey, 'hex')
  const transaction = new Tx(txData)
  transaction.sign(privateKey)
  const serializedTx = transaction.serialize().toString('hex')
  web3.eth.sendSignedTransaction('0x' + serializedTx, cb)
}

module.exports = rootHash => {
  return new Promise((resolve, reject) => {
    web3.eth.getTransactionCount(addressFrom).then(txCount => {
      console.log('Root hash:', rootHash)
      const txData = {
        nonce: web3.utils.toHex(txCount),
        gasLimit: web3.utils.toHex(750000),
        gasPrice: web3.utils.toHex(10e9), // 10 Gwei
        to: addressTo,
        from: addressFrom,
        value: web3.utils.toHex(web3.utils.toWei('0', 'ether')),
        data: rootContract.methods.set(rootHash).encodeABI()
      }
      // send
      sendSigned(txData, function(err, result) {
        if (err) {
          return console.log('error', err)
        }
        console.log('sent', result)
        resolve('200')
      })
    })
  })
}
