const express = require('express')
const uid = require("uid");
const bcrypt = require('bcrypt');

const { getUserByEmail } = require('../helpers')


const auth = function(users) {
  const router = express.Router()

  router.get("/register", (req, res) => {
    const { user_id } = req.session;
    const user = users[user_id]
    if (!user) {
      const templateVars = {
        user
      }
      res.render("register", templateVars)
    } else {
      res.redirect("/urls")
    }
  })
  
  router.post("/register", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).send("Must include Email and Password")
    } else if (getUserByEmail(email, users)) {
      res.status(400).send("Email already in use")
    } else {
      const id = uid(6)
      users[id] = { id, email, password: bcrypt.hashSync(password, 10) }
      req.session.user_id = id
      res.redirect("/urls")
    }
  })
  
  router.get("/login", (req, res) => {
    const { user_id } = req.session;
    const user = users[user_id]
    if (!user) {
      const templateVars = {
        user
      }
      res.render("login", templateVars)
    } else {
      res.redirect("/urls")
    }
  })
  
  router.post("/login", (req, res) => {
    const { email, password } = req.body;
    const user = getUserByEmail(email, users);
    if (!email || !password) {
      res.status(400).send("Must include Email and Password");
    } else if (user && bcrypt.compareSync(password, user.password)) {
      req.session.user_id = user.id
      res.redirect("/urls")
    } else {
      res.status(403).send("Password does not match")
    }
  })
  
  router.post("/logout", (req, res) => {
    req.session.user_id = "";
    res.redirect("/urls")
  })

  return router
}

module.exports = auth