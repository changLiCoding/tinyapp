const express = require('express');
const app = express();
const PORT = 8080;

const randomIDGenerate = (numberOfChar) => {
  const template = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const results = [];
  for (let i = 0; i < numberOfChar; i++) {
    const randomIndex = Math.round(Math.random() * 62);
    results.push(template[randomIndex]);
  }
  return results.join('');
};

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});
app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
});

app.post('/urls', (req, res) => {
  const longURL = req.body.longURL;
  const id = randomIDGenerate(7);
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//app.get('/urls', (req, res) => {
//  const varibleVars = {...urlDatabase};
//  res.render('urls_index', varibleVars);
//});
app.get('/u/:id', (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});

app.post('/urls/:id/delete', (req, res) => {

  const id = req.params.id;
  console.log(urlDatabase[id]);
  console.log(urlDatabase);
  delete urlDatabase[id];
  console.log(id);
  res.redirect('/urls');
});

app.get('/urls/:id', (req, res) => {
  const templateVars = {urls: urlDatabase, id: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render('urls_show', templateVars);
});

app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const newURL = `http://${req.body.longURL}`;
  console.log(id, newURL);
  urlDatabase[id] = newURL;
  res.redirect(`/urls`);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT,() => {
  console.log(`Now the server is on port: ${PORT}`);
});
