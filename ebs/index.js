'use strict';

const express = require('express');
const app = express();
const cors = require('cors');
const port = 3000;

app.use(cors());

app.use(express.json());

app.get('/', function (req, res) {
  res.send('hello world')
})

app.listen(port, function() {
  console.log(`CORS-enabled web server listening on port ${port}`);
});