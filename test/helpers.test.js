const { assert } = require('chai');

const { getUserByEmail, getUrlsByUser } = require('../helpers.js');

const testUsers = {
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

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "ID1" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "ID1" },
  "1Rs5xK": { longURL: "http://www.test.com", userID: "ID2" }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expected = testUsers["userRandomID"];
    assert.deepEqual(user, expected);
  });

  it('should return undefined with invalid email', function() {
    const user = getUserByEmail("user3@example.com", testUsers);
    assert.isUndefined(user);
  });
});

describe('getUrlsByUser', function() {
  it('return urls object given valid ID', function() {
    const actual = getUrlsByUser('ID1', urlDatabase);
    const expected = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "ID1" },
      "9sm5xK": { longURL: "http://www.google.com", userID: "ID1" },
    };
    assert.deepEqual(actual, expected);
  });

  it('return empty object given invalid ID', function() {
    const actual = getUrlsByUser('ID3', urlDatabase);
    const expected = {};
    assert.deepEqual(actual, expected);
  });
});