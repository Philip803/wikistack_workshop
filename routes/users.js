const express = require("express");
const userRouter = express.Router();
const models = require("../models");
const Page = models.Page;
const User = models.User;
const Prmoise = require("bluebird");

userRouter.get("/", (req, res, next) => {

  User.findAll()
    .then(function(users){
      res.render("users", {
        users: users
      });
    })
    .catch(next);
});

//GET /users/id
userRouter.get("/:userID", (req, res, next) => {
  //grab from Page by user id
  let findingUserPages = Page.findAll({
    where: {
      authorId: req.params.userID
    }
  });
  let findingUser = User.findById(req.params.userID);

  Promise.all([findingUserPages, findingUser])  //from bluebird
  .then(function (values) {
    var pages = values[0];
    var user = values[1];

    user.pages = pages; //set pages to user, therefore only read one user

    res.render("userpage", {
      user: user  //save pages to user, now user has pages too
    })
  })
  .catch(next);

});

module.exports = userRouter;
