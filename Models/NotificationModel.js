const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let notificationSchema = Schema({
    artist:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    patrons:[{
        type:Schema.Types.ObjectId,
        ref:'User'
    }],
    event:{
        type:Schema.Types.ObjectId,
        ref:'Workshop'
    },
    notificationText:String
});

module.exports = mongoose.model("Notification",notificationSchema);