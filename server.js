const express = require('express');
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const Review = require("./Models/ReviewModel");
const User = require("./Models/UserModel");
const Art = require("./Models/ArtModel");
const Workshop = require("./Models/WorkshopModel");

app.set("views", path.join(__dirname, 'Views/pages'));
app.set("view engine","pug");
app.use(express.static('Public'));
app.use(express.json());
app.use(session({
    secret:"some secret key",
    resave:true,
    saveUninitialized:true
}))
// async function autoLoginTestUser(req, res, next) {
//     try {
//         if (!req.session.loggedin) {
//             const user = await User.findOne().where("username").equals('testuser');
//             if (user) {
//                 req.session.loggedin = true;
//                 req.session.user = user;
//             }
//         }
//         console.log(req.session)
//         next();
//     } catch (error) {
//         console.error('Error in autoLoginTestUser:', error);
//         next(); // Continue to next middleware
//     }
// }

// app.use(autoLoginTestUser);

app.use(express.urlencoded({extended:true}));

let artRouter = require("./Routers/artwork-router.js");
app.use("/artwork",artRouter);

let userRouter = require("./Routers/user-router.js");
app.use("/User",userRouter);

let workshopRouter = require("./Routers/workshop-router.js");
app.use("/workshop",workshopRouter);

let db = mongoose.connect('mongodb://127.0.0.1/Gallery');



app.get("/",home);
app.get("/search",searchForm);
app.get("/profile", async function(req, res) {
    try {
        console.log(req.session);
        const userId = req.session.user._id; 
        const user = await User.findById(userId) 
        await user.populate({
            path: "followedArtists",
            select: "username",
            model: 'User'
        });
        res.status(200).render("profile", { User: user });
    } catch (error) {
        console.log(error);
        res.status(500).send("An error occurred");
    }
});

async function home(req,res,next){
    const artArray = await Art.find().limit(3)
    res.status(200).render("index",{artArray,User:req.session.user});
}

function searchForm(req,res){
    res.status(200).render("search",{User:req.session.user})
}


app.post("/logout", async function logout(req,res,next){
    if(req.session.loggedin){
        let session = req.session;
        console.log(session);
        const userId = req.session.user._id; 
        const user = await User.findById(userId)
        user.loggedIn=false,
        user.save();
        req.session.destroy();
        console.log(req.session);
        res.redirect("/");
    }else {
		res.status(200).send("You cannot log out because you aren't logged in.");
	}
});


app.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if username and password are provided
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        // Check if the username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Assuming accountType is a field in your User schema
        const accountType = 'patron';

        // Create a new user
        const user = new User({ username, password, accountType,loggedIn:true });
        await user.save();
        
        req.session.loggedin = true;
        req.session.user = user;
        // Respond with success message
        res.redirect("/");
    } catch (error) {
        console.error('Error in registration:', error);
        res.status(500).json({ message: 'Error registering new user' });
    }
});

app.post("/login", login);
app.get("/login", sendLoginPage);
app.get("/register", sendRegisterPage);


async function login(req,res,next){
    if(req.session.loggedin){
        res.status(200).send("Already logged in.");
        return;
    }
    let username = req.body.username;
    let password = req.body.password;

    let user = await User.findOne().where("username").equals(username);
    if(!user){
        res.status(404).send("User not found");
        return;
    }
    if(user.password===password){
        req.session.loggedin = true;
        req.session.user = user;
        res.redirect('/')
    }else{
        res.status(401).send("Not authorized. Invalid password.");
    }
}

function sendLoginPage(req,res){
    res.status(200).render("loginpage",{User:req.session.user});
}

function sendRegisterPage(req,res){
    res.status(200).render("registerpage",{User:req.session.user});
}




async function run(){
    try{
        app.listen(3000);
        console.log("Server running on port 3000");
    }catch(error){
        console.log(error.message);
    }

}

run();
