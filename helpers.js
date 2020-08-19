const bcrypt = require('bcrypt');

function helpers(userDB, urlDB){

  const charArray = ['a', 'A', 'b', 'C', 'd', 'e', 'f', 'g', 'G', 'h', 'I', 'j', 'k', 'K', 'L', 'm', 'n', 'o', 'p', 'Q', 'r', 'R', 'S', 's', 't', 'u', 'v', 'Y', 'z',' Z', '1', '2', '3', '4', '5', '6', '7', '8', '9','10'];

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
    
    userDB[userID] = newUser;

    return newUser;
  };
  function emailExists(email){

    // console.log('SOF emailExists:', email);

    for (const key in userDB) {
      if (userDB[key].email === email) {
        // console.log('emailExists userDB[key].email:', userDB[key].email, 'email:', email);
        return true;
      }
    }
    return false;
  }
  function getUserByEmail(email){
    let user = {};
    let database = {}

    for (const key in userDB) {
      if (userDB[key].email === email) {
        user = userDB[key];
        // console.log('getUserByEmail:', user);
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

    for (const key in userDB) {
      if (userDB[key].email === email) {
          return true;
      }
    }
    return false;
  }
  return {
    generateRandomString,
    addNewUser,
    emailExists,
    getUserByEmail,
    checkIfUserExists,
    emailExists
  };
}

module.exports = helpers;

