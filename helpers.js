const bcrypt = require('bcrypt');
const uuid = require('uuid');

function helpers(userDB, urlDB) {

  function generateUniqueRandomString() {
    const id = uuid.v4().split('-')[1];
    return id;
  }

  function addNewUser(email, password) {
    const userID = generateUniqueRandomString();
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    let newUser = {
      id        : userID,
      email     : email,
      password  : hashedPassword
    };
    
    userDB[userID] = newUser;

    return newUser;
  }

  function emailExists(email) {

    console.log('HELPERS emailExists userDB[key].email:', userDB[key].email);
    console.log('HELPERS emailExists email:', email);

    for (const key in userDB) {
      if (userDB[key].email === email) {
        console.log('HELPERS emailExists userDB[key].email === email: TRUE');
        return true;
      }
    }
    console.log('HELPERS emailExists userDB[key].email === email: FALSE');
    return false;
  }

  function getUserByEmail(email) {
    let user = {};
    
    for (const key in userDB) {
      if (userDB[key].email === email) {
        user = userDB[key];
      }
    }
    return user;
  }

  function checkIfUserExists(email, password) {
    
    if (emailExists(email)) {
      let user = getUserByEmail(email);
      const hashedPassword = user.password;
      if (bcrypt.compareSync(password, hashedPassword)) {
        return true;
      }
    }
    return false;
  }

  function emailExists(email) {

    for (const key in userDB) {
      if (userDB[key].email === email) {
        return true;
      }
    }
    return false;
  }

  function getURLSforUser(user, urlDB){

    if (!user) {
      return {};
    }
    
    let userURLdb = {};
    const userID = user.id;

    for (const shortURL in urlDB) {      
      if (urlDB[shortURL].userID === userID) {
        userURLdb[shortURL] = {longURL: urlDB[shortURL].longURL, userID: userID};
      }
    }
    
    return userURLdb;
  }

  return {
    generateUniqueRandomString,
    addNewUser,
    emailExists,
    getUserByEmail,
    checkIfUserExists,
    getURLSforUser,
  };
}

module.exports = helpers;

