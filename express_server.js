const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const uid = require("uid");
const bcrypt = require('bcrypt');

const { getUserByEmail } = require('./helpers')
const urls = require('./routes/urls')

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['/* secret keys */'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))



const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "aJ48lW" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "aJ48lW" },
  "1Rs5xK": { longURL: "http://www.test.com", userID: "random" }
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  }
};

app.get("/", (req, res) => {
  const { user_id } = req.session;
  if (user_id && users[user_id]) {
    res.redirect("/urls")
  } else {
    res.redirect("/login")
  }
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const { longURL } = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  }
  res.render("register", templateVars)
})

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send("Must include Email and Password")
  } else if (getUserByEmail(email, users)) {
    res.status(400).send("Email already in use")
  }
  const id = uid(6)
  users[id] = { id, email, password: bcrypt.hashSync(password, 10) }
  req.session.user_id = id
  res.redirect("/urls")

})

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  }
  res.render("login", templateVars)
})

app.post("/login", (req, res) => {
  const {email, password} = req.body;
  if (!email || !password) {
    res.status(400).send("Must include Email and Password");
  }
  const user = getUserByEmail(email, users);
  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.user_id = user.id
    res.redirect("/urls")
  } else {
    res.status(403).send("Password does not match")
  }
})

app.post("/logout", (req, res) => {
  req.session.user_id = "";
  res.redirect("/urls")
})

app.use("/urls", urls(users, urlDatabase))

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});