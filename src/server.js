'use strict'
const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const api = require('./controllers/api.js')
const Purchases = require('./models/models.js')

require('dotenv/config');

const app = express()
app.use(bodyParser.json());
app.use(cors())

const port = process.env.EXPRESS_PORT

Purchases.createTable()

app.get('/', async (request, response) => {

  const token = await api.getAuth()
  const cob = await api.createCob(undefined, undefined, undefined, token)
  const qrcode = await api.getQrCode(token, cob.loc?.id)

  response.send(qrcode)
})

app.get('/purchases', (request, response) => {
  Purchases.select((error, purchases) => {
    if (error) {
      return response.status(500).json({ error: 'Internal Server Error' });
    }
    response.status(200).json(purchases);
  })
})

app.post('/purchases', (request, response) => {
  const { product, value } = request.query
  const purchase = new Purchases(null, product, value)

  Purchases.insert(purchase, (error, newPurchase) => {
    if (error) {
      return response.status(500).json({ error: 'Internal Server Error' });
    }
    response.status(201).json(newPurchase);
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})