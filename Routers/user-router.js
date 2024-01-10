const mongoose = require("mongoose");
const User = require("../Models/UserModel.js");
const express = require("express");
let router = express.Router();



router.get("/:id",sendArtistPage);
router.param("id",async function(req,res,next,value) {
    if(!mongoose.Types.ObjectId.isValid(value)){
        return res.status(404).send("User ID " + value + " is not a valid ID.");
    }

    try{
        let user = await User.findById(value);
        
        if(!user){
            return res.status(404).send("Artist ID "+value+" does not exist.");
        }
        
        let artworks = await user.getArtworks();
        let workshops = await user.getArtistWorkshops();
        
        req.artist = user;
        req.artworks = artworks;
        req.workshops = workshops;
        next();
    } catch(error){
        console.log(error);
        console.log(error.message);
        res.status(500).send("Error reading user.");
    }
})

function sendArtistPage(req,res){
    res.status(200).render("artistpage",{artworks:req.artworks,artist:req.artist,workshops:req.workshops,User:req.session.user});
}

router.get('/checkArtworks', async (req, res) => {
    if(!req.session || !req.session.user) {
        return res.status(401).send({ message: "User not logged in" });
    }

    try {
        const user = await User.findById(req.session.user._id).populate('artworks');
        const hasArtworks = user.artworks && user.artworks.length > 0;
        res.send({ hasArtworks });
    } catch (error) {
        res.status(500).send({ message: "Server error", error: error.message });
    }
});



module.exports = router;