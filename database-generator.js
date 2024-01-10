const mongoose = require("mongoose");
const User = require("./Models/UserModel");
const Art = require("./Models/ArtModel");

const gallery = require("./processed_gallery.json");

function readData() {
    let usersMap = new Map(); // Using a map to store users by username
    let artworksList = [];

    for (const art of gallery) {
        let user;
        if (usersMap.has(art.Artist)) {
            // If the user (artist) already exists, use the existing user
            user = usersMap.get(art.Artist);
        } else {
            // If the user (artist) does not exist, create a new user and add to the map
            user = new User({
                _id: new mongoose.Types.ObjectId(),
                username: art.Artist,
                password: "default",
                loggedIn: false,
                role: 'Artist',
                followersCount: 0,
                artworks: [] // Initialize artworks array
            });
            usersMap.set(art.Artist, user);
        }
        const artwork = new Art({
            _id: new mongoose.Types.ObjectId(),
            Title: art.Title,
            Artist: user._id, // Link artwork to user's _id
            Year: art.Year,
            Category: art.Category,
            Medium: art.Medium,
            Description: art.Description, // Changed from art.Category to art.Description
            Poster: art.Poster,
            likes: 0
        });

        user.artworks.push(artwork._id); // Link the artwork to the user
        artworksList.push(artwork);
    }

    return { usersList: Array.from(usersMap.values()), artworksList };
}

mongoose.connect('mongodb://127.0.0.1/Gallery');
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', async function () {
    try {
        const { usersList, artworksList } = readData();

        await mongoose.connection.dropDatabase();
        console.log("Dropped database. Starting re-creation.");

        await Promise.all(usersList.map(user => user.save()));
        console.log("All users saved.");

        await Promise.all(artworksList.map(art => art.save()));
        console.log("All artwork saved.");
    } catch (error) {
        console.error("An error occurred:", error);
        await mongoose.disconnect();
    } finally {
        await mongoose.disconnect();
        console.log("Database connection closed.");
    }
});
