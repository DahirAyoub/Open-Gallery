const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let artSchema = Schema({
    Title: {
        type: String,
        required: true
    },
    Artist : {
        type: Schema.Types.ObjectId,ref:'User',
        required: true
    },
    Year: {
        type: String,
        required: true
    },
    Category: {
        type: String,
        required: true
    },
    Medium: {
        type: String,
        required: true
    },
    Description: {
        type: String,
        required: true
    },
    Poster: {
        type: String,
        required: true
    },
    likes:{
        type:Number,
        default:0
    },
    review:[{
        type:Schema.Types.ObjectId,ref:'Review'
     }]
})

artSchema.methods.findArtworkReviews = function(){
    return this.model('Review').find({_id:{$in:this.review}}).select("reviewText username").exec()
}

artSchema.methods.findArtistName = function(){
    return this.model('User').find({_id:this.Artist}).select("username").exec();
}

artSchema.query.findArtistByName = function (name) {
    console.log("Calling findartistbyname query")
    return this.model('User').find({username: new RegExp(name,'i')}).exec();
}

module.exports = mongoose.model("Art",artSchema);