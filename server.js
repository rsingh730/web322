/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Ranjot Singh
*  Student ID: 129254231
*  Date: 13-10-2024
*  Vercel Web App URL: https://web322-two.vercel.app
*  GitHub Repository URL: https://github.com/rsingh730/web322.git
********************************************************************************/

const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const dataserver = require("./store-service.js");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const stripJs = require('strip-js'); // Import strip-js for safe HTML rendering

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// Configure Handlebars view engine with custom helpers
const hbsHelpers = {
  navLink: function (url, options) {
    return `<li class="nav-item">
      <a class="nav-link${url == app.locals.activeRoute ? " active" : ""}" href="${url}">${options.fn(this)}</a>
    </li>`;
  },
  equal: function (lvalue, rvalue, options) {
    if (arguments.length < 3)
      throw new Error("Handlebars Helper equal needs 2 parameters");
    if (lvalue != rvalue) {
      return options.inverse(this);
    } else {
      return options.fn(this);
    }
  },
  // Custom helper to safely render HTML by stripping JS
  safeHTML: function(context) {
    return stripJs(context);  // Removes any JavaScript
  }
};

// Configure Handlebars engine with custom helpers
app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    helpers: hbsHelpers,  // Register the helpers
  })
);
app.set("view engine", ".hbs");

// Middleware to serve static files
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure Cloudinary
cloudinary.config({
  cloud_name: "danhctegv", // Replace with your actual cloud name
  api_key: "148185547524292", // Replace with your actual API key
  api_secret: "fYYCfjO2aDjSR6uyOQkvTY-pjG8", // Replace with your actual API secret
  secure: true,
});

const upload = multer();

// Middleware to handle active routes
app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute =
    "/" + (isNaN(route.split("/")[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});

// Routes
app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/shop", (req, res) => {
  const category = req.query.category;
  
  dataserver.getPublishedItemsByCategory(category)
    .then((items) => {
      dataserver.getAllCategories()
        .then((categories) => {
          res.render("shop", {
            data: {
              items: items, // List of items for the category
              categories: categories, // List of all categories
              message: 'Items in the selected category',
              viewingCategory: category
            }
          });
        })
        .catch((error) => {
          res.render("shop", {
            data: {
              message: 'Error retrieving categories: ' + error
            }
          });
        });
    })
    .catch((error) => {
      res.render("shop", {
        data: {
          message: 'Error retrieving items: ' + error
        }
      });
    });
});

app.get("/categories", (req, res) => {
  dataserver
    .getAllCategories()
    .then((data) => {
      console.log("Categories data:", data); // Log the data to check the structure
      res.render("categories", { categories: data });
    })
    .catch((err) => {
      console.log("Error fetching categories:", err); // Log the error if any
      res.render("categories", { message: "no results" });
    });
});

app.get('/items', (req, res) => {
  const category = req.query.category;

  if (category) {
    dataserver.getItemsByCategory(category)
      .then((data) => {
        res.render('items', { items: data });
      })
      .catch(() => {
        res.render('items', { message: "no results" });
      });
  } else {
    dataserver.getAllItems()
      .then((data) => {
        res.render('items', { items: data });
      })
      .catch(() => {
        res.render('items', { message: "no results" });
      });
  }
});

app.get('/items/add', (req, res) => {
  res.render('addItem');
});

app.post("/items/add", upload.single("featureImage"), (req, res) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    async function upload(req) {
      let result = await streamUpload(req);
      return result;
    }

    upload(req)
      .then((uploaded) => {
        processItem(uploaded.url);
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send("Error uploading image");
      });
  } else {
    processItem("");
  }

  function processItem(imageUrl) {
    req.body.featureImage = imageUrl;
    dataserver
      .addItem(req.body)
      .then(() => {
        res.redirect("/shop");
      })
      .catch((err) => {
        res.status(500).send("Error adding item");
      });
  }
});

// New route for displaying a specific item by ID
const itemData = require('./store-service'); // Assuming itemData is your store-service module

app.get('/shop/:id', (req, res) => {
  const itemId = req.params.id;
  
  // Retrieve the item with the specified ID
  itemData.getItemById(itemId)
    .then((item) => {
      if (item) {
        // If the item exists, render the item view (shop.hbs)
        res.render('shop', {
          item: item, // Pass the item to the view
          items: itemData.getPublishedItems(), // Pass other items to show in the sidebar
          categories: itemData.getCategories(), // Pass categories for the sidebar
          message: '', // Empty message for no errors
          categoriesMessage: '' // Empty message for categories
        });
      } else {
        // If no item is found, render the 404 page
        res.status(404).render('404', {
          message: 'Item not found'
        });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).render('404', {
        message: 'Error retrieving item'
      });
    });
});

// 404 Error handling (Catch-all route for non-existing routes)
app.use((req, res, next) => {
  res.status(404).render('404', {
    message: 'The page you are looking for does not exist.'
  });
});

// Initialize server
dataserver
  .initialize()
  .then(() => {
    console.log("Server initialized");
    app.listen(HTTP_PORT, () => {
      console.log(`Express http server listening on port http://localhost:${HTTP_PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

module.exports = app;
