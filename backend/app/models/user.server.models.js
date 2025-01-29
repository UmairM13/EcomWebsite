const db = require("../../database");
const crypto = require("crypto");

const getHash = function (password, salt) {
  return crypto
    .pbkdf2Sync(password, salt, 100000, 256, "sha256")
    .toString("hex");
};

const addNewUser = (user, done) => {
  const salt = crypto.randomBytes(64);
  const hash = getHash(user.password, salt);

  const checkSql = "SELECT COUNT(*) AS count FROM users WHERE email = ?";
  db.get(checkSql, [user.email], (err, row) => {
    if (err) return done(err);

    const count = row.count;
    if (count > 0) return done(400);

    const sql =
      "INSERT INTO users (first_name, last_name, email, password, salt) VALUES (?, ?, ?, ?, ?)";
    let values = [
      user.first_name,
      user.last_name,
      user.email,
      hash,
      salt.toString("hex"),
    ];

    db.run(sql, values, function (err) {
      if (err) {
        done(err);
      } else {
        done(null, this.lastID);
      }
    });
  });
};

const authenticateUser = (email, password, done) => {
  const sql = "SELECT user_id, password, salt FROM users WHERE email = ?";

  db.get(sql, [email], (err, row) => {
    if (err) return done(err);
    if (!row) return done(400);

    if (row.salt === null) row.salt = "";

    let salt = Buffer.from(row.salt, "hex");

    if (row.password === getHash(password, salt)) {
      return done(false, row.user_id);
    } else {
      return done(400);
    }
  });
};

const setToken = (id, done) => {
  let token = crypto.randomBytes(16).toString("hex");

  const sql = "UPDATE users SET session_token = ? WHERE user_id = ?";

  db.run(sql, [token, id], (err) => {
    return done(err, token);
  });
};

const getToken = (id, done) => {
  const sql = "SELECT session_token FROM users WHERE user_id = ?";

  db.get(sql, [id], (err, row) => {
    if (err) return done(err);
    if (!row) return done(null, null);

    return done(null, row.session_token);
  });
};

const removeToken = (token, done) => {
  const sql = "UPDATE users SET session_token = NULL WHERE session_token = ?";

  db.run(sql, [token], (err) => {
    return done(err);
  });
};

const getIdFromToken = (token, done) => {
  const sql = "SELECT user_id FROM users WHERE session_token = ?";
  const params = [token];

  if (token === undefined || token === null) {
    return done(null, null);
  }

  db.get(sql, params, (err, row) => {
    if (err) return done(err);
    if (!row) return done(null, null);

    return done(null, row.user_id);
  });
};

module.exports = {
  addNewUser,
  authenticateUser,
  setToken,
  removeToken,
  getIdFromToken,
  getToken,
};
