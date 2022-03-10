const express = require("express");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');

const { getUserByEmail, generateRandomString, emailExists, urlsForUser } = require("./helpers");

const PORT = 8080;
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cookieSession({ //This section is explained in the cookie-session readme.md API
  name: 'session',
  keys: ["casanova"],
  maxAge: 24 * 60 * 60 * 1000 //24 hours
}));

app.set("view engine", "ejs");

//GLOBAL CONSTANTS

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
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//APP.GET

app.get("/", (req, res) => { //http://localhost:8080 renders de login page
  let templateVars = {
    user: users[req.session.user_id]
  };
  res.render("login", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// app.get("/error", (req, res) => {
//   let templateVars = {
//     user: users[req.session.user_id]
//   };
//   res.render("error", templateVars);
// });

app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id]
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id]
  };
  res.render("login", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase), //only shows urls with same id (creator, loggedin)
    user: users[req.session.user_id]
  };
  if (!req.session.user_id) {   //If there's not logged in user
    res.send("User needs to be logged in to see the shortened URLS"); //send this html message
  } else {
    res.render("urls_index", templateVars); //otherwise show the urls page
  }
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id] //To read a value in cookies with cookie-session write req.session.user_id
  };
  if (!req.session.user_id) { //If there's no logged in user
    res.redirect("/login"); //redirect to login page
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.send("This sort url does not exist in your database");
  }
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    urlUserID: urlDatabase[req.params.shortURL].userID, //Used in urls_show.ejs
    user: users[req.session.user_id],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});
//Requests to the endpoint "/u/:shortURL" will redirect to its longURL


//APP.POST


app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  //const password = "password1"; This would have been hard coding. Instructions on compass were not clear for me.
 
  
  if (email === "" || password === "") {
    //res.status(400).send("Fields email or password cannot be empty");
    let templateVars = {
      "error": {
        "msg": "Fields email or password cannot be empty"
      },
      "user": users[req.session.user_id]
    };
    res.status(400).render("error", templateVars);
  } else if (emailExists(email, users)) {
    res.status(400).send("This email has already been used to create an account");
  } else {
    const newUserID = generateRandomString();
    users[newUserID] = {
      id: newUserID,
      email: email,
      password: bcrypt.hashSync(password, 10)
    };
    req.session.user_id = newUserID; //To set the user_id key on a session write req.session.user_id = "some value";
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!emailExists(email, users)) {
    res.status(403).send("This is not a valid email address");
  } else {
    const userID = getUserByEmail(email, users);
    if (!bcrypt.compareSync(password, users[userID].password)) {
      res.status(403).send("Wrong password");
    } else {
      req.session.user_id = userID; //To set the user_id key on a session write req.session.user_id = "some value";
      res.redirect("/urls");
    }
  }
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id //Modified so it now adds to the object the userID connected to the new shortURL created
  };

  console.log(urlDatabase);  // Log the POST request body to the console
  
  res.redirect(`/urls/${shortURL}`); //Redirects to /urls/:shortURL, where shortURL is the random string we generated
  //Note that this won't work if we only require de site without http:// According to mentors it's a limitation of this tinyApp
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
  const userUrls = urlsForUser(userID, urlDatabase);
  if (Object.keys(userUrls).includes(req.params.shortURL)) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.send("Only the owner can delete a short URL");
  }
});
//Deletes :shortURL in database and redirects to the urls page.
//Updated so it can only be deleted by creator

app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const userUrls = urlsForUser(userID, urlDatabase);
  if (Object.keys(userUrls).includes(req.params.id)) {
    const shortURL = req.params.id;
    urlDatabase[shortURL].longURL = req.body.newURL;
    res.redirect('/urls');
  } else {
    res.send("Only the owner can edit a short URL");
  }
});
//Updates a URL resource POST /urls/:id
//Updated so it can only be edited by creator

app.post("/logout", (req, res) => {
  req.session = null; //To destroy a session (readme.md) instead of `cookie parser res.clearCookie("userID");`
  res.redirect('/urls');
});




