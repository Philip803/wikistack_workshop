const express = require("express");
const app = express();
const nunjucks = require("nunjucks");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const routes = require("./routes");
const models = require("./models");

app.use(morgan("dev"));

nunjucks.configure("views", {noCache: true});//views folder
app.set("view engine", "html");
app.engine("html", nunjucks.render);

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/", routes); //pass all router to routes

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send(err.message);
}); //handle error middleware

//use db to create all at same time
models.db.sync({ force: true }) //recreate table everytime
.then(function(){
  console.log("All tables created!");
  app.listen("3000", () => console.log("Server running on 3000"));
})
.catch(console.error.bind(console));

//theres another version to sync
/* control which table to force true */
// User.sycn({force: true})
// .then(function (){
//   return Page.sync({force:true});
// })
// .then(function(){
//   app.listen(300,function(){
//     console.log("Server is listening on Port 3000!")
//   })
// })
