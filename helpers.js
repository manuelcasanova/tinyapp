function getUserByEmail(email, userDatabase) { //Returns the ID for the user with them given email address
  for (const user in userDatabase) {
    if (userDatabase[user].email === email) {
      return userDatabase[user].id;
    }
  }
};

module.exports = {
  getUserByEmail
};