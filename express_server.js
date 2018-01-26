const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
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
    password: "password"
  }
}



// function to generate 6 random random alphanumeric ------------//
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
// function to check for duplicates in an object
/////there is a find in method to check. change function later
function checkDuplicate (obj, checkKey, checkValue) {
  for (let element in obj) {
    console.log(element);
    console.log(obj[element][checkKey]);
    if (obj[element][checkKey] == checkValue) {
      return true;
    }
  }

}
// console.log(checkDuplicate(users, "email", "user2@example.com" ));

// if ((checkDuplicate(users, "email", "user2@example.com" ))) {
//   console.log("x");
// } else {
//   console.log("hhhh")
// }

// function to find a user in an object by checking given email and password
function findUser (obj, email, password) {
  let user_id;
  // console.log(email);
  // console.log(password);
  for (let element in obj) {
  // console.log(obj[element].email);
  // console.log(obj[element].password);
    if (obj[element].email === email && obj[element].password === password) {
      user_id = obj[element].id;
      return user_id;
    }
  }
}



// console.log(findUser(users, "hello@example.com", "password"));

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

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase,
    user_id: req.cookies.user_id
  };
  const user_id = req.cookies.user_id;
  if (users[user_id]) {
    res.render("urls_index", templateVars);
    // res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }

});

// ------- moved above "/urls/:id" because :id is a string and it'll redirect to "/urls/:id" first
app.get("/urls/new", (req, res) => {
  let templateVars = { urls: urlDatabase,
    user_id: req.cookies.user_id
  };
  const user_id = req.cookies.user_id;
  if (users[user_id]) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

// ------- registration page
app.get("/register", (req, res) => {
  let templateVars = { urls: urlDatabase,
    user_id: req.cookies.user_id
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  let userID = generateRandomString();
  // console.log(userID);
  // console.log(req.body);
  let user_email = req.body.email;
  // console.log(email);
  let user_password = req.body.password;
  // console.log(password);
  if (!user_email || !user_password)  {
    // console.log("error");
    res.status(400).send("Error: 400 - Please submit both an email and password.");
  } else if (checkDuplicate(users, "email", user_email)) {
    // console.log("x");
    res.status(400).send("Error: 400 - Email taken. Please use a new email.");
  } else {
    users[userID] = {
      "id": userID,
      "email": user_email,
      "password": user_password
    }
    res.redirect("/urls");
  }
    // console.log(users);
});

// ------- :shortURL is equal to the key values (6 alpha letters)
app.get("/u/:shortURL", (req, res) => {
 // shortURL is the key value of the object
  // check what's req to access correct key
  // console.log(req);
  // req.params stores a list of values from ejs page
  let shortURL = req.params.shortURL
  // console.log(req.params);
  let longURL = urlDatabase[shortURL]
  // longURL is now set to the value(thelongurl) of the key(shortURL)
  // redirects to the page eg /u/9sm5xK for google
  // if i where to input the key value after /u/
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
    user_id: req.cookies.user_id,
    urls: urlDatabase
  };
  // console.log(req.params);
  // console.log(req.body);
  res.render("urls_show", templateVars);
});

// ------- post from form page to update urlDatabase
app.post("/urls", (req, res) => {
  // console.log(req.body);  // debug statement to see POST parameters
  // object shows the key "longURL" because it the the name used in urls_new.ejs form //
  let shortURL = generateRandomString();
  // to access value pair to the key longURL
  let longURL = req.body.longURL;
  // console.log(longURL);
  // console.log(shortURL);
  const user_id = req.cookies.user_id;
  //// add user_id to string so url shows who submitted the url
  urlDatabase[shortURL] = { "user_ID": user_id, "longURL": longURL }
  console.log(urlDatabase);
  // can redirect by using res.redirect(" -where to redirect after submit")
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)
  res.redirect("/urls");
});

// ------- deletes a list in /urls
app.post("/urls/:id/delete", (req, res) => {
  // console.log(req.params);
  let remove = req.params.id;
  const user_id = req.cookies.user_id;
  for (let key in urlDatabase) {
    if(key == remove && urlDatabase[key].index
     == user_id) {
      delete urlDatabase[remove];
    }
  }
  res.redirect("/urls");
});

// ------- edits /urls with a new urls
app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let longURL = req.body.longURL;
  const user_id = req.cookies.user_id;
  for (let key in urlDatabase) {
    if(key == shortURL && urlDatabase[key].user_ID == user_id) {
      urlDatabase[shortURL] = { "user_ID": user_id, "longURL": longURL };
    }
  }
  res.redirect("/urls");
});


// ------- login page
app.get("/login", (req, res) => {
  let templateVars = { urls: urlDatabase,
    user_id: req.cookies.user_id
  };
  res.render("urls_login", templateVars);
});

// ------- generate cookie when user logs in
app.post("/login", (req, res) => {
  let user_email = req.body.email
  // console.log(user_email);
  let user_password = req.body.password;
  // console.log(user_password);
  // console.log(checkDuplicate(users, "email", user_email));
  // console.log(checkDuplicate(users, "password", user_password));
  // ----------- check if pass and email exist. if it does, search users and return userid as cookie ------
  if (checkDuplicate(users, "email", user_email) && checkDuplicate(users, "password", user_password)) {
    // console.log("These exist");
    const user_id = findUser(users, user_email, user_password);
    // console.log(user_id);
    res.cookie("user_id", users[user_id].id);
    res.redirect("/urls");
  } else if (!checkDuplicate(users, "email", user_email)) {
    res.status(403).send("Error: 403 - Email does not exist");
  } else {
    res.status(403).send("Error: 403 - Wrong password");
  }
});

// ------- respons to a logout button that clears cookies and redirects back to /urls
app.post("/login/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});