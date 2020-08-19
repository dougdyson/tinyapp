const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

cookieParser = require('cookie-parser')
app.use(cookieParser())

const bcrypt = require('bcrypt');

const charArray = ['a', 'A', 'b', 'C', 'd', 'e', 'f', 'g', 'G', 'h', 'I', 'j', 'k', 'K', 'L', 'm', 'n', 'o', 'p', 'Q', 'r', 'R', 'S', 's', 't', 'u', 'v', 'Y', 'z',' Z', '1', '2', '3', '4', '5', '6', '7', '8', '9','10'];

let gUsers = {};


function generateRandomString(length, charArray){
  // currently no check for uniqueness!!!
  let randomString = '';
  for (let i = 0; i < length; i++) {
    randomString += charArray[Math.floor(Math.random() * charArray.length)];
  }
  return randomString;
}

function addNewUser (email, password) {
  const userID = generateRandomString(6, charArray)
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  let newUser = {
    id        : userID,
    email     : email,
    password  : hashedPassword
  };  
  
  gUsers[userID] = newUser;

  return newUser;
};

function emailExists(email){

  console.log('SOF emailExists:', email);

  for (const key in gUsers) {
    if (gUsers[key].email === email) {
      console.log('emailExists gUsers[key].email:', gUsers[key].email, 'email:', email);
      return true;
    }
  }
  return false;
}

function getUser(email){
  let user = {};

  for (const key in gUsers) {
    if (gUsers[key].email === email) {
      user = gUsers[key];
      console.log('getUser:', user);
    }
  }
  return user;
}

function loginUser (email, password) {
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (emailExists(email)){
    if (bcrypt.compareSync(password, hashedPassword)) {
      console.log('loginUser: true');
      return true;
    }
  }
}

function emailExists(email){

  for (const key in gUsers) {
    if (gUsers[key].email === email) {
        return true;
    }
  }
  return false;
}


const urlDatabase = {};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});

app.get("/hello", (req, res) => {
  let templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

app.get("/register", (req, res) => {
  let templateVars = { user: gUsers[req.cookies.userID]};
  res.render("register", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { user: gUsers[req.cookies.userID] };
  res.render("urls_new", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let user = gUsers[req.cookies.userID]
  let templateVars = { urls: urlDatabase, user: user};
  console.log("/urls req.cookies.id", req.cookies.userID);
  console.log("/urls templateVars:", templateVars);
  if (user) {
    res.render("urls_index", templateVars);
  } else {
    res.render("error");
  }
});

app.get("/login", (req, res) => {
  let templateVars = { urls: urlDatabase, user: gUsers[req.cookies.userID]};
  console.log("/login templateVars:", templateVars);
  res.render("login", templateVars);
});

app.post("/register", (req, res) => {
  
  //validate email and password are empty
  if (!req.body.email || !req.body.password ){
    throw 400;
  }
  //validate if email already exists
  if (emailExists(req.body.email)){
    throw 400;
  }

  let user = addNewUser(req.body.email, req.body.password)
  
  res.cookie('userID', user.id);
  res.redirect("/urls"); // need to make this the userID.
});

app.post("/urls", (req, res) => {
  console.log('/urls req.body', req.body);  // Log the POST request body to the // console
  const urlString = generateRandomString(6, charArray);
  const userid = req.cookies.userID;
  console.log('/urls userid', userid);
  longurl = req.body.longURL
  urlDatabase[urlString] = {longURL: longurl, userID: gUsers[userid].id};
  console.log('userid:', userid,'urlDatabase[urlString]', urlDatabase[urlString]);
  //if (userid) {
    res.redirect("/urls");// + urlString);
  //} 
  // else {
  //   res.redirect("/error");
  // }
});

app.post("/login", (req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  console.log('SOF /login email:', email, 'password:', password);

  if (loginUser (email, password)) {
    user = getUser(email);x
    res.cookie('userID', user.id);
    res.redirect("/urls");
  } else {
    throw 400;
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('userID');
  res.redirect("/login");
});

app.post("/urls/:shortURL", (req, res) => {
  // // console.log('Update! ' + req.params.longURL);
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  // // console.log('Delete! ' + req.params.shortURL);
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: gUsers[req.cookies.userID] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

