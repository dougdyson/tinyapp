const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const alert = require("js-alert");

const notLoggedInErrMessage = 'You need to be logged in for that. Please login and try again!';


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
  console.log(`TinyApp listening on port ${PORT}!`);
});

app.get("/", (req, res) => {
  let user = gUsers[req.session.userID];
  let templateVars = { urls: gURLDatabase, user: user};

  if (user) {
    res.render("urls_index", templateVars);
  } else {
    res.render("login", templateVars);
  }
});

app.get("/register", (req, res) => {
  let templateVars = { user: gUsers[req.session.userID]};
  res.render("register", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = gUsers[req.session.userID]
  const templateVars = { user };
  if (!user) {
    res.status(400).send(notLoggedInErrMessage);
  }
  res.render("urls_new", templateVars);
});

app.get("/urls.json", (req, res) => {
  const user = gUsers[req.session.userID];
  if (user) {
    res.json(gURLDatabase);
  }
});

app.get("/urls", (req, res) => {
  
  const user = gUsers[req.session.userID];
  const userURLdb = helpers.getUserURLs(user, gURLDatabase);
  const templateVars = { urls: userURLdb, user: user};

  if (user) {
    res.render("urls_index", templateVars);
  } else {
    res.render("login", templateVars);
  }
});

app.get("/login", (req, res) => {
  const user = gUsers[req.session.userID];
  const templateVars = { urls: gURLDatabase, user};

  if (user) {
    return res.redirect("/urls");
  }

  res.render("login", templateVars);
});

app.post("/register", (req, res) => {
  
  //validate email and password are empty!!
  if (!req.body.email || !req.body.password) {
    return res.status(400).send('Email and/or password cannot be left blank. Please hit the back button and try again!');
  }
  //validate if email already exists
  if (helpers.emailExists(req.body.email)) {
    return res.status(400).send('Email address already exists. Please hit the back button and try again!');
  }
  
  if ((req.body.email !== '') && (req.body.email !== '')) {
    const user = helpers.addNewUser(req.body.email, req.body.password);
    req.session.userID = user.id;
  }
  
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const urlString = helpers.generateUniqueRandomString();
  const userid = req.session.userID;
  const longurl = req.body.longURL;

  if (longurl === '') {
    return res.status(400).send('WHOA! URL cannot be blank. Hit the back button and enter a URL.');
  }
  
  gURLDatabase[urlString] = {longURL: longurl, userID: gUsers[userid].id};
  
  if (userid) {
    res.redirect("/urls");
  } else {
    return res.status(400).send(notLoggedInErrMessage);
  }
});

app.post("/login", (req,res) => {
  const email = req.body.email;
  const password = req.body.password;

  //validate email and password are empty!!
  if (!req.body.email || !req.body.password) {
    return res.status(400).send('Email and/or password cannot be left blank. Please hit the back button and try again!');
  }
  
  if (helpers.checkIfUserExists(email, password)) {
    const user = helpers.getUserByEmail(email);
    req.session.userID = user.id;
    res.redirect("/urls");  
  } else {
    return res.status(400).send('Trouble logging in. Please hit the back button to try again or register for an account if you do not have one yet!');
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.post("/urls/:shortURL", (req, res) => {
  const userid = req.session.userID;
  if (userid) {
    gURLDatabase[req.params.shortURL] = {
      'longURL': req.body.longURL,
      'userID' : userid
    }
  }
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userid = req.session.userID;
  
  if (userid) {
    delete gURLDatabase[req.params.shortURL];
  }

  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: gURLDatabase[req.params.shortURL], 
    user: gUsers[req.session.userID] 
  };
  if (!user) {
    res.status(400).send(notLoggedInErrMessage);
  }
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  
  const externalURL = gURLDatabase[req.params.shortURL];

  if (externalURL) {
    res.redirect(externalURL.longURL);
  } else {
    return res.status(400).send('OH NO! TinyApp URL not found!');
  }
  
});

