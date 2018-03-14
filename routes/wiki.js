const express = require("express");
const wikiRouter = express.Router();
const models = require("../models");
const Page = models.Page;
const User = models.User;

wikiRouter.get("/", (req, res, next) => {

  //send to wiki to display each obj
  Page.findAll({})  //find everything
  .then(function (thePages) {
    res.render("index", {
      pages: thePages
    });
  })
  .catch(next);

});

wikiRouter.post("/", (req, res, next) => {

  //find from db if existes first
  User.findOrCreate({
    where: {
      email: req.body.authorEmail,
      name: req.body.authorName
    }
  })
  .spread(function(user, wasCreatedBool){
    //only for findOrCreate function
    //return [pageThatWasFoundOrCreated, createdBool]
    //spread out to different parameter
    //true: created , false: found
    //if user existed in db return two things

    return Page.create({  //always return promise
      title: req.body.title,
      content: req.body.content,
      status: req.body.status,
      tags: req.body.tags
      //could manually set author id
    }).then(function(createdPage){
      //use the return Page to set "author"  Page.belongsTo(User, {as: "author"});
      //taking the id to save on Page
      return createdPage.setAuthor(user);
    });
  })
  .then(function(createdPage){
    res.redirect(createdPage.route);
  })
  .catch(next);

  // var newPage  = Page.build(req.body); //req.body to build (object)
  // //.create just save to database immediately
  // //.create return Promise

  // newPage.save()  //only save to db when save , return Promise
  // .then(function(savedPage){
  //   res.redirect(savedPage.router);
  // })
  // .catch(err => next(err)); //send to err middleware
});

wikiRouter.get("/add", (req, res, next) => {
  res.render("addpage");
});

// /wiki/javascript
wikiRouter.get("/:urlTitle", (req, res, next) => {
  var urlTitleOfPage = req.params.urlTitle;

  Page.findOne({
    where: {
      urlTitle: urlTitleOfPage
    }
  })
  .then(function (pages) {
    if (!pages) {
      return next(new Error("That page was not found"));
      //throw error for not found urltitle
    }

    return pages.getAuthor()  //default getter method for author
      .then(function(author){

        pages.author = author;
        res.render("wikipage", {
          page: pages
      });
    });
  })
  .catch(next);
});

wikiRouter.get("/search/:tag", (req, res, next) => {
  Page.findByTag(req.params.tag)
    .then(function(pages){
      res.render("index", {
        pages: pages
      })
    })
    .catch(next);
});

wikiRouter.get("/:urlTitle/similar" , (req,res,next) => {

  Page.findOne({
    where: {
      urlTitle: req.params.urlTitle
    }
  })
  .then(function(page){

    if (!page) {
      return next(new Error("That page was not found"));
      //throw error for not found urltitle
    }

    return page.findSimilar();

  })
  .then(function (similarPages){
    res.render("index", {
      pages: similarPages
    })
  })
  .catch(next);

})

//export the instance
module.exports = wikiRouter;
