const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')

const urls = require('./routes/urls')
const auth = require('./routes/auth')

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['/* secret keys */'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

const urlDatabase = {};
const users = {};

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
  const urlObj = urlDatabase[shortURL];
  if (urlObj) {
    res.redirect(urlObj.longURL);
  } else {
    res.status(404).send("Page Not Found")
  }
});

app.use("/urls", urls(users, urlDatabase))
app.use(auth(users))

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});