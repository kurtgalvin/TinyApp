const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const uid = require("uid");

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
  }
};

const emailExists = function(email) {
  for (const id of Object.keys(users)) {
    if (users[id].email === email) {
      return true
    }
  }
  return false
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = uid(6)
  urlDatabase[shortURL] = req.body.longURL
  res.redirect(`/urls/${shortURL}`)
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  let templateVars = {
    shortURL,
    user: users[req.cookies.user_id],
    longURL: urlDatabase[shortURL]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/update", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL
  res.redirect("/urls")
})

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  }
  res.render("register", templateVars)
})

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send("Must include Email and Password")
  } else if (emailExists(email)) {
    res.status(400).send("Email already in use")
  }
  const id = uid(6)
  users[id] = { id, email, password }
  res.cookie("user_id", id)
  res.redirect("/urls")

})

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username)
  res.redirect("/urls")
})

app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect("/urls")
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});