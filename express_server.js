const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// function to generate 6 random random alphanumeric
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
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// moved above "/urls/:id" because :id is a string and it'll redirect to "/urls/:id" first
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//:shortURL is equal to the key values (6 alpha letters)
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
  let templateVars = { shortURL: req.params.id };
  // console.log(req.params);
  // console.log(req.body);
  res.render("urls_show", templateVars);
});



app.post("/urls", (req, res) => {
  // console.log(req.body);  // debug statement to see POST parameters
  // object shows the key "longURL" because it the the name used in urls_new.ejs form //
  let shortURL = generateRandomString();
  // to access value pair to the key longURL
  let longURL = req.body.longURL;
  // console.log(longURL);
  // console.log(shortURL);
  urlDatabase[shortURL] = longURL;
  // console.log(urlDatabase);
  // can redirect by using res.redirect(" -where to redirect after submit")
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

// deletes a list in /urls
app.post("/urls/:id/delete", (req, res) => {
  // console.log(req.params);
  let remove = req.params.id;
  // console.log(urlDatabase);
  // console.log(remove);
  delete urlDatabase[remove];
  // console.log(urlDatabase);
  res.redirect("/urls");
});

// updates /urls with a new urls
app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  console.log(shortURL);
  let longURL = req.body.longURL;
  console.log(longURL);
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});