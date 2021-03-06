const fs = require('fs');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 8080;
const dbJson = require('db-json');

const notesData = require('./db/db.json');
let notesId = notesData.length;

app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'));
app.get('*', (req, res) => res.sendFile(__dirname + '/public/index.html'));
app.get('/notes', (req, res) => res.sendFile(__dirname + '/public/notes.html'));
app.delete('/api/notes/:id', (req, res) => {
  notesData.splice(req.params.id - 1, 1);
  console.log(notesData);
  writeToFile("./db/db.json", JSON.stringify(notesData));

  res.send(true);
});


app.get('/api/notes', (req, res) => {
  res.json(notesData);
  console.log(res);
});
app.post('/api/clear', (req, res) => {
  notesData.length = 0;
  writeToFile("./db/db.json", JSON.stringify(notesData));

  res.json({
    ok: true
  });
});

app.post('/api/notes', (req, res) => {
  console.log("in post");
  notesId += 1;
  let notesDataTemp = {};
  notesDataTemp = req.body;
  console.log(notesDataTemp.id + " notesDataTemp.id");
  if (notesDataTemp.id == null || notesDataTemp.id == undefined) {
    notesDataTemp.id = notesId;
    notesData.push(notesDataTemp);
  } else {
    for (const element of notesData) {
      if (element.id === req.body.id) {
        element.title = req.body.title;
        element.text = req.body.text;
      }
    }
  }
  console.log(notesDataTemp);
  console.log(notesData);
  res.json(true);
  writeToFile("./db/db.json", JSON.stringify(notesData));
});

function writeToFile(fileName, data) {
  fs.writeFile(fileName, data, (err) =>
    err ? console.error(err) : console.log('Readme logged!'));
}


app.listen(PORT, () => {
  console.log(`App listening on PORT: ${PORT}`);
});