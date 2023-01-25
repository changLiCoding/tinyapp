const express = require('express');
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');



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
  'b2xVn2': {longURL: 'http://www.lighthouselabs.ca', shortURL: 'b2xVn2'},
  '9sm5xK': {longURL: 'http://www.google.com', shortURL: '9sm5xK'}
};
const randomIDGenerate = (numberOfChar) => {
  const template = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const results = [];
  for (let i = 0; i < numberOfChar; i++) {
    const randomIndex = Math.round(Math.random() * 62);
    results.push(template[randomIndex]);
  }
  return results.join('');
};

const findUserByEmail = (email) => {
  for (let id in users) {
    if (users[id].email === email) {
      return users[id];
    }
  }
  return null;
};

app.get('/', (req, res) => {

  res.send('Hello World!');
});

app.get('/register', (req, res) => {
  const userId = req.cookies["user_id"];
  const templateVars = {user: users[userId]};
  res.render('urls_logForm', templateVars);
});
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const passwordConfirm = req.body.passwordConfirm;
  const id = randomIDGenerate(12);
  if (findUserByEmail(email)) return res.status(400).send('Wrong email and password input');
  if (email === '' || password === '') {
    res.status(400).send('Wrong email and password input');
    return;
  } else if (password === passwordConfirm && password.length !== 0) {
    users[id] = {id, email, password};
    res.cookie('user_id', id);
  }
  console.log(email, password, passwordConfirm);
  console.log(users[id]);

  res.status(200).redirect('/urls');
});

app.get('/login', (req, res) => {
  let templateVars = {user: users[req.cookies["user_id"]]};
  res.status(200).render('urls_login', templateVars);
});
app.post('/login', (req, res) => {
  const password = req.body.password;
  const email = req.body.email;
  const user = findUserByEmail(email);
  if (user === null) {
    res.status(403).send('Email or password not mathch. Please try again. ');
    return;
  } else if (user.password !== password) {
    res.status(403).send('Email or password not mathch. Please try again. ');
    return;
  } else {
    res.status(200).cookie('user_id', user.id).redirect('/urls');
  }
});
app.post('/logout', (req, res) => {
  res.clearCookie('user_id').redirect('/login');
});

app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase, user: users[req.cookies["user_id"]]};
  res.render("urls_index", templateVars);
});

app.post('/urls', (req, res) => {
  const longURL = `http://${req.body.longURL}`;
  const id = randomIDGenerate(6);
  urlDatabase[id] = {};
  urlDatabase[id]['longURL'] = longURL;
  urlDatabase[id]['shortURL'] = id;
  res.redirect(`/urls/${id}`);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {user: users[req.cookies["user_id"]]};
  res.render("urls_new", templateVars);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get('/u/:id', (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;
  res.redirect(longURL);
});

app.post('/urls/:id/delete', (req, res) => {

  const id = req.params.id;

  delete urlDatabase[id];
  console.log(id);
  res.redirect('/urls');
});

app.get('/urls/:id', (req, res) => {
  const id = req.params.id;
  const templateVars = {urls: urlDatabase, id, longURL: urlDatabase[id].longURL, user: users[req.cookies["user_id"]]};
  res.render('urls_show', templateVars);
});

app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const newURL = `http://${req.body.longURL}`;
  urlDatabase[id].longURL = newURL;
  urlDatabase[id].shortURL = id;
  res.redirect(`/urls`);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT,() => {
  console.log(`Now the server is on port: ${PORT}`);
});
