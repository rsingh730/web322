/*********************************************************************************
WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
No part of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name:Ranjot Singh
Student ID: 129254231
Date: 13-10-2024
Vercel Web App URL: https://web322-kappa.vercel.app/
GitHub Repository URL:https://github.com/rsingh730/web322.git

********************************************************************************/ 
const file = require('fs');
var items = [];
var categories = [];

exports.initialize = () => {

    // items
    return new Promise ((resolve, reject) => {
        file.readFile('./data/items.json', (err,data) => {
            if (err) {
                reject ('Unable to read the File');
            }
            else {
                items = JSON.parse(data);
            }
        });
    // Categories
        file.readFile('./data/categories.json', (err,data)=> {
            if (err) {
                reject ('Unable to read the File');
            }
            else {
                categories = JSON.parse(data);
            }
        })
        
         resolve();
    })
} 

exports.getPublishedItems = () => {
    return new Promise((resolve, reject) => {
        const publishedItems = items.filter(item => item.published === true);
        if (publishedItems.length === 0) {
            reject('no published items found');
        } else {
            resolve(publishedItems);
        }
    });
};

exports.getAllCategories = () => {
    return new Promise((resolve, reject) => {
        if (categories.length === 0) {
            reject('no results returned');
        } else {
            resolve(categories);
        }
    });
};

exports.getAllItems = () => {
    return new Promise((resolve, reject) => {
        if (items.length === 0) {
            reject('no results returned');
        } else {
            resolve(items);
        }
    });
};

