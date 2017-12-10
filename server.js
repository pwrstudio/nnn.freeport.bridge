const express = require('express')
const bodyParser = require('body-parser')

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
  getContent()
    .then(transformContent)
    .then(publishContent)
    .then(writeIndex)
    .then(status => {
      res.send(status).end()
    })
    .catch(console.log)
})

app.use('/', router)
app.listen(PORT)
console.log('NNN.FREEPORT.BRIDGE started... port: ' + PORT)
