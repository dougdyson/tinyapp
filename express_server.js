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

// seeds for generateRandomString and userID in addNewUser.
const charArray = ['a', 'A', 'b', 'C', 'd', 'e', 'f', 'g', 'G', 'h', 'I', 'j', 'k', 'K', 'L', 'm', 'n', 'o', 'p', 'Q', 'r', 'R', 'S', 's', 't', 'u', 'v', 'Y', 'z',' Z', '1', '2', '3', '4', '5', '6', '7', '8', '9','10'];

const helpers = require('./helpers')(gUsers, gURLDatabase);

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
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
  let user = gUsers[req.session.userID];
  let templateVars = { urls: gURLDatabase, user: user};
  console.log("/urls req.session.id:", req.session.userID, 'templateVars:', templateVars);
  // console.log("/urls templateVars:", templateVars);
  if (user) {
    res.render("urls_index", templateVars);
  } else {
    res.render("/login", templateVars);
  }
});

app.get("/login", (req, res) => {
  let templateVars = { urls: gURLDatabase, user: gUsers[req.session.userID]};
  // console.log("/login templateVars:", templateVars);
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

  let user = helpers.addNewUser(req.body.email, req.body.password);
  
  //res.cookie('userID', user.id);
  req.session.userID = user.id;
  res.redirect("/urls"); // need to make this the userID.
});

app.post("/urls", (req, res) => {
  // console.log('/urls req.body', req.body);  // Log the POST request body to the // console
  const urlString = helpers.generateRandomString(6, charArray);
  const userid = req.session.userID;
  // console.log('/urls userid', userid);
  const longurl = req.body.longURL;
  gURLDatabase[urlString] = {longURL: longurl, userID: gUsers[userid].id};
  console.log('userid:', userid,'gURLDatabase[urlString]', gURLDatabase[urlString]);
  if (userid) {
    res.redirect("/urls");// + urlString);
  } else {
    res.redirect("/error");
  }
});

app.post("/login", (req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  // console.log('SOF /login email:', email, 'password:', password);

  if (helpers.checkIfUserExists(email, password)) {
    // console.log('/login checkIfUserExists = true');
    const user = helpers.getUserByEmail(email);
    //res.cookie('userID', user.id);
    req.session.userID = user.id;
    res.redirect("/urls");
  } else {
    throw 400;
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  // console.log('/logout');
  res.redirect("/login");
});

app.post("/urls/:shortURL", (req, res) => {
  // // console.log('Update! ' + req.params.longURL);
  gURLDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log('Delete! ' + req.params.shortURL);
  delete gURLDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: gURLDatabase[req.params.shortURL], user: gUsers[req.session.userID] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = gURLDatabase[req.params.shortURL];
  res.redirect(longURL);
});

