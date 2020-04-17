const express = require('express');
const uid = require("uid");

const { getUrlsByUser } = require('../helpers');


const urls = function(users, urlDatabase) {
  const router = express.Router();
  
  router.get("/", (req, res) => {
    const { user_id } = req.session;
    if (user_id && users[user_id]) {
      const templateVars = {
        user: users[user_id],
        urls: getUrlsByUser(user_id, urlDatabase)
      };
      res.render("urls_index", templateVars);
    } else {
      res.redirect("/login");
    }
  });
  
  router.post("/", (req, res) => {
    const { user_id } = req.session;
    if (user_id) {
      const shortURL = uid(6);
      urlDatabase[shortURL] = {
        longURL: req.body.longURL,
        userID: user_id
      };
      res.redirect(`/urls/${shortURL}`);
    } else {
      res.status(400).send("Log in Required");
    }
  });
  
  router.get("/new", (req, res) => {
    const { user_id } = req.session;
    if (user_id && users[user_id]) {
      const templateVars = {
        user: users[user_id]
      };
      res.render("urls_new", templateVars);
    } else {
      res.redirect("/login");
    }
  });
  
  router.get("/:shortURL", (req, res) => {
    const { shortURL } = req.params;
    const { user_id } = req.session;
    const urlObj = urlDatabase[shortURL];
    if (urlObj && urlObj.userID === user_id) {
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
  
  router.post("/:shortURL/update", (req, res) => {
    const { shortURL } = req.params;
    const { user_id } = req.session;
    if (urlDatabase[shortURL].userID === user_id) {
      urlDatabase[shortURL] = {
        ...urlDatabase[shortURL],
        longURL: req.body.longURL
      };
      res.redirect("/urls");
    } else {
      res.status(400).send("Page Not Found");
    }
  
  });
  
  router.post("/:shortURL/delete", (req, res) => {
    const { shortURL } = req.params;
    const { user_id } = req.session;
    if (user_id && urlDatabase[shortURL].userID === user_id) {
      delete urlDatabase[shortURL];
      res.redirect("/urls");
    } else {
      res.status(400).send("Page Not Found");
    }
  });
  
  return router;
};

module.exports = urls;