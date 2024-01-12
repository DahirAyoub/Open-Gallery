const likeBtn =document.getElementById('like-btn');

likeBtn.addEventListener('click', function()  {
    let itemId = window.location.href.split('/')[4];
    let req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 201) {
            window.location.reload();
        } else if (this.readyState == 4) {
            alert("An error occurred: " + this.statusText);
        }
    };
    if (likeBtn.textContent ==='Like'){
        req.open("POST", "/artwork/addLike/" + itemId); 
    }else{
        req.open("POST", "/artwork/removeLike/" + itemId); 
    }
    req.setRequestHeader("Content-Type", "application/json");
    req.send();
});


document.getElementById('post-btn').addEventListener('click', function() {
    let reviewTextElements = document.getElementsByName('review');
    let reviewText = reviewTextElements.length > 0 ? reviewTextElements[0].value : '';
    console.log(reviewText);
    if(reviewText===""){
        alert("Please enter a non-empty review.");
        return;
    }

    let itemId = window.location.href.split('/')[4];
    
    let req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 201) {
            window.location.reload();
        } else if (this.readyState == 4) {
            alert("An error occurred: " + this.statusText);
        }
    };
    req.open("POST", "/artwork/addReview/" + itemId);
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify({ review: reviewText }));
});
