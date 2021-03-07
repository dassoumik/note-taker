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


app.get('/notes', (req, res) => res.sendFile(__dirname + '/public/notes.html'));

app.delete('/api/notes/:id', (req, res) => {
  notesData.splice(req.params.id - 1, 1);
  writeToFile("./db/db.json", JSON.stringify(notesData));
  console.log(notesData);
  res.send(true);
});


app.get('/api/notes', (req, res) => {
  res.json(notesData);
});
app.post('/api/clear', (req, res) => {
  notesData.length = 0;
  writeToFile("./db/db.json", JSON.stringify(notesData));

  res.json({
    ok: true
  });
});

app.post('/api/notes', (req, res) => {
  notesId += 1;
  let notesDataTemp = {};
  notesDataTemp = req.body;
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
  res.json(true);
  writeToFile("./db/db.json", JSON.stringify(notesData));
});

app.get('/*', (req, res) => {
  // res.set('Content-Type', 'html');
  res.sendFile(path.join(__dirname, '../public/index.html'))
});


function writeToFile(fileName, data) {
  fs.writeFile(fileName, data, (err) =>
    err ? console.error(err) : console.log('JSON logged!'));
}


app.listen(PORT, () => {
  console.log(`App listening on PORT: ${PORT}`);
});