const express = require("express");
const router = express.Router();
const model = require("../models");
const Page = model.Page;  //Page table from db
const wikiRouter = require("./wiki");
const userRouter = require("./users");

router.use("/wiki", wikiRouter);  //middleware
router.use("/users", userRouter);

router.get("/", (req, res, next) => {
  res.render("index");
});

module.exports = router;
