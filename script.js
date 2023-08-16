const WIDTH = 640;
const HEIGHT = 480;

const UP = {
	x: 0,
	y: -1
}

const WALLS = [
	{x: WIDTH / 2, y: -5, h: 5, w: WIDTH},
	{x: -5, y: HEIGHT / 2, h: HEIGHT, w: 5},
	{x: WIDTH / 2, y: HEIGHT + 5, h: 5, w: WIDTH},
	{x: WIDTH + 5, y: HEIGHT / 2, h: HEIGHT, w: 5},
]

const BASE_CD = {
	dash: 100,
	dJump: 100,
}

let player = {
	health: 100,
	power: 10,
	speed: 5,
	jump: 12,
	sprite: null,
}

let entityMap = {};
let entityGroup;

// Images
let playerImg;
let hero;


function preload() {
	playerImg = loadImage("images/questKid.png");
}

function boundarySetUp() {
	for (let i = 0; i < WALLS.length; i++) {
		let data = WALLS[i];
		let wall = new Sprite();
		wall.x = data.x;
		wall.y = data.y;
		wall.w = data.w;
		wall.h = data.h;
		wall.color = "black";
		wall.collider = "static";
		wall.friction = 0;
	}
}

function worldSetUp() {
	allSprites.pixelPerfect = true;

	world.gravity.y = 30;

	entityGroup = new Group();
}

function playerSetUp() {
	player.sprite = new Sprite();
	player.sprite.h = 32;
	player.sprite.w = 32;
	player.sprite.debug = true;

	player.sprite.rotationLock = true;
	player.sprite.friction = 0;
	
	//
	//	Initialize Animations
	//
	player.sprite.anis.offset.x = 2;
	player.sprite.anis.offset.y = -4;
	player.sprite.anis.frameDelay = 8;

	player.sprite.addAnis(playerImg, {
		run: { row: 0, frames: 8 },
		jump: { row: 1, frames: 6 },
		roll: { row: 2, frames: 5, frameDelay: 14 },
		turn: { row: 3, frames: 7 },
		stand: { row: 3, frames: 1 }
	});
	player.sprite.anis.scale = 4;
	player.sprite.h = 32 * 3;
	player.sprite.w = 32;

	player.sprite.changeAni('run');
	entityMap[player.sprite] = player;
	entityGroup.push(player.sprite);
}

function constructEntity() {
	return {
		health: 100,
		power: 10,
		speed: 5,
		jump: 12,
		sprite: null
	}
}

function spawnEnemy() {
	let enemy = constructEntity();
	enemy.sprite = new Sprite();
	enemy.sprite.rotationLock = true;
	enemy.sprite.friction = 0;
	enemy.sprite.layer = 3;

	entityMap[enemy.sprite] = enemy;
	entityGroup.add(enemy.sprite);
	return enemy;
}









function setup() {
	let canvas = new Canvas(WIDTH, HEIGHT, 'pixelated');
	canvas.parent("p5canvas");

	boundarySetUp();
	worldSetUp();

	playerSetUp();
	spawnEnemy();
}

// Entity Actions
// move
// jump
function updateAllEntities(dt) {
	let entities = Object.values(entityMap);
	for (let i = 0; i < entities.length; i++) {
		let e = entities[i];
		updateEntity(e, dt);
	}
}

function updateEntity(entity, dt) {
	if (entity != player) enemyAI(entity, dt);
}

function enemyAI(enemy, dt) {
	move(enemy, -1);
}


//
//	Entity Actions: possible actions player or enemy can make
//
function attack(entity, direction) {

}

function move(entity, value) {
	entity.sprite.velocity.x = value;
}

function jump(entity) {
	entity.sprite.velocity.y = -entity.jump;
}

function handleInput() {
	if (kb.presses('up')) jump(player);
	
	if (kb.pressing('left')) move(player, -player.speed);
	else if (kb.pressing('right')) move(player, player.speed);
	else move(player, 0);


	if (kb.presses("g")) console.log(player.sprite);
}



function draw() {
	background("beige");

	updateAllEntities(1);

	handleInput();
}
