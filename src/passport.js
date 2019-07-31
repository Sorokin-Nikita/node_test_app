// setup passport module
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const {isValidPassword, findUser} = require('./database/users');

passport.use(new LocalStrategy({ usernameField: 'login' }, isValidPassword));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  findUser(id).then((result) => {
    console.log('deserialized user', result);

    if (!result) done(404, result);
    else if (result.error) done(result.error, result);
    else done(null, result);
  });
});

module.exports = passport;
