const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let reviewSchema = Schema({
    art:{
        type: Schema.Types.ObjectId,ref:'Art'
    },
    user:{
        type:Schema.Types.ObjectId,ref:'User'
    },
    username:String,
    reviewText:String
});

module.exports = mongoose.model("Review",reviewSchema);