'use strict'
const axios = require("axios");
const https = require("https");
const fs = require("fs")
require('dotenv/config');

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
        "chave": `${process.env.PIX_KEY}`,
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

module.exports = {getAuth, createCob, getQrCode}