/*********************************************************************************
WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
No part of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Jaimil Vaghela
Student ID: 123128233
Date: 09-10-2024
Vercel Web App URL: https://web322-kappa.vercel.app/
GitHub Repository URL: https://github.com/jsvaghela1/web322.git

********************************************************************************/ 

const express = require('express'); // "require" the Express module
const app = express(); // obtain the "app" object
const HTTP_PORT = process.env.PORT || 8080; // assign a port
const path = require('path'); // adding the path 
const dataserver = require(__dirname +'/store-service.js');
app.use(express.static('public'));


// To send request of redirect default page
app.get('/',(req,res)=>{

    res.redirect('/about');
    
})
// To send request of shop
app.get('/shop', (req, res) => {
    dataserver.getPublishedItems()
    .then((data) => {
        res.json(data); // Send published items data
    })
    .catch((err) => {
        res.json({ message: err });
    });
});
// To send request of About
app.get('/about',(req,res)=>{

    res.sendFile(path.join(__dirname, './views/about.html'));

})


// To send categories if necessary
app.get('/categories',function(req,res){
    dataserver.getAllCategories()
    .then((data)=>{
        console.log("All Items Json");
        res.json(data);
    })
    .catch((err)=>{
        console.log(err);
        res.json(err);
    })

});

app.get('/items',function(req,res){
    dataserver.getAllItems()
    .then((data)=>{
        console.log("All Items Json");
        res.json(data);
    })
    .catch((err)=>{
        console.log(err);
        res.json(err);
    })

});

app.use((req, res) => {
    res.status(404).send("Page Not Found");
});


//initialize server
dataserver.initialize()
    .then(() => {
        console.log("Server initialized");
        app.listen(HTTP_PORT, () => {
            console.log(`Express http server listening on port http://localhost:${HTTP_PORT}`);
        });
    })
    .catch((err) => {
        console.log(err);
    });