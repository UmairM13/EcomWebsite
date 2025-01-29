const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());

// Server port
const HTTP_PORT = 3333;

// Logging
app.use(morgan("tiny"));

// Body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Root endpoint
app.get("/", (req, res, next) => {
  res.json({ status: "Alive" });
});

// Other API endpoints: Links go here...
require("./app/routes/user.server.routes.js")(app);
require("./app/routes/food.server.routes.js")(app);
require("./app/routes/bmi.server.routes")(app);

// Create HTTP server
const server = app.listen(HTTP_PORT, () => {
  console.log("HTTP server running on port: " + HTTP_PORT);
});
