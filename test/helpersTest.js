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
  it('should return a user with an valid email', function() {
    const user = getUserByEmail("user@example.com")
    const expectedOutput = "userRandomID";
    assert.strictEqual(user.id, expectedOutput, true);
  });

  it('should return {} for an invalid email', function() {
    const user = getUserByEmail("admin@example.com")
    const expectedOutput = undefined;
    assert.strictEqual(user.id, expectedOutput, true);
  });
});

const {checkEmailExists} = helpers(testUsers);
describe('checkEmailExists', function() {
  it('should return true if a user has an valid email', function() {
    const email = checkEmailExists("user@example.com")
    const expectedOutput = true;
    assert.strictEqual(email, expectedOutput, true);
  });

  it('should return false an invalid email', function() {
    const email = checkEmailExists("admin@example.com")
    const expectedOutput = false;
    assert.strictEqual(email, expectedOutput, true);
  });
});

const {checkIfUserExists} = helpers(testUsers);
describe('checkIfUserExists', function() {
  it('should return true if a user exists', function() {
    const userExists = checkIfUserExists("user@example.com", "purple-monkey-dinosaur");
    const expectedOutput = true;
    assert.notEqual(userExists, expectedOutput, true);
  });

  it('should return false if user does not exist', function() {
    const userExists = checkIfUserExists("admin@example.com", "purple-monkey-dinosaur");
    const expectedOutput = false;
    assert.strictEqual(userExists, expectedOutput, true);
  });
});