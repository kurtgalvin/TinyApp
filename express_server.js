const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const uid = require("uid");
const bcrypt = require('bcrypt');

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
  },
  "aJ48lW": {
    id: "aJ48lW",
    email: "kurtgalvin@gmail.com",
    password: "123"
  }
};

const getUserByEmail = function(email, database) {
  for (const userId of Object.keys(database)) {
    const user = database[userId];
    if (user.email === email) {
      return user;
    }
  }
  return false;
}

const urlsForUser = function(id) {
  const result = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      result[key] = urlDatabase[key];
    }
  }
  return result
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const { user_id } = req.session;
  if (user_id && users[user_id]) {
    const templateVars = {
      user: users[user_id],
      urls: urlsForUser(user_id)
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login")
  }
});

app.post("/urls", (req, res) => {
  const shortURL = uid(6)
  const { user_id } = req.session;
  urlDatabase[shortURL] = { 
    longURL: req.body.longURL,
    userID: user_id
  }
  res.redirect(`/urls/${shortURL}`)
});

app.get("/urls/new", (req, res) => {
  const { user_id } = req.session;
  if (user_id && users[user_id]) {
    const templateVars = {
      user: users[user_id]
    }
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login")
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const { shortURL } = req.params;
  const { user_id } = req.session;
  const urlObj = urlDatabase[shortURL];
  if (urlObj.userID === user_id) {
    const templateVars = {
      shortURL,
      user: users[user_id],
      longURL: urlObj.longURL
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("Page Not Found");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const { shortURL } = req.params;
  const { user_id } = req.session;
  if (urlDatabase[shortURL].userID === user_id) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.status(400).send("Page Not Found");
  }
});

app.post("/urls/:shortURL/update", (req, res) => {
  const { shortURL } = req.params;
  const { user_id } = req.session;
  if (urlDatabase[shortURL].userID === user_id) {
    urlDatabase[shortURL] = {
      ...urlDatabase[shortURL],
      longURL: req.body.longURL
    }
    res.redirect("/urls")
  } else {
    res.status(400).send("Page Not Found");
  }

})

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
  // res.clearCookie("user_id")
  req.session.user_id = "";
  res.redirect("/urls")
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});