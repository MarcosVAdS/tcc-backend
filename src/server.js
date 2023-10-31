'use strict'
const https = require("https");
const axios = require("axios");
const fs = require("fs");
const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');

require('dotenv/config');

const app = express()
app.use(bodyParser.json());
app.use(cors())

const port = process.env.EXPRESS_PORT

// Insira o caminho de seu certificado .p12 dentro de seu projeto
var certificado = fs.readFileSync(process.env.HOMOLOG_CERT);

// Insira os valores de suas credenciais em desenvolvimento do pix
var credenciais = {
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.SECRET_ID,
};

var data = JSON.stringify({ grant_type: "client_credentials" });
var data_credentials = credenciais.client_id + ":" + credenciais.client_secret;

// Codificando as credenciais em base64
var auth = Buffer.from(data_credentials).toString("base64");

const agent = new https.Agent({
  pfx: certificado,
  passphrase: "",
});
// Consumo em desenvolvimento da rota post oauth/token
var config = {
  headers: {
    Authorization: "Basic " + auth,
    "Content-Type": "application/json",
  },
  httpsAgent: agent,
};

app.get('/', async (request, response) => {
  const token = await getAuth()
  const cob = await createCob(undefined, undefined, undefined, token)

  const qrcode = await getQrCode(token, cob.loc?.id)
  response.send(qrcode)
})

app.get('/teste', (request, response) => {
  response.json({
    "teste": "olá" 
  })
})

function getAuth() {
  config = {...config, ...{
    method: "POST",
    url: `${process.env.HOMOLOG_BASE_ROUTE}` + "/oauth/token",
    data: data,
  }}

  return axios(config)
    .then(function(res) {
      return res.data?.access_token 
    })
    .catch(function (error) {
      console.log(error)
  })
}

function createCob(expiration = 10000, value = "1.00", description = "Café", token){
  config = { 
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    httpsAgent: agent,
    method: "POST",
    url: `${process.env.HOMOLOG_BASE_ROUTE}` + "/v2/cob",
    data: {
      "calendario": {
        "expiracao": expiration
      },
      "valor": {
        "original": `${value}`
      },
      "chave": "ccb89a63-285e-4ebc-88d2-c58fe90364e4",
      "solicitacaoPagador": `${description}`
    }
  }

  return axios(config).then((res) => {
    return res.data
  }).catch((error) => {
    console.log(error);
  })
}

function getQrCode(token, id){
  config = { 
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    httpsAgent: agent,
    method: "GET",
    url: `${process.env.HOMOLOG_BASE_ROUTE}/v2/loc/${id}/qrcode`,
  }

  return axios(config).then((res) => {
    return res.data
  }).catch((error) => {
    console.log(error)
  })
}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})