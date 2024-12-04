/*********************************************************************************
WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
No part of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Ranjot Singh
Student ID: 129254231
Date: 13-10-2024
Vercel Web App URL: https://web322-kappa.vercel.app/
GitHub Repository URL: https://github.com/rsingh730/web322.git

********************************************************************************/

const Sequelize = require('sequelize');

// Sequelize database connection setup
var sequelize = new Sequelize('neondb', 'neondb_owner', 'U7HbVtGhDfa2', {
    host: 'ep-hidden-glade-a5ri5kz4.us-east-2.aws.neon.tech',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

// Define models for 'Item' and 'Category'
const Item = sequelize.define('Item', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    itemDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN,
    price: Sequelize.DOUBLE
});

const Category = sequelize.define('Category', {
    category: Sequelize.STRING
});

// Define relationships
Item.belongsTo(Category, { foreignKey: 'category' });

// Initialize function to sync with the database
module.exports.initialize = () => {
    return new Promise((resolve, reject) => {
        sequelize.sync()
            .then(() => resolve())
            .catch(err => reject("unable to sync the database"));
    });
};

// Function to get all published items
module.exports.getPublishedItems = () => {
    return new Promise((resolve, reject) => {
        Item.findAll({ where: { published: true } })
            .then(publishedItems => resolve(publishedItems))
            .catch(err => reject("No published items found"));
    });
};

// Function to get all categories
module.exports.getAllCategories = () => {
    return new Promise((resolve, reject) => {
        Category.findAll()
            .then(allCategories => resolve(allCategories))
            .catch(err => reject("No categories found"));
    });
};

// Function to get all items
module.exports.getAllItems = () => {
    return new Promise((resolve, reject) => {
        Item.findAll()
            .then(allItems => resolve(allItems))
            .catch(err => reject("No items found"));
    });
};

// Function to get items by category
module.exports.getItemsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: { category: category }
        })
        .then(itemsByCategory => resolve(itemsByCategory))
        .catch(err => reject("No items found for the specified category"));
    });
};

// Function to get items by minimum date
module.exports.getItemsByMinDate = (minDateStr) => {
    return new Promise((resolve, reject) => {
        const minDate = new Date(minDateStr);
        Item.findAll({
            where: {
                itemDate: {
                    [Sequelize.Op.gte]: minDate
                }
            }
        })
        .then(itemsByMinDate => resolve(itemsByMinDate))
        .catch(err => reject("No items found for the specified date"));
    });
};

// Function to get an item by ID
module.exports.getItemById = (id) => {
    return new Promise((resolve, reject) => {
        Item.findByPk(id)
            .then(item => {
                if (item) {
                    resolve(item);
                } else {
                    reject("Item not found");
                }
            })
            .catch(err => reject("Error retrieving item by ID"));
    });
};

// Function to get published items by category
module.exports.getPublishedItemsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: { published: true, category: category }
        })
        .then(publishedItemsByCategory => resolve(publishedItemsByCategory))
        .catch(err => reject("No published items found for the specified category"));
    });
};

// Function to add a new item
module.exports.addItem = (itemData) => {
    return new Promise((resolve, reject) => {
        Item.create(itemData)
            .then(newItem => resolve(newItem))
            .catch(err => reject("Unable to add item"));
    });
};

// Function to add a new category
module.exports.addCategory = (categoryData) => {
    return new Promise((resolve, reject) => {
        Category.create(categoryData)
            .then(newCategory => resolve(newCategory))
            .catch(err => reject("Unable to add category"));
    });
};

// Function to delete a category by ID
module.exports.deleteCategoryById = (id) => {
    return new Promise((resolve, reject) => {
        Category.destroy({
            where: { id: id }
        })
        .then((deletedCount) => {
            if (deletedCount > 0) {
                resolve();
            } else {
                reject('Category not found or already deleted');
            }
        })
        .catch(err => reject("Error deleting category: " + err));
    });
};

// Function to delete an item by ID
module.exports.deleteItemById = (id) => {
    return new Promise((resolve, reject) => {
        Item.destroy({
            where: { id: id }
        })
        .then((deletedCount) => {
            if (deletedCount > 0) {
                resolve();
            } else {
                reject('Item not found or already deleted');
            }
        })
        .catch(err => reject("Error deleting item: " + err));
    });
};
