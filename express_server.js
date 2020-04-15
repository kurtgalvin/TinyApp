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
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "aJ48lW" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "aJ48lW" }
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

const getEmailID = function(email) {
  for (const id of Object.keys(users)) {
    if (users[id].email === email) {
      return id
    }
  }
  return false
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
  const { user_id } = req.cookies;
  if (user_id && users[user_id]) {
    const templateVars = {
      user: users[req.cookies.user_id],
      urls: urlsForUser(user_id)
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login")
  }
});

app.post("/urls", (req, res) => {
  const shortURL = uid(6)
  const { user_id } = req.cookies;
  urlDatabase[shortURL] = { 
    longURL: req.body.longURL,
    userID: user_id
  }
  res.redirect(`/urls/${shortURL}`)
});

app.get("/urls/new", (req, res) => {
  const { user_id } = req.cookies;
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
  const shortURL = req.params.shortURL;
  let templateVars = {
    shortURL,
    user: users[req.cookies.user_id],
    longURL: urlDatabase[shortURL].longURL
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
  // TODO: Add userID
  urlDatabase[shortURL] = { longURL: req.body.longURL }
  res.redirect("/urls")
})

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const { longURL } = urlDatabase[shortURL];
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
  } else if (getEmailID(email)) {
    res.status(400).send("Email already in use")
  }
  const id = uid(6)
  users[id] = { id, email, password }
  res.cookie("user_id", id)
  res.redirect("/urls")

})

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  }
  res.render("login", templateVars)
})

app.post("/login", (req, res) => {
  const {email, password} = req.body;
  if (!email || !password) {
    res.status(400).send("Must include Email and Password");
  } 
  const id = getEmailID(email);
  if (id && users[id].password === password) {
    res.cookie("user_id", id)
    res.redirect("/urls")
  } else {
    res.status(403).send("Password does not match")
  }
})

app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect("/urls")
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});