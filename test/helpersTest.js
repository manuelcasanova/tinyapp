const { assert } = require('chai');
const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'password1'
  },
  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'password2'
  }
};

describe('getUserByEmail', function () {
  it('should return a user with a valid email', function() {
    const user = getUserByEmail('user@example.com', testUsers)
    const expectedUserID = 'userRandomID';
    assert.equal(user, expectedUserID);

  });
});