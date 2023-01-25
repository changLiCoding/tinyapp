const express = require('express');
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');


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

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', (req, res) => {
  console.log('Cookies: ', req.cookies.username);

  res.send('Hello World!');
});


app.get('/register', (req, res) => {
  const templateVars = {username: req.cookies["username"]};
  res.render('urls_logForm', templateVars);
});
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  console.log(email, password);
  res.cookie('email', email).redirect('/urls');
});
app.post('/login', (req, res) => {
  const username = req.body.username;
  console.log(username);
  res.cookie('username', username).redirect('/urls');
});
app.post('/logout', (req, res) => {
  res.clearCookie('username').redirect('/urls');
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});
app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase, username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});

app.post('/urls', (req, res) => {
  const longURL = req.body.longURL;
  const id = randomIDGenerate(7);
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {username: req.cookies["username"]};
  res.render("urls_new", templateVars);
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
  const templateVars = {urls: urlDatabase, id: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies["username"]};
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
