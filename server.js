const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");
const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");

const db = require("./config/keys").mongoURI;

//body-parser Middleware

mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("Connected"))
  .catch(err => console.log(err));

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => res.send("Working"));

app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`listening on port ${PORT}`));
