const express = require("express");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session')
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  secret: 'key1'
}));

app.set("view engine", "ejs");

let urlDatabase = {
  "b2xVn2":  {
    user_ID: "userRandomID",
    longURL: "http://www.lighthouselabs.ca"
  },
  "9sm5xK": {
    user_ID: "ex",
    longURL: "http://www.google.com"
  }
}

let userURL = {
  "b2xVn2": {
    user_ID : "ex",
    longURL: "http://www.google.com"
  },
}

// ------- user info
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "ex": {
    id: "ex",
    email: "hello@example.com",
    password: "pass"
  }
}


//------------//
function updateUserURLS (id) {
  const userURLS = {};
  for (let key in urlDatabase)
    if (urlDatabase[key].user_ID == id ) {
      userURLS[key] = urlDatabase[key];
    }
  return userURLS;
}

//------------ used to generate userID and shortURLs//
function generateRandomString() {
   const vocabulary = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'x', 'y', 'z'];
   let output = "";
   for (let i = 0; i < 6; i++) {
       let index = getRandomInt();
       output += vocabulary[index];
   }
   return output;
}

function getRandomInt() {
   min = Math.ceil(0);
   max = Math.floor(25);
   return Math.floor(Math.random() * (25 - 0)) + 0;
}

//------------ checks for a value duplicate//
function checkDuplicate (obj, checkKey, checkValue) {
  for (let element in obj) {
    if (obj[element][checkKey] == checkValue) {
      return true;
    }
  }

}
//------------//
function findUser (obj, email) {
  let user_id;
  for (let element in obj) {
    if (obj[element].email === email) {
      user_id = obj[element].id;
      return user_id;
    }
  }
}

//-------------------------------------------//


app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

//------------ home page of index list//
app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  const userURL = updateUserURLS(user_id);
  let templateVars = { urls: userURL,
    user_id: req.session.user_id
  };
  if (users[user_id]) {
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});

//------------ adds a new url to index page//
app.get("/urls/new", (req, res) => {
  let templateVars = { urls: urlDatabase,
    user_id: req.session.user_id
  };
  const user_id = req.session.user_id;
  if (users[user_id]) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

//------------ registration page//
app.get("/register", (req, res) => {
  let templateVars = { urls: urlDatabase,
    user_id: req.session.user_id
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  let userID = generateRandomString();
  let user_email = req.body.email;
  let user_password = req.body.password;
  const hashedPassword = bcrypt.hashSync(user_password, 10);
  if (!user_email || !hashedPassword)  {
    res.status(400).send("Error: 400 - Please submit both an email and password.");
  } else if (checkDuplicate(users, "email", user_email)) {
    res.status(400).send("Error: 400 - Email taken. Please use a new email.");
  } else {
    users[userID] = {
      "id": userID,
      "email": user_email,
      "password": hashedPassword
    }
    res.redirect("/urls");
  }
});

//------------ redirects shortURL. it is equal to the key values (6 alpha letters)//
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL
  let longURL = urlDatabase[shortURL].longURL
  // longURL is now set to the value(thelongurl) of the key(shortURL)
  // redirects to the page eg /u/9sm5xK for google
  // if i where to input the key value after /u/
  res.redirect(longURL);
});

//------------ assign a new longURL to shortURL//
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
    user_id: req.session.user_id,
    urls: urlDatabase
  };
  res.render("urls_show", templateVars);
});

//------------ post from form page to update urlDatabase//
app.post("/urls", (req, res) => {
  // console.log(req.body);  // debug statement to see POST parameters
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  let user_id = req.session.user_id;
  //// updates urlDatabase
  urlDatabase[shortURL] = { "user_ID": user_id, "longURL": longURL }
  res.redirect("/urls");
});

//------------ deletes a list in /urls//
app.post("/urls/:id/delete", (req, res) => {
  let remove = req.params.id;
  const user_id = req.session.user_id;
  for (let key in urlDatabase) {
    if(key == remove && urlDatabase[key].user_ID == user_id) {
      delete urlDatabase[remove];
    }
  }
  res.redirect("/urls");
});

//------------ edits /urls with a new urls//
app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let longURL = req.body.longURL;
  const user_id = req.session.user_id;
  for (let key in urlDatabase) {
    if(key == shortURL && urlDatabase[key].user_ID == user_id) {
      urlDatabase[shortURL] = { "user_ID": user_id, "longURL": longURL };
    }
  }
  res.redirect("/urls");
});


//------------ login page//
app.get("/login", (req, res) => {
  let templateVars = { urls: urlDatabase,
    user_id: req.session.user_id
  };
  res.render("urls_login", templateVars);
});

// ------- generate cookie when user logs in//
app.post("/login", (req, res) => {
  let user_email = req.body.email
  let user_password = req.body.password;
  // ----------- check if pass and email exist. if it does, search users and return userid as cookie ------
  if (checkDuplicate(users, "email", user_email)) {
    let user_id = findUser(users, user_email,);
    // check if password matches id
    if (bcrypt.compareSync(user_password, users[user_id].password)) {
      req.session.user_id = users[user_id].id;
      res.redirect("/urls");
    }
  } else if (!checkDuplicate(users, "email", user_email)) {
    res.status(403).send("Error: 403 - Email does not exist");
  } else {
    res.status(403).send("Error: 403 - Wrong password");
  }
});

//------------ response to a logout button that clears cookies and redirects back to /urls
app.post("/login/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

