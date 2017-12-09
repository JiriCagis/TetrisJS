/*
	TetrisJS - retro brick game from 90 years developed by Jiri Caga 11.11.2017
*/

// global variables 
const canvas = document.getElementById("tetrisId");
const context = canvas.getContext("2d");
const arena = createMatrix(12,20)
const player = {
	pos: {x: 0, y: 0},
	matrix: null,
	score: 0
}

const colors = [
	null,
	"#FF0D72",
	"#0DC2FF",
	"#0DFF72",
	"red",
	"#FF8E0D",
	"#FFE138",
	"#3877FF"
]

let dropCounter = 0;
let dropInterval = 1000; // one second
let lastTime = 0;
let pause = false;




// functions 
context.scale(20,20);
playerReset();
updateScore();
update();

function update(time = 0){
	const deltaTime = time - lastTime;
	lastTime = time;
	
	dropCounter += deltaTime;
	if(dropCounter > dropInterval && !pause){
		playerDrop();
	}

	draw();
	requestAnimationFrame(update);
}

function draw(){
	// black background
	context.fillStyle = "#000";
	context.fillRect(0,0,canvas.width,canvas.height);

	// previous bricks
	drawMatrix(arena,{x:0,y:0});

	// player brick
	drawMatrix(player.matrix,player.pos);
}

function drawMatrix(matrix, offset){
	matrix.forEach((row,y) => {
		row.forEach((value,x) => {
			if(value!==0){
				context.fillStyle = colors[value];
				context.fillRect(x + offset.x ,
								 y + offset.y ,
								 1, 1); 
			}
		})
	});
}

document.addEventListener("keydown", event => {
	const ENTER_KEY_CODE = 13;
	const LEFT_KEY_CODE = 37;
	const RIGHT_KEY_CODE = 39;
	const DOWN_KEY_CODE = 40;
	const P_KEY_CODE = 80;

	console.log(event.keyCode);

	switch(event.keyCode){
		case LEFT_KEY_CODE: // move player brick to left 
			playerMove(-1)
			break;
		case RIGHT_KEY_CODE: // move player brick to right
			playerMove(1); 
			break;
		case DOWN_KEY_CODE: // fast move down player brick
			playerDrop();
			break;
		case ENTER_KEY_CODE: // rotate brick
			playerRotate();
			break;
		case P_KEY_CODE: // pause game
			pauseGame();
			break;
	}
});

canvas.addEventListener('click', function(event) {
	  const mousePos = getMousePos(canvas, event);
	  const areaHeight = canvas.scrollHeight / 3;
	  const areaWidth = canvas.scrollWidth / 2;

	  //rotate
	  if(mousePos.y > 0 && mousePos.y < areaHeight){
	  	playerRotate();
	  }

	  // left right direction
	  if(mousePos.y > areaHeight && mousePos.y < (areaHeight *2)){
	  	if(mousePos.x < areaWidth){
	  		playerMove(-1);
	  	} else {
	  		playerMove(1);
	  	}
	  }

	  // drop
	  if(mousePos.y > (areaHeight *2)){
	  	playerDrop();
	  }
});

function playerMove(dir){
	if(pause){
		return;
	}

	player.pos.x += dir;
	if ( collide(arena,player)){
		player.pos.x -= dir;
	}
}

function playerDrop(){
	if(pause){
		return;
	}
	
	player.pos.y++;
	if (collide(arena, player)){
		player.pos.y--;
		merge(arena, player);
		playerReset();
		arenaSweep();
		updateScore();
		if(dropInterval>0){
			dropInterval -= 5;
		}
	}
	dropCounter = 0;
}

function playerRotate(){
	if(pause){
		return;
	}

	const pos = player.pos.x;
	let offset = 1;
	rotate(player.matrix,1);
	while(collide(arena,player)){
		player.pos.x += offset;
		offset = - (offset + (offset > 0 ? 1 : -1));
		if(offset > player.matrix[0].length){
			rotate(player.matrix, -1);
			player.pos.x = pos;
		}
	}
}

function pauseGame(){
	pause = !pause;
}

function playerReset(){
	const pieces = "ILJOTSZ";
	player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
	player.pos.y = 0;
	player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length /2 | 0);

	if(collide(arena,player)){
		alert("Game over !!!\n Your score is: " + player.score, "game");
		arena.forEach(row => row.fill(0));
		player.score = 0;
		dropInterval = 1000;
		updateScore();
	}
}

function collide(arena, player){
	const [m, o] = [player.matrix, player.pos];
	for (let y = 0; y < m.length; y++){
		for (let x = 0; x < m[y].length; x++){
			if (m[y][x] !== 0 && ( 
				arena [y + o.y] &&
				arena [y + o.y] [x + o.x]) !== 0){
					return true;
				}
		}
	}

	return false;
}

function arenaSweep(){
	let rowCount = 1 ;
	outer: for(let y = arena.length - 1; y > 0; y--){
		for(let x = 0; x < arena[y].length; x++){
			if(arena[y][x] === 0){
				continue outer;
			}
		}

		const row = arena.splice(y,1)[0].fill(0);
		arena.unshift(row);
		y++;

		player.score += rowCount * 10;
		rowCount *= 2;


	}
}

function merge(arena, player){
	player.matrix.forEach((row,y) => {
		row.forEach((value,x) => {
			if( value !== 0){
				arena[y + player.pos.y][x + player.pos.x] = value;
			}
		})
	})
}

/**
Rotate = traspose + reverse
transpose... convert all rows into columns
reverse... reverse each row
*/
function rotate(matrix,dir){
	for(let y = 0; y < matrix.length; ++y){
		for (let x = 0; x < y; ++x){
			[
				matrix[x][y],
				matrix[y][x],
			] = 
			[
				matrix[y][x],
				matrix[x][y],
			];
		}
	}

	if(dir > 0){
		matrix.forEach(row => row.reverse());
	} else{
		matrix.reverse();
	}
}

function createMatrix(w,h){
	let matrix = [];
	while(h--) {
		matrix.push( new Array(w).fill(0));
	}
	return matrix;
}

function createPiece(type){
	switch(type){
		case "I":
			return [
						[0,1,0,0],
						[0,1,0,0],
						[0,1,0,0],
						[0,1,0,0]
					];
		case "L":
			return [
						[0,2,0],
						[0,2,0],
						[0,2,2]
					];
		case "J": 
			return [
						[0,3,0],
						[0,3,0],
						[3,3,0]
					];
		case "O":
			return [	
						[4,4],
						[4,4]
					];
		case 'Z':
			return [
						[5,5,0],
						[0,5,5],
						[0,0,0]
					];
		case 'S':
			return [
						[0,6,6],
						[6,6,0],
						[0,0,0]
					];
		case "T": 
			return [
						[0,7,0],
						[7,7,7],
						[0,0,0]
					];
	}
}

function updateScore(){
	document.getElementById("scoreId").innerText = player.score;
}

function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
        };
      }