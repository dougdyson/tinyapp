const { assert } = require('chai');

const helpers  = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const {getUserByEmail} = helpers(testUsers);
describe('getUserByEmail', function() {
  it('should not return not a user with an invalid email', function() {
    const user = getUserByEmail("user@example.com")
    const expectedOutput = "userRandomID";
    assert.notEqual(user, expectedOutput, true);
  });
});

const {emailExists} = helpers(testUsers);
describe('emailExists', function() {
  it('should return false if a user has an invalid email', function() {
    const email = emailExists("user@example.com")
    const expectedOutput = false;
    assert.notEqual(email, expectedOutput, true);
  });
});

const {checkIfUserExists} = helpers(testUsers);
describe('checkIfUserExists', function() {
  it('should return false if a user does not exist', function() {
    const userExists = checkIfUserExists("user@example.com", "purple-monkey-dinosaur");
    console.log(userExists);
    const expectedOutput = false;
    assert.notEqual(userExists, expectedOutput, true);
  });
});