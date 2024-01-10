const mongoose = require("mongoose");


const Schema = mongoose.Schema;

let userSchema = Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password:{
        type:String,
        default:'default',
        required:true
    },
    loggedIn: Boolean,
    role: {
        type: String,
        enum: ['Patron', 'Artist'],
        default: 'Patron'
    },
    likedArtworks: [{ type: Schema.Types.ObjectId, ref: 'Art' }],
    followedArtists: [{ type: Schema.Types.ObjectId, ref: 'Artist' }],
    reviews:[{type:Schema.Types.ObjectId,ref:'Review'}],
    workshopEvents:[{type:Schema.Types.ObjectId,ref:'Workshop'}],
    followersCount: {type:Number,default:0},
    artworks: [{ type: Schema.Types.ObjectId, ref: 'Art' }], 
    artistWorkshops: [{ type: Schema.Types.ObjectId, ref: 'Workshop' }] 
});


//Query and Instance Methods

userSchema.methods.getFollowingList = function() {
    return this.model('User').find({ _id: { $in: this.followedArtists } }).select("_id username").exec(); 
};

userSchema.methods.getLikedArtworks = function() {
    const Art = this.model('Art');
    return Art.find({ _id: { $in: this.likedArtworks } }).exec();
};

userSchema.methods.getReviews = function() {
    const Review =this.model('Review');
    return Review.find({_id:{$in:this.reviews}}).exec();
}


userSchema.methods.getArtworks = function() {
    return this.model('Art').find({_id:{$in:this.artworks}}).exec();
}

userSchema.methods.getArtistWorkshops = function() {
    return this.model('Workshop').find({_id:{$in:this.artistWorkshops}}).exec();
}

userSchema.methods.getWorkshopEvents = function() {
    return this.model('Workshop').find({_id:{$in:this.workshopEvents}}).exec();
}




module.exports = mongoose.model("User",userSchema);