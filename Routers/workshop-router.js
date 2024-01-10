const mongoose = require("mongoose");
const Workshop = require("../Models/WorkshopModel");
const express = require("express");
const  Art  = require("./artwork-router");
let router = express.Router();

router.get("/addWorkshop",sendAddWorkshopPage);

router.post("/workshop",addWorkshop);


router.get("/:id",sendWorkshopPage);

router.param("id",async function(req,res,next,value){
    if(!mongoose.Types.ObjectId.isValid(value)){
        return res.status(404).send("Workshop ID " + value + " is not a valid ID.");
    }

    try{
        let workshop = await Workshop.findById(value).populate(
            {
            path:"enrolled",
            select:"username",
            model:'User'
        });
        
        if(!workshop){
            return res.status(404).send("Workshop ID "+value+" does not exist.");
        }
        
        let artist = await workshop.getArtist()
        
        req.workshop = workshop;
        req.artist = artist;
        next();
    } catch(error){
        console.log(error);
        console.log(error.message);
        res.status(500).send("Error reading workshop.");
    }
})

function sendWorkshopPage(req,res){
    res.status(200).render("workshop",{workshop:req.workshop,artist:req.artist,User:req.session.user});
}

function sendAddWorkshopPage(req,res){
    res.status(200).render("addWorkshop"),{User:req.session.user};
}

async function addWorkshop(req,res){
    try {
        const userId = req.session.user._id; 
        const user = await User.findById(userId);
        const newWorkshop = new Workshop({
            _id:mongoose.Schema.ObjectId,
            name: req.body.Name,
            description: req.body.Description,
            dateCreated: new Date(), 
            poster: req.body.Poster,
        });

        user.artistWorkshops.push(newWorkshop._id);

        await newWorkshop.save();
        await user;
        res.redirect(`https://http://localhost:3000/workshop/${newWorkshop._id}`)
    } catch (error) {
        res.status(400).send({ message: "Error adding workshop", error: error.message });
    }
}

module.exports = router