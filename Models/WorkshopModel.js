const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let workshopSchema = Schema({
    name:String,
    description:String,
    dateCreated:Date,
    poster:String,
    artist: { type: Schema.Types.ObjectId, ref: 'User' },  
    enrolled: [{ type: Schema.Types.ObjectId, ref: 'User' }]
})

workshopSchema.methods.getArtist = function(){
    return this.model('User').findById(this.artist).select("username").exec();
}                                     

module.exports = mongoose.model("Workshop",workshopSchema)