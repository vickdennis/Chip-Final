const express = require('express');
const app = express();
app.use(express.json());
app.post('/', (req, res) => res.json({ok: 1}));

app.listen(3002, () => {
  fetch('http://localhost:3002/', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: '{"a":1'
  }).then(r => { console.log(r.status); return r.text() }).then(t => {
    console.log(t.slice(0, 100));
    process.exit(0);
  });
});
