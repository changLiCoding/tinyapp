const express = require('express');
const app = express();
const PORT = 8080;

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
  console.log(templateVars);
  res.render("urls_index", templateVars);
});

app.post('/urls', (req, res) => {
  //const longURL = req.body.longURL;
  console.log(req.body);
  res.send('OK');
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


app.get('/urls/:id', (req, res) => {
  const templateVars = {urls: urlDatabase, id: req.params.id, longURL: urlDatabase[req.params.id]};
  console.log(templateVars);
  res.render('urls_show', templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT,() => {
  console.log(`Now the server is on port: ${PORT}`);
});
