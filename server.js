const express = require('express')
const bodyParser = require('body-parser')
const PORT = 80
const app = express()

const getContent = require('./get_content.js')
const about = require('./transform/about.js')
const transformFiles = require('./transform/files.js')
const transformContent = require('./transform/content.js')
const transformWorks = require('./transform/works.js')
const transformExhibitions = require('./transform/exhibitions.js')
const writeRootHash = require('./write_root_hash.js')
const writeIndex = require('./write_index.js')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const router = express.Router()

router.post('/test', (req, res) => {
  console.log('test connection')
  res.sendStatus(200).end()

})

router.post('/', (req, res) => {
  console.log('⇨ Webhook call received, starting update...')

  // Send 200
  res.sendStatus(200).end()

  getContent()
    .then(about)
    .then(transformFiles)
    .then(transformContent)
    .then(transformWorks)
    .then(transformExhibitions)
    .then(writeRootHash)
    .then(writeIndex)
    .then(status =>
      console.log(status)
    )
    .catch(err => {
      console.log('main server promise rejection', err)
    })
})

app.use('/', router)
app.listen(PORT)
console.log('NNN.FREEPORT.BRIDGE started... port:', PORT)
