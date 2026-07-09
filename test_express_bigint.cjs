const express = require('express');
const request = require('supertest');

const app = express();
app.get('/test', (req, res) => {
  res.json({ id: 1n }); // BigInt
});

request(app)
  .get('/test')
  .end((err, res) => {
    console.log("Status:", res.status);
    console.log("Type:", res.type);
    console.log("Text:", res.text.slice(0, 100));
  });
