const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1','key2'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

let gUsers = {"userRandomID": {
  id: "userRandomID",
  email: "user@example.com",
  password: "purple-monkey-dinosaur"
},
"user2RandomID": {
  id: "user2RandomID",
  email: "user2@example.com",
  password: "dishwasher-funk"
}};

let gURLDatabase = {};

const helpers = require('./helpers')(gUsers, gURLDatabase);

app.listen(PORT, () => {
  const serverStartTimestamp = new Date;
  const date = ("0" + serverStartTimestamp.getDate()).slice(-2);
  const month = ("0" + (serverStartTimestamp.getMonth() + 1)).slice(-2);
  const year = serverStartTimestamp.getFullYear();
  const hours = serverStartTimestamp.getHours();
  const minutes = serverStartTimestamp.getMinutes();
  const seconds = serverStartTimestamp.getSeconds();
  const serverStartedAt = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
  console.log('TinyApp server started at ' + serverStartedAt);
  console.log(`TinyApp listening on port ${PORT}!`);
});

app.get("/login", (req, res) => {
  const userID = req.session.userID;
  const user = gUsers[userID];
  const urls = helpers.getURLSforUser(user, gURLDatabase);
  const templateVars = { urls, user };

  if (user) {
    res.render("urls_index", templateVars);
  } else {
    res.render("login", templateVars);
  }
});

app.get("/", (req, res) => {
  const userID = req.session.userID;
  const user = gUsers[userID];
  const urls = helpers.getURLSforUser(user, gURLDatabase);
  const templateVars = { urls, user};

  if (user) {
    res.render("urls_index", templateVars);
  } else {
    res.render("login", templateVars);
  }
});

app.get("/register", (req, res) => {
  
  const userID = req.session.userID;
  const user = gUsers[userID];
  const urls = helpers.getURLSforUser(user, gURLDatabase);
  const templateVars = { urls, user};

  // MENTOR QUESTION: rendering vs redirecting to route
  // Below code renders HTML but the browser URL does not change accordingly
  // WHen I attempt redirecting, app hangs
  if (userID) {
    res.render("urls_index", templateVars);
  } else {
    res.render("register", templateVars);
  }
});

app.get("/urls/new", (req, res) => {

  const user = gUsers[req.session.userID];
  if (!user) {
    res.status(400).send('Requires login.');
  }
  
  const templateVars = { user };
  
  res.render("urls_new", templateVars);
});

app.get("/urls.json", (req, res) => {
  const user = gUsers[req.session.userID];
  if (user) {
    res.json(gURLDatabase);
  }
});

app.get("/urls", (req, res) => {
  
  const userID = req.session.userID;
  const user = gUsers[userID];
  const urls = helpers.getURLSforUser(user, gURLDatabase);
  const templateVars = { urls, user };

  if (user) {
    res.render("urls_index", templateVars);
  } else {
    res.render("login", templateVars);
  }
});

app.post("/register", (req, res) => {

  const email = req.body.email;
  const password = req.body.password;
  
  //validate email and password are empty
  if (!email || !password) {
    return res.status(400).send('Email and/or password cannot be left blank.');
  }
  //validate if email already exists
  if (helpers.checkEmailExists(email)) {
    return res.status(400).send('Email address already exists.');
  }
  
  const newUser = helpers.addNewUser(email, password);
  gUsers[newUser.id] = newUser;
  req.session.userID = newUser.id;
  
  res.redirect("/urls");
});

app.post("/login", (req,res) => {
  
  const email = req.body.email;
  const password = req.body.password;

  //validate email and password are not empty
  if (!email || !password) {
    return res.status(400).send('Email and/or password cannot be left blank.');
  }
  
  if (helpers.checkIfUserExists(email, password)) {
    const user = helpers.getUserByEmail(email);
    req.session.userID = user.id;
    res.redirect("/urls");
  } else {
    return res.status(400).send('Trouble logging in. Please try again or register for an account if you do not have one yet!');
  }
});

app.post("/urls", (req, res) => {
  
  const userID = req.session.userID;
  if (!userID) {
    return res.status(400).send('Requires login.');
  }
  const longURL = req.body.longURL;
  if (longURL === '') {
    return res.status(400).send('WHOA! URL cannot be blank.');
  }
  
  const shortURL = helpers.generateUniqueRandomString();
  
  gURLDatabase[shortURL] = {longURL, userID};

  res.redirect("/urls/" + shortURL);
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.post("/urls/:shortURL", (req, res) => {
  
  const shortURL = req.params.shortURL;
  if (!shortURL) {
    return res.status(400).send('Invalid url code');
  }

  const record = gURLDatabase[shortURL];
  if (!record) {
    return res.status(400).send('Invalid record');
  }
  
  const userID = req.session.userID;
  if (!userID) {
    return res.status(400).send('Requires login.');
  }

  if (record.userID !== userID) {
    return res.status(400).send('Invalid access');
  }
  
  const longURL = req.body.longURL;
  if (!longURL) {
    return res.status(400).send('No url found!');
  }

  record.longURL = longURL;
  
  res.redirect("/urls");
});

app.get("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.userID;
  const user = gUsers[userID];
  const shortURL = req.params.shortURL;
  const urls = helpers.getURLSforUser(user, gURLDatabase);
  const templateVars = { urls, user };

  console.log('SERVER GET /urls/:shortURL/delete user:', user);
  
  const urlRecord = urls[shortURL];
  console.log('SERVER GET /urls/:shortURL/delete urlRecord:', urlRecord);
  if (helpers.checkUserIsURLOwner(user, urlRecord)) {
    res.render("urls_index", templateVars);
  } else {
    return res.status(400).send('Invalid access');
  }

});

app.post("/urls/:shortURL/delete", (req, res) => {
  
  const userID = req.session.userID;
  if (!userID) {
    return res.status(400).send('Invalid user');
  }

  const shortURL = req.params.shortURL;
  if (!shortURL) {
    return res.status(400).send('Invalid short URL');
  }

  const record = gURLDatabase[shortURL];
  if (!record) {
    return res.status(400).send('No url found');
  }

  if (record.userID !== userID) {
    return res.status(400).send('Invalid access');
  }

  delete gURLDatabase[shortURL];
  
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
  
  const userID = req.session.userID;
  if (!userID) {
    return res.redirect("/urls");
  }

  const shortURL = req.params.shortURL;
  if (!shortURL) {
    return res.status(400).send('Invalid short URL');
  }

  const record = gURLDatabase[shortURL];
  if (!record) {
    return res.status(400).send('Invalid short URL');
  }

  const user = gUsers[req.session.userID];
  if (record.userID !== user.id) {
    return res.status(400).send('Invalid access');
  }

  const longURL = record.longURL;

  const templateVars = { shortURL, longURL, user };

  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  
  const urlRecord = gURLDatabase[req.params.shortURL];
  const externalURL = urlRecord;

  if (externalURL) {
    res.redirect(externalURL.longURL);
  } else {
    return res.status(400).send('OH NO! TinyApp URL not found for ' + externalURL);
  }
  
});

