const likedArtworkBtn=document.getElementById("liked-artwork");
const reviewedArtworkBtn = document.getElementById("reviews")
function getLikedArtworks(){
    let req = new XMLHttpRequest();
    req.onreadystatechange = function(){
        if(this.readyState==4){
            if(this.status==200){
                console.log("sent request to backend")
            }else{
                alert("An error occurred: " + this.statusText);
            }
        }
    }

    req.open("Get","/artwork/likedArtworks");
    req.send(JSON.stringify());
}

function getReviewedArtworks(){
    console.log("clicked review button")
    let req = new XMLHttpRequest();
    req.onreadystatechange = function(){
        if(this.readyState==4){
            if(this.status==200){
                console.log("sent request to backend")
            }else{
                alert("An error occurred: " + this.statusText);
            }
        }
    }

    req.open("Get","/artwork/reviewedArtworks");
    req.send(JSON.stringify());
}

document.getElementById('artist-account').addEventListener('change', function() {
    if(this.checked) {
        checkForArtworks();
    }
});

function checkForArtworks() {
    let req = new XMLHttpRequest();
    req.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            let hasArtworks = JSON.parse(this.responseText).hasArtworks;
            if(!hasArtworks) {
                window.location.href = '/addArtwork';
            } else {
                window.location.href = '/';
            }
        }
    }

    req.open("GET", "/User/checkArtworks");
    req.send();
}


likedArtworkBtn.addEventListener('click',getLikedArtworks);
likedArtworkBtn.addEventListener('click',getReviewedArtworks);