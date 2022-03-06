const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// function generateRandomString(length) {
//   const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
//   for (var i = ''; i.length < length; i += characters.charAt(Math.random()*62));
//   //Math.random --> 0...1 * 62 (length of characters) charAt --> gets the character of the string
//   return i;
// }

function generateRandomString() {
  let result = '';
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = 6;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
    //Math.random --> 0...1  times (length of characters) charAt --> gets the character of the string
  }
  return result;
}

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userID": {
    id: "userID",
    email: "user@example.com",
    password: "password1"
  },
  "user2ID": {
    id: "user2ID",
    email: "user2@example.com",
    password: "password2"
  }
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.cookies["userID"]]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["userID"]]
  };
  res.render("urls_index", templateVars);
}); //

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["userID"]]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  //console.log("------->", longURL);
  res.redirect(longURL);
});
//Requests to the endpoint "/u/:shortURL" will redirect to its longURL

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(); //We'll use this constant no only below but also in the redirect
  urlDatabase[shortURL] = req.body.longURL; //Adds the short and long urls to the variable "urlDatabase"
  //res.send("Ok");
  
  console.log(req.body);  // Log the POST request body to the console
  
  res.redirect(`/urls/${shortURL}`); //Redirects to /urls/:shortURL, where shortURL is the random string we generated
  //Note that this won't work if we only require de site without http://
  //console.log(urlDatabase);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});
//Deletes :shortURL in database and redirects to the urls page.

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.newURL;
  res.redirect('/urls');
});
//Updates a URL resource POST /urls/:id

app.post("/login", (req, res) => {
  const input = req.body.username;
  res.cookie("username", input); //Cookies have name/value
  res.redirect('/urls');
});
//Sets a cookie named username to the value submitted in the request body via the login form. Then redirects to /urls page.

app.post("/logout", (req, res) => {
  res.clearCookie("userID");
  res.redirect('/urls');
});

app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.cookies["userID"]]
  };
  res.render("register", templateVars)
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const newUserID = generateRandomString();
  users[newUserID] = {
    id: newUserID,
    email: email,
    password: password
  };
  //console.log(users); To confirm that new users have been added
  res.cookie("userID", newUserID);
  res.redirect(`/urls/`); 
});

