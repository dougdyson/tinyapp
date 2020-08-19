const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1','key2'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

let gUsers = {};
let gURLDatabase = {};

// seeds for generateRandomString and userID in addNewUser 
const charArray = ['a', 'A', 'b', 'C', 'd', 'e', 'f', 'g', 'G', 'h', 'I', 'j', 'k', 'K', 'L', 'm', 'n', 'o', 'p', 'Q', 'r', 'R', 'S', 's', 't', 'u', 'v', 'Y', 'z',' Z', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

// should move these functions out to a helper file
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

  // console.log('SOF emailExists:', email);

  for (const key in gUsers) {
    if (gUsers[key].email === email) {
      // console.log('emailExists gUsers[key].email:', gUsers[key].email, 'email:', email);
      return true;
    }
  }
  return false;
}
function getUserByEmail(email){
  let user = {};
  let database = {};

  for (const key in gUsers) {
    if (gUsers[key].email === email) {
      user = gUsers[key];
      database = getUsersURLDatabase(user.id);
    }
  }
  return user;
}
function checkIfUserExists (email, password) {
  //const hashedPassword = bcrypt.hashSync(password, 10);
  if (emailExists(email)){
    user = getUserByEmail(email);
    const hashedPassword = user.password;
    // console.log('checkIfUserExists emailExists: true');
    if (bcrypt.compareSync(password, hashedPassword)) {
      // console.log('checkIfUserExists password compare: true');
      return true;
    }
    // console.log('checkIfUserExists password compare: false');
  }
  return false;
}
function emailExists(email){

  for (const key in gUsers) {
    if (gUsers[key].email === email) {
        return true;
    }
  }
  return false;
}
function getUsersURLDatabase (userid){
  let database = {};
  console.log('SOF getUsersURLDatabase userid:', userid);
  console.log('===========================');
  if (gURLDatabase) {
    for (const key in gURLDatabase) {
      if (gURLDatabase[key].userID === userid){
        console.log('getUsersURLDatabase gURLDatabase[key].userID:', gURLDatabase[key].userID, 'userid:', userid);
        const longURL = gURLDatabase[key].longURL
        const shortURL = key;
        console.log('getUsersURLDatabase shortURL key:', shortURL, 'longURL:', longURL);
        if (database) {
          database = {shortURL, longURL};
        } else {
          database = dataURL;
        }
      }
    }
  }
  console.log('EOF database', database);
  return database;
}

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});

// app.get("/", (req, res) => {
//   const templateVars = { user: gUsers[req.session.userID]};
//   if (templateVars) {
//     res.redirect("/urls");
//   } else {
//     res.redirect("/login");
//   }
// });

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
  let user = gUsers[req.session.userID]
  let userDatabase = getUsersURLDatabase(user.id);
  console.log('/urls userDatabase', userDatabase);
  let templateVars = { urls: userDatabase, user: user};
  console.log("/urls req.session.id:", user.id, 'templateVars:', templateVars);
  console.log("/urls templateVars:", templateVars);
  if (user) {
    res.render("urls_index", templateVars);
  } else {
    res.render("/login", templateVars);
  }
});

app.get("/login", (req, res) => {
  const userID = gUsers[req.session.userID];
  const userDatabase = getUsersURLDatabase(userID);
  let templateVars = { urls: userDatabase, user: userID};
  // console.log("/login templateVars:", templateVars);
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
  
  //res.cookie('userID', user.id);
  req.session.userID = user.id;
  res.redirect("/urls"); // need to make this the userID.
});

app.post("/urls", (req, res) => {
  //console.log('/urls req.body', req.body);  // Log the POST request body to the console
  const urlString = generateRandomString(6, charArray);
  const userid = req.session.userID;
  console.log('/urls urlString:', urlString, 'userid:', userid);
  longurl = req.body.longURL;
  gURLDatabase[urlString] = {longURL: longurl, userID: userid};
  console.log('POST /urls urlString:', urlString, 'userid:', userid,'gURLDatabase[urlString]:', gURLDatabase[urlString]);
  if (userid) {
    res.redirect("/urls");// + urlString);
  } 
  else {
    res.redirect("/error");
  }
});

app.post("/login", (req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  // console.log('SOF /login email:', email, 'password:', password);

  if (checkIfUserExists (email, password)) {
    // console.log('/login checkIfUserExists = true');
    user = getUserByEmail(email);
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
  // // console.log('Delete! ' + req.params.shortURL);
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

