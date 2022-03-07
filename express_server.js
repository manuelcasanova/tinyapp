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

function emailRepeated(email) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user].id
    }
  }
  return false
} 

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW"
    },
    i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW"
    }
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
  if (!req.cookies["userID"]) { //If there's no logged in user
    res.redirect("/login"); //redirect to login page
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["userID"]]
  };
  res.render("urls_index", templateVars);
}); //

app.get("/urls/:shortURL", (req, res) => {
  // console.log("-------------", urlDatabase);
  // console.log("------------", req.params.shortURL);
  if (!urlDatabase[req.params.shortURL]) { //The way I was trying before wouldn't work because it was always looking for a non exisitin shortURL in the Database so, OF COURSE, was always returning UNDEFINED!
    res.send("<div>This sort url does not exist in your database</div>")
  } 
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.cookies["userID"]],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
});
//Requests to the endpoint "/u/:shortURL" will redirect to its longURL

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(); //We'll use this constant no only below but also in the redirect
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies["userID"] //Modified so it now adds to the object the userID connected to the new shortURL created
  }
    
    ; //Adds the short and long urls to the variable "urlDatabase"
  //res.send("Ok");
  
  console.log(urlDatabase);  // Log the POST request body to the console
  
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
  urlDatabase[shortURL].longURL = req.body.newURL; //Changed left side so it could access de longURL. When I was editing a shortUrl the new longURL wouldn't show until I did this!
  res.redirect('/urls');
});
//Updates a URL resource POST /urls/:id

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if(!emailRepeated(email)) {
    res.status(403).send("This is not a valid email address")
  } else {
    const userID = emailRepeated(email);
    if (users[userID].password !== password) { //to access the password of each user in the object I can reuse the function emailRepeated(email)
      res.status(403).send("Wrong password")
    } else {
      res.cookie('userID', userID);
      res.redirect("/urls");
    }
  }
  
});


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
  if (email === " " || password === " ") { //if !email || !password
    res.status(400).send("Fields email and password cannot be empty");
  } else if (emailRepeated(email)) {
    res.status(400).send("This email has already been used to create an account");
  } else {
    const newUserID = generateRandomString();
    users[newUserID] = {
      id: newUserID,
      email: email,
      password: password
    };
      res.cookie('userID', newUserID);
      res.redirect("/urls");
  };
});

app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.cookies["userID"]]
  };
  res.render("login", templateVars)
});