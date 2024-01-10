const mongoose = require("mongoose");
const Art = require("../Models/ArtModel.js");
const User = require("../Models/UserModel.js");
const Review = require("../Models/ReviewModel.js");
const express = require("express");
let router = express.Router();

router.get("/",loadArtworks,sendArtWorks);
router.get("/likedArtworks",loadArtworks,sendLikedArtworks);
router.get("/reviewedArtworks",loadArtworks,sendReviewArtworks);
router.get("/addArtwork",sendSingleArtworkPage);

router.post("/artwork",addArtwork);
router.post("/addLike/:id",addLike);
router.post("/removeLike/:id",removeLike);
router.post("/addReview/:id",addReview);

router.get("/:id",sendSingleArtwork);


router.param("id",async function(req,res,next,value){
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return res.status(404).send("Artwork ID " + value + " is not a valid ID.");
    }

    try{
        let result = await Art.findById(value)
        .populate({ 
            path: 'Artist', 
            select: 'username',
            model: 'User' 
        });
        if(!result){
            res.status(404).send("Artwork ID "+value + " does not exist.");
            return;
        }
        req.artwork = result
        next();
        
    }catch(error){
        console.log(error.message);
        res.status(500).send("Error reading artwork.");
    }
})

async function sendSingleArtwork(req, res) {
    req.artwork.reviews = await req.artwork.findArtworkReviews();
    console.log(req.session.user.likedArtworks);
    console.log(req.artwork._id.toString());
    console.log(req.session.user.likedArtworks.includes(req.artwork._id.toString()))
    res.status(200).render("artwork", { artwork: req.artwork, reviews: req.artwork.reviews ,User:req.session.user});
}

async function loadArtworks(req, res, next) {
    let params = [];
    for (let prop in req.query) {
        if (prop === "page") {
            continue;
        }
        params.push(prop + "=" + req.query[prop]);
    }
    req.qstring = params.join("&");
    let query = Art.find();
   
    
    try {
		req.query.page = req.query.page || 1;
		req.query.page = Number(req.query.page);
		if (req.query.page < 1) {
			req.query.page = 1;
		}
	} catch {
		req.query.page = 1;
	}
    
    if (req.query.Title) {
        query = query.where("Title").regex(new RegExp(".*" + req.query.Title + ".*", "i"));
    }
    
    if (req.query.Artist) {

        try {
        
            const artistUser = await Art.find().findArtistByName(req.query.Artist).exec();
            if (artistUser && artistUser.length > 0) {
                query = query.where("Artist", artistUser[0]._id);
            }
        } catch (error) {
            res.status(500).send("Error reading artist information");
            console.log(error.message);
            return;
        }
    
    }
    
    if (req.query.Category) {
        query = query.where("Category").regex(new RegExp(".*" + req.query.Category + ".*", "i"));
    }


    // console.log(query);
    let startIndex = ((req.query.page - 1) * 10);
    

    try {
        let results = await query
            .populate({ 
                path: 'Artist', 
                select: 'username',
                model: 'User' 
            })
            .limit(10)
            .skip(startIndex)
            .exec();
        
        res.artwork = results;
        next();
        
    } catch (error) {
        res.status(500).send("Error reading artworks");
        console.log(error.message);
    }
}

function sendArtWorks(req, res, next) {
    
    res.render("artworks", { artworks: res.artwork, qstring: req.qstring, current: req.query.page, found:res.artwork.length ,User:req.session.user});
}

async function sendLikedArtworks(req,res,next) {
    const userId = req.session.user._id; 
    const user = await User.findById(userId)
    const likedArtworks = await user.getLikedArtworks();
    res.artwork=likedArtworks;
    console.log(res.artwork);
    console.log("trying to render the page!")
    res.render("artworks", { artworks: res.artwork, qstring: req.qstring, current: req.query.page, found:res.artwork.length ,User:req.session.user});
}

async function sendReviewArtworks(req,res,next) {
    const userId = req.session.user._id; 
    const user = await User.findById(userId)
    const reviewedArtworks = await user.getReviews();
    console.log(reviewedArtworks);
    res.render("artworks", { artworks: res.artwork, qstring: req.qstring, current: req.query.page, found:res.artwork.length ,User:req.session.user});
}

async function sendSingleArtworkPage(req, res) {
    req.artwork.reviews = await req.artwork.findArtworkReviews();
    console.log(req.artwork.reviews); // Add this line to log the reviews
    res.status(200).render("artwork", { artwork: req.artwork, reviews: req.artwork.reviews ,User:req.session.user});
}


async function addArtwork(req,res,next){
    try {
        const userId = req.session.user._id; 
        const user = await User.findById(userId);
        
        const newArtwork = new Artwork({
            _id:mongoose.Schema.ObjectId,
            Title: req.body.Title,
            Artist: userId, 
            Year: req.body.Year,
            Category: req.body.Category,
            Medium: req.body.Medium,
            Description: req.body.Description,
            Poster: req.body.Poster
        });
        user.artworks.push(newArtwork._id);
        await newArtwork.save();
        await user.save();
        res.redirect(`https://http://localhost:3000/artwork/${newArtwork._id}`);
        
    } catch (error) {
        res.status(400).send({ message: "Error creating artwork", error: error.message });
    }

}

async function addLike(req, res, next){
    try{
        
        if (!req.session || !req.session.user) {
            return res.status(401).send({ message: "Please log in to like artwork" });
        }

        const artworkId = req.params.id;
        const userId = req.session.user._id; 

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        const artwork = await Art.findById(artworkId);
        if (!artwork) {
            return res.status(404).send({ message: "Artwork not found" });
        }

       
        artwork.likes += 1;
        user.likedArtworks.push(artworkId);

        await artwork.save();
        await user.save();
        req.session.user = user;

        res.status(201).send();
    }catch(error){
        console.error('Error in adding like:', error);
        res.status(400).send({ message: "Error adding like", error: error.message });
    }
}

async function removeLike(req,res,next){
    try{
        if (!req.session || !req.session.user) {
            return res.status(401).send({ message: "Please log in to like artwork" });
        }

        const artworkId = req.params.id;
        const userId = req.session.user._id; 

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        const artwork = await Art.findById(artworkId);
        if (!artwork) {
            return res.status(404).send({ message: "Artwork not found" });
        }
        artwork.likes-=1
        delete user.likedArtworks[user.likedArtworks.indexOf(artworkId.toString())];

        await artwork.save();
        await user.save();
        req.session.user = user;

        res.status(201).send();
    }catch(error){
        console.error('Error in removing like:', error);
        res.status(400).send({ message: "Error removing like", error: error.message });
    }
}

async function addReview(req, res, next){
    try{
        const artworkId = req.params.id;
        const userId = req.session.user._id; 

        const artwork = await Art.findById(artworkId);
        const user = await User.findById(userId);

        if (!artwork || !user) {
            return res.status(404).send({ message: "Artwork or User not found" });
        }
        console.log(req.body);
        const newReview = new Review({
            art: artworkId,
            user: userId,
            username: user.username,
            reviewText: req.body.reviewText 
        });

        artwork.review.push(newReview._id); 
        user.reviews.push(newReview._id); 

        await newReview.save();
        await artwork.save();
        await user.save();

        res.status(201).send();
    } catch(error) {
        res.status(400).send({ message: "Error adding review", error: error.message });
    }
}


module.exports = router;