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

const file = require('fs');
var items = [];
var categories = [];

exports.initialize = () => {
    return new Promise((resolve, reject) => {
        // Read items
        file.readFile('./data/items.json', (err, data) => {
            if (err) {
                return reject('Unable to read the items file');
            }
            items = JSON.parse(data);

            // Read categories
            file.readFile('./data/categories.json', (err, data) => {
                if (err) {
                    return reject('Unable to read the categories file');
                }
                categories = JSON.parse(data);
                resolve(); // Resolve promise after both files have been read
            });
        });
    });
};

exports.getPublishedItems = () => {
    return new Promise((resolve, reject) => {
        const publishedItems = items.filter(item => item.published === true);
        if (publishedItems.length === 0) {
            reject('No published items found');
        } else {
            resolve(publishedItems);
        }
    });
};

exports.getAllCategories = () => {
    return new Promise((resolve, reject) => {
        if (categories.length === 0) {
            reject('No results returned');
        } else {
            resolve(categories);
        }
    });
};

exports.getAllItems = () => {
    return new Promise((resolve, reject) => {
        if (items.length === 0) {
            reject('No results returned');
        } else {
            resolve(items);
        }
    });
};

exports.getItemsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        const filteredItems = items.filter(item => item.category === category);
        if (filteredItems.length > 0) {
            resolve(filteredItems);
        } else {
            reject('No results returned');
        }
    });
};

exports.getItemsByMinDate = (minDateStr) => {
    return new Promise((resolve, reject) => {
        const filteredItems = items.filter(item => new Date(item.postDate) >= new Date(minDateStr));
        if (filteredItems.length > 0) {
            resolve(filteredItems);
        } else {
            reject('No results returned');
        }
    });
};

// Function to retrieve an item by its ID
exports.getItemById = (id) => {
    return new Promise((resolve, reject) => {
        const item = items.find(item => item.id == id);
        if (item) {
            resolve(item);
        } else {
            reject('No result returned');
        }
    });
};

// New function to get published items by category
exports.getPublishedItemsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        const publishedItems = items.filter(item => item.published === true && item.category === category);
        if (publishedItems.length > 0) {
            resolve(publishedItems);
        } else {
            reject('No items found for this category');
        }
    });
};

// New function to add an item
exports.addItem = (itemData) => {
    return new Promise((resolve, reject) => {
        // Get the current date in YYYY-MM-DD format
        const currentDate = new Date().toISOString().split('T')[0]; // Example: "2024-11-17"

        // Add the itemDate to the new item
        itemData.itemDate = currentDate;

        itemData.id = items.length + 1; // Assign a new ID
        items.push(itemData); // Add item to array
        // Here you should ideally write the updated items back to the file
        file.writeFile('./data/items.json', JSON.stringify(items), (err) => {
            if (err) {
                reject('Unable to save item');
            } else {
                resolve(); // Item added successfully
            }
        });
    });
};
