const getUserByEmail = function(email, userDatabase) { //Returns the ID for the user with them given email address
  for (const user in userDatabase) {
    if (userDatabase[user].email === email) {
      return userDatabase[user].id;
    }
  }
};

const generateRandomString = function() {
  let result = '';
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = 6;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
    //Math.random --> 0...1  times (length of characters) charAt --> gets the character of the string
  }
  return result;
};

const emailExists = function(email, userDatabase) { //Checks if the email corresponds to a user in the database
  for (const user in userDatabase) {
    if (userDatabase[user].email === email) {
      return true;
    }
  }
  return false;
};

const urlsForUser = function(id, urlDatabase) { //Function returns the URLS where the userID is equal to the id of the logged-in user
  const userURLS = {};
  for (let k in urlDatabase) {
    if (urlDatabase[k].userID === id) {
      userURLS[k] = urlDatabase[k];
    }
  }
  return userURLS;
};

module.exports = {
  getUserByEmail,
  generateRandomString,
  emailExists,
  urlsForUser
};