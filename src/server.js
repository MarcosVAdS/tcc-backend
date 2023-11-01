'use strict'
const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const api = require('./controllers/api.js')

require('dotenv/config');

const app = express()
app.use(bodyParser.json());
app.use(cors())

const port = process.env.EXPRESS_PORT

app.get('/', async (request, response) => {
  const token = await api.getAuth()
  const cob = await api.createCob(undefined, undefined, undefined, token)

  const qrcode = await api.getQrCode(token, cob.loc?.id)

  response.send(qrcode)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})