const express = require('express')
const bodyParser = require('body-parser')

const Raven = require('raven')
Raven.config(
  'https://7a2a4565ac0741498a4e9b19e7b210a3:b3ec581ea9214f5b8a1a80be4677ee27@sentry.io/271695'
).install()

const colors = require('colors')

const getContent = require('./get_content.js')
const transformContent = require('./transform_content.js')
const publishContent = require('./publish_content.js')
const writeIndex = require('./write_index.js')

const PORT = process.env.PORT || 5000
const app = express()

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

const router = express.Router()

router.post('/publish', (req, res) => {
  console.log('⇨ Webhook call received, starting update...'.blue)
  getContent()
    .then(transformContent)
    .then(publishContent)
    .then(writeIndex)
    .then(status => {
      res.send(status).end()
    })
    .catch(err => {
      console.log('main server promiserejection'.red, err)
    })
})

app.use('/', router)
app.listen(PORT)
console.log('NNN.FREEPORT.BRIDGE started... port:'.inverse, String(PORT).inverse)
