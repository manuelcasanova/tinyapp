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

describe('getUserByEmail', function() {
  it('should return a user with a valid email', function() {
    const user = getUserByEmail('user@example.com', testUsers);
    const expectedUserID = 'userRandomID';
    assert.equal(user, expectedUserID);
  });

  it('should return undefined if we pass an email that is not in our users database', function() {
    const user = getUserByEmail('nonExistantUser@example.com', testUsers);
    assert.equal(user, undefined);

  });
});