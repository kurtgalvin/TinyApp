const getUserByEmail = function(email, userDB) {
  for (const userId of Object.keys(userDB)) {
    const user = userDB[userId];
    if (user.email === email) {
      return user;
    }
  }
};

const getUrlsByUser = function(id, urlDB) {
  const result = {};
  for (const key of Object.keys(urlDB)) {
    if (urlDB[key].userID === id) {
      result[key] = urlDB[key];
    }
  }
  return result;
};

module.exports = {
  getUserByEmail,
  getUrlsByUser
};