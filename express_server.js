const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

cookieParser = require('cookie-parser')
app.use(cookieParser())

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

  // Need to add if email or password are empty, return HTML with a relevant error message
  // Happy Path for now!
  // Just discovered this is addressed in a later exercise!!

  console.log('userID' , userID, 'email:', email, 'password', password);
  
  let newUser = {
    id        : userID,
    email     : email,
    password  : password
  };

  console.log('newUser', newUser);
  
  gUsers[userID] = newUser;

  console.log('gUsers:', gUsers);

  return newUser;
};


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
  let templateVars = { username: req.cookies.id };
  res.render("register", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies.id };
  res.render("urls_new", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies.id};
  console.log("/urls req.cookies.id", req.cookies.id);
  res.render("urls_index", templateVars);
});

app.post("/register", (req, res) => {
  console.log('/register', req.body);  // Log the POST request body to the console
  let user = addNewUser(req.body.email, req.body.password)
  console.log('user', user);
  console.log('cookie username:', user.id);
  res.cookie('userID', user.id);
  res.redirect("/urls"); // need to make this the userID.
});

app.post("/urls", (req, res) => {
  console.log('/urls', req.body);  // Log the POST request body to the console
  const urlString = generateRandomString(6, charArray);
  urlDatabase[urlString] = req.body.longURL;
  res.redirect("/urls/" + urlString);
});

app.post("/login", (req,res) => {
  let id = req.body.id
  console.log('cookie id:', id);
  res.cookie('username', id);
  res.redirect("/urls");
});

app.post("/logout", (req,res) => {
  let userName = req.cookie.id
  console.log('Logout selected:', id);
  res.clearCookie('username', id);
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  console.log('Update! ' + req.params.longURL);
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log('Delete! ' + req.params.shortURL);
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], id: req.cookies.username };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

