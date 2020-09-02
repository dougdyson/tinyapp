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
    assert.notEqual(user, "user2RandomID", true);
  });
});