const Sequelize = require("sequelize");
const db = new Sequelize("postgres://localhost:5432/wikistack", {
  logging: false  //not logging table create infos
});
const marker = require("marked");

const Page = db.define("page", {
  title: {
      type: Sequelize.STRING,
      allowNull: false
  },
  urlTitle: {
      type: Sequelize.STRING,
      allowNull: false
  },
  content: {
      type: Sequelize.TEXT,
      allowNull: false
  },
  status: {
      type: Sequelize.ENUM("open", "closed")
    },
  tags: {
    //describe its could be array
    //only on postrage
    type: Sequelize.ARRAY(Sequelize.TEXT),
    // page.tags = "programming, coding , javascript"
    set: function (str){ //setter for tags

      if (typeof str === "string") {
        let arrayOfTags = str.split(",").map(function(s){
          return s.trim();
        });
        //set string to database
        this.setDataValue("tags", arrayOfTags);
      } else {
        //set array to database
        this.setDataValue("tags", str);
       }
     }
   },
    route: {
        type: Sequelize.VIRTUAL,  //VIRTUAL: not in table, method only
        get () {
            return '/wiki/' + this.getDataValue('urlTitle')
        }
    },
    renderedContent: {
        type: Sequelize.VIRTUAL,
        get () {
          //use marked npm
            return marked(this.getDataValue('content'))
        }
    }
})

/**
 * Hooks
 */
// {}
Page.beforeValidate(function (page) {
  //instead of passing urlTitle to db
  if (page.title) {
    //replace space with "_" therefore can run on url
    page.urlTitle = page.title.replace(/\s+/g, '_').replace(/\W/g, '');
  }
})

/**
 * Class Methods
 */
Page.findByTag = function (tag) {
  return Page.findAll({
    where: {
      tags: {
        $overlap: [tag] //only works on array
      }
    }
  });
}

/**
 * Instance methods
 */
/*
Page.create({
  title: 'philip',
  urlTitle: 'blahablha',
  tags: ['hi', 'bye']
})

Class methods:
Page.whatever
Page.findByTag

Instance methods:
philipPage.findSimilar
*/
Page.prototype.findSimilar = function () {
  return Page.findAll({
    where: {
      tags: {
        $overlap: this.tags //this tag overlap other tags
      },
      id: {
        $ne: this.id  //where the this.id not equal this.id
      }
    }
  });
};

const User = db.define("user", {
  name: {
      type: Sequelize.STRING,
      allowNull: false
  },
  email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
  }
});

//user id will auto save to page table
Page.belongsTo(User, {as: "author"});

module.exports = {
  Page: Page,
  User: User,
  db: db  //export to run instance, sync db on app.js
};
