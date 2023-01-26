const express = require('express');
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');

const bcrypt = require('bcryptjs');

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
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
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
const findURLByUserId = (id) => {
  const res = {};
  for (let idOfURL in urlDatabase) {
    if (urlDatabase[idOfURL].userID === id) {
      res[idOfURL] = urlDatabase[idOfURL];
    }
  }
  return res;
};

app.get('/', (req, res) => {

  res.send('Hello World!');
});

app.get('/register', (req, res) => {
  if (req.cookies.user_id) {
    res.redirect('/urls');
    return;
  }
  const userId = req.cookies["user_id"];
  const templateVars = {user: users[userId]};
  res.render('urls_logForm', templateVars);
});
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const passwordConfirm = req.body.passwordConfirm;
  const id = randomIDGenerate(12);
  if (findUserByEmail(email)) return res.status(400).send('The email is not valid. ');
  if (email === '' || password === '') {
    const templateVars = {msg: 'Wrong email and password input', user: null};
    res.status(400).render('urls_errorHandle.ejs', templateVars);
    return;
  } else if (password === passwordConfirm && password.length !== 0) {
    const hashedPass = bcrypt.hashSync(password, 10);
    users[id] = {id, email, password: hashedPass};
    res.cookie('user_id', id);
  }

  res.status(200).redirect('/urls');
});

app.get('/login', (req, res) => {
  if (req.cookies.user_id) {
    res.redirect('/urls');
    return;
  }
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
  } else if (!bcrypt.compareSync(password, user.password)) {
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
  if (!req.cookies.user_id) {
    const templateVars = {msg: 'Sorry you are not sign in yet. ', user: null};
    res.status(400).render('urls_errorHandle.ejs', templateVars);
    return;
  }
  const user = users[req.cookies["user_id"]];
  const urls = findURLByUserId(req.cookies["user_id"]);
  const templateVars = {urls, user};
  res.render("urls_index", templateVars);
});

app.post('/urls', (req, res) => {
  if (req.cookies.user_id) {
    const longURL = `http://${req.body.longURL}`;
    const id = randomIDGenerate(6);
    urlDatabase[id] = {};
    urlDatabase[id]['longURL'] = longURL;
    urlDatabase[id]['userID'] = req.cookies.user_id;
    res.redirect(`/urls/${id}`);
    return;
  } else {
    res.send('<html><h2>Sorry only login user gets privileges of creating new short URL</h2></html>');
  }
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies.user_id) {
    res.redirect('/login');
    return;
  }
  const templateVars = {user: users[req.cookies["user_id"]]};
  res.render("urls_new", templateVars);
});


app.get("/urls.json", (req, res) => {
  res.json({...urlDatabase, ...users});
});


app.get('/u/:id', (req, res) => {
  const id = req.params.id;
  if (!urlDatabase[id]) {
    res.send('<html><h2>Sorry no relevent ID was found in our database. </h2></html>');
    return;
  }
  const longURL = urlDatabase[id].longURL;
  res.redirect(longURL);
});

app.post('/urls/:id/delete', (req, res) => {

  const id = req.params.id;
  const userID = req.cookies.user_id;
  if (!urlDatabase[id]) {
    res.send('<html><h2>Sorry can not find this URL with the ID. </h2></html>');
    return;
  } else if (!userID) {
    res.redirect('/login');
    return;
  } else if (userID !== urlDatabase[id].userID) {
    res.send('<html><h2>Sorry you have no permision of changing the URL. </h2></html>');
    return;
  }
  delete urlDatabase[id];
  res.redirect('/urls');
});

app.get('/urls/:id', (req, res) => {
  const userId = req.cookies.user_id;
  const id = req.params.id;
  if (!urlDatabase[id]) {
    res.send('<html><h2>Sorry can not find this URL with the ID. </h2></html>');
    return;
  }
  if (!userId) {
    res.send('<html><h2>Sorry only login user gets privileges of reviewing short URLs</h2></html>');
    return;
  } else if (urlDatabase[id].userID !== userId) {
    res.send('<html><h2>Sorry you are not the owner of this URL</h2></html>');
    return;
  }
  const templateVars = { id, longURL: urlDatabase[id].longURL, user: users[userId]};
  res.render('urls_show', templateVars);
});

app.post('/urls/:id', (req, res) => {
  const userID = req.cookies.user_id;
  const id = req.params.id;
  if (!urlDatabase[id]) {
    res.send('<html><h2>Sorry can not find this URL with the ID. </h2></html>');
    return;
  } else if (!userID) {
    res.redirect('/login');
    return;
  } else if (userID !== urlDatabase[id].userID) {
    res.send('<html><h2>Sorry you have no permision of changing the URL. </h2></html>');
    return;
  }
  const newURL = `http://${req.body.longURL}`;
  urlDatabase[id].userID = userID;
  urlDatabase[id].longURL = newURL;
  res.redirect(`/urls`);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT,() => {
  console.log(`Now the server is on port: ${PORT}`);
});
