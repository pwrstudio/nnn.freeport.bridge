const express = require('express')
const bodyParser = require('body-parser')
const colors = require('colors')

// const Raven = require('raven')
// Raven.config(
//   'https://7a2a4565ac0741498a4e9b19e7b210a3:b3ec581ea9214f5b8a1a80be4677ee27@sentry.io/271695'
// ).install()

const getContent = require('./get_content.js')
const about = require('./transform/about.js')
const transformFiles = require('./transform/files.js')
const transformContent = require('./transform/content.js')
const transformWorks = require('./transform/works.js')
const transformExhibitions = require('./transform/exhibitions.js')
const writeRootHash = require('./write_root_hash.js')
const writeIndex = require('./write_index.js')

const PORT = process.env.PORT || 5000
const app = express()

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

const router = express.Router()

router.post('/publish', (req, res) => {
  console.time('run')
  console.log('⇨ Webhook call received, starting update...'.blue)

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
    .then(status => {
      console.log(status)
      console.timeEnd('run')
    })
    .catch(err => {
      console.log('main server promise rejection'.red, err)
    })
})

app.use('/', router)
app.listen(PORT)
console.log('NNN.FREEPORT.BRIDGE started... port:'.inverse, String(PORT).inverse)
