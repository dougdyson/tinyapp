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
  let templateVars = { user: gUsers[req.session.userID] };
  res.render("urls_new", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(gURLDatabase);
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
  let templateVars = { urls: gURLDatabase, user: gUsers[req.session.userID]};
  res.render("login", templateVars);
});

app.post("/register", (req, res) => {
  
  //validate email and password are empty!!
  if (!req.body.email || !req.body.password) {
    throw 400;
  }
  //validate if email already exists
  if (helpers.emailExists(req.body.email)) {
    throw 400;
  }

  const user = helpers.addNewUser(req.body.email, req.body.password);
  
  req.session.userID = user.id;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const urlString = helpers.generateUniqueRandomString();
  const userid = req.session.userID;
  const longurl = req.body.longURL;
  
  gURLDatabase[urlString] = {longURL: longurl, userID: gUsers[userid].id};
  
  if (userid) {
    res.redirect("/urls");
  } else {
    res.redirect("/error");
  }
});

app.post("/login", (req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  if (helpers.checkIfUserExists(email, password)) {
    const user = helpers.getUserByEmail(email);
    req.session.userID = user.id;
    res.redirect("/urls");
  } else {
    alert('Your userid or password in incorrect. Please try again');
    res.redirect("/login");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.post("/urls/:shortURL", (req, res) => {
  const userid = req.session.userID;
  gURLDatabase[req.params.shortURL] = {
    'longURL': req.body.longURL,
    'userID' : userid
  }
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete gURLDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: gURLDatabase[req.params.shortURL], 
    user: gUsers[req.session.userID] 
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  
  const externalURL = gURLDatabase[req.params.shortURL];
  
  res.redirect(externalURL.longURL);
});

