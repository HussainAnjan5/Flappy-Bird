// board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;
let pipeInterval; // will hold the interval ID for generating pipes
let highScore = localStorage.getItem("flappyHighScore") || 0;


// bird
let birdWidth= 34;
let birdHeight= 24; 
let birdX= boardWidth/8;
let birdY= boardHeight/2;
let birdImg;

let bird= {

    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight,

}
//pipes
let pipeArray = [];
let pipeWidth= 64;
let pipeHeight= 512;
let pipeX=  boardWidth;
let pipeY= 0;

let topPipeImg;
let bottomPipeImg;

// game physics
let velocityX= -2; 
let velocityY= 0;
let gravity = window.innerWidth < 600 ? 0.25 : 0.4;

let gameOver = false;
let score = 0;
let gameState = "start";

window.onload = function(){

    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); // used for drawing on the board
    
    // draw the bird
    // context.fillStyle = "green";
    // context.fillRect(bird.x, bird.y, bird.width, bird.height);

    // load image
    birdImg = new Image();
    birdImg.src = "./flappybird.png";
    birdImg.onload = function() {
       context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height  );
    }
     topPipeImg = new Image();
     topPipeImg.src = "./toppipe.png";

     bottomPipeImg= new Image();
     bottomPipeImg.src ="./bottompipe.png"

     requestAnimationFrame(update);
     document.addEventListener("keydown", moveBird);

// Touch control for mobile
document.addEventListener("touchstart", function(e){
    e.preventDefault(); // prevent scrolling on touch
    moveBird({ code: "Space" }); // simulate Space key press
});

}


function update(){
    requestAnimationFrame(update);  
    context.clearRect(0, 0, board.width, board.height);

    if (gameState === "start"){
        // Start screen
        context.fillStyle = "white";
        context.font = "30px Arial";
        context.textAlign = "center";
        context.fillText("FLAPPY BIRD", boardWidth/2, boardHeight/2 - 40);
        context.font = "20px Arial";
        context.fillText("Press Space or Up Arrow to Start", boardWidth/2, boardHeight/2 + 10);
        return;
    }

    if (gameOver){
        context.fillStyle = "red";          
        context.font = "20px Arial";       
        context.textAlign = "center";
        context.fillText("BETTER LUCK NEXT TIME", boardWidth/2, boardHeight/2);
        return;
    }

    // --- normal gameplay ---
    velocityY += gravity;
    bird.y += velocityY;

// check ground collision
if (bird.y + bird.height >= boardHeight) {
    bird.y = boardHeight - bird.height; // stop at ground
    gameOver = true;
}

// check ceiling (optional)
if (bird.y <= 0) {
    bird.y = 0;
}

// draw bird
context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);


    // pipes
    for (let i = 0;i <pipeArray.length; i++ ) {
        let pipe= pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);
        if (!pipe.passed && bird.x > pipe.x + pipe.width){
            score += 0.5;
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)){ 
            gameOver = true; 
            
            if (score > highScore) {
    highScore = Math.floor(score); 
    localStorage.setItem("flappyHighScore", highScore);
}

        }
    }

    // remove off-screen pipes
    while(pipeArray.length>0 && pipeArray[0].x< -pipeWidth){
        pipeArray.shift();
    }

    // current score
context.fillStyle = "white";
context.font = "40px Arial";
context.textAlign = "left";
context.fillText(Math.floor(score), 10, 50);
context.strokeStyle = "black";
context.lineWidth = 2;
context.strokeText(Math.floor(score), 10, 50);

// high score
context.fillStyle = "yellow";
context.font = "20px Arial";
context.fillText("High: " + highScore, 10, 80);
context.strokeStyle = "black";
context.lineWidth = 1;
context.strokeText("High: " + highScore, 10, 80);

}


function placePipes(){
    if (gameOver){
        return;
    }

    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    let openingSpace = board.height/4;


    let topPipe = {
        img : topPipeImg,
        x : pipeX,   
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }

    pipeArray.push(topPipe);

    let bottomPipe = {
        img : bottomPipeImg,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false 
    }
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
let jumpStrength = isMobile ? -5 : -6;

    if (e.code !== "Space" && e.code !== "ArrowUp" && e.code !== "KeyX") {
        return;
    }

    if (gameState === "start") {
        gameState = "playing";
        velocityY = jumpStrength;
        pipeInterval = setInterval(placePipes, 1500);
        return;
    }

    if (gameOver) {
        clearInterval(pipeInterval);
        pipeArray = [];
        bird.y = birdY;
        score = 0;
        gameOver = false;
        gameState = "start";
        return;
    }

    velocityY = jumpStrength;
}


function detectCollision(a,b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}
