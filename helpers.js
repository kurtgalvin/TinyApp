const getUserByEmail = function(email, database) {
  for (const userId of Object.keys(database)) {
    const user = database[userId];
    if (user.email === email) {
      return user;
    }
  }
  return false;
}

module.exports = {
  getUserByEmail
}