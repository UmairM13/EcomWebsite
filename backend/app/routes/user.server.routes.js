const users = require("../controllers/user.server.controllers");
const auth = require("../middleware/authentication.middleware");

module.exports = function (app) {
  app.route("/users").post(users.addNewUser);

  app.route("/login").post(users.login);

  app.route("/logout").post(auth, users.logout);
};
