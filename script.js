const WIDTH = 640;
const HEIGHT = 480;

const DEBUG_MODE = true;

const WALLS = [
	{x: WIDTH / 2, y: -5, h: 5, w: WIDTH},
	{x: -5, y: HEIGHT / 2, h: HEIGHT, w: 5},
	{x: WIDTH / 2, y: HEIGHT + 5, h: 5, w: WIDTH},
	{x: WIDTH + 5, y: HEIGHT / 2, h: HEIGHT, w: 5},
]

const FLOOR = {
	x: WIDTH /2, y: HEIGHT - 20, h: 20, w: WIDTH
}

//
//	Character Animation Data
//
const ANIMATIONS = {
	run: { row: 0, frames: 8 },
	jump: { row: 1, frames: 6, frameDelay: 8 },
	roll: { row: 2, frames: 5, frameDelay: 14 },
	turn: { row: 3, frames: 7 },
	stand: { row: 3, frames: 1 },
	attack: { row: 10, frames: 10}
}

let player = constructEntity();

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
	let floor = new Sprite();
	floor.x = FLOOR.x;
	floor.y = FLOOR.y;
	floor.w = FLOOR.w;
	floor.h = FLOOR.h;
	floor.color = "green";
	floor.collider = "static";
	floor.friction = 0;

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

	player.sprite.rotationLock = true;
	player.sprite.friction = 0;
	player.sprite.layer = 10; // player is drawn in front of enemy
	
	//
	//	Initialize Animations
	//
	player.sprite.anis.offset.x = 2;
	player.sprite.anis.offset.y = -5;
	player.sprite.anis.frameDelay = 4;

	// Adding Animations based on ANIMATIONS constant
	player.sprite.addAnis(playerImg, ANIMATIONS);
	
	// Set the player Collision box. Use sprite.debug = true to see the
	// Collision area
	player.sprite.h = 20;
	player.sprite.w = 16;
	player.sprite.debug = DEBUG_MODE;

	// Scale your player
	player.sprite.scale = 4;

	player.sprite.changeAni('stand');
	entityMap[player.sprite] = player;
	entityGroup.push(player.sprite);

	// Setup attackhitbox
	setupAttackHitbox(player);
}

function constructEntity() {
	return {
		health: 100,
		power: 10,
		speed: 5,
		jump: 12,
		direction: 1,
		sprite: null,
		attackHitbox: null
	}
}

function spawnEnemy() {
	let enemy = constructEntity();
	enemy.sprite = new Sprite();
	enemy.sprite.h = 32;
	enemy.sprite.w = 32;
	enemy.sprite.rotationLock = true;
	enemy.sprite.friction = 0;
	enemy.sprite.layer = 1;				// enemies are drawn behind player

	//
	//	Initialize Animations
	//
	enemy.sprite.anis.offset.x = 2;
	enemy.sprite.anis.offset.y = -5;
	enemy.sprite.anis.frameDelay = 4;

	enemy.sprite.addAnis(playerImg, ANIMATIONS);
	
	// Set the player Collision box. Use sprite.debug = true to see the
	// Collision area
	enemy.sprite.h = 20;
	enemy.sprite.w = 16;
	enemy.sprite.debug = DEBUG_MODE;

	// Scale your player
	enemy.sprite.scale = 4;

	enemy.sprite.changeAni('stand');

	// Make sure that entities overlap each other
	let entities = Object.values(entityMap);
	for (let i = 0; i < entities.length; i++) {
		let e = entities[i];
		enemy.sprite.overlaps(e.sprite);
	}

	entityMap[enemy.sprite] = enemy;
	entityGroup.add(enemy.sprite);
	return enemy;
}

function setupAttackHitbox(entity) {
	entity.attackHitbox = new Sprite();
	entity.attackHitbox.w = 40;
	entity.attackHitbox.h = 20;
	entity.attackHitbox.x = (entity.sprite.x + (50 * entity.direction));
	entity.attackHitbox.y = entity.sprite.y;
	entity.attackHitbox.mass = 0;
	entity.attackHitbox.visible = DEBUG_MODE;
	entity.attackHitbox.debug = DEBUG_MODE;

	entity.joint = new GlueJoint(entity.sprite, entity.attackHitbox);
	entity.joint.visible = DEBUG_MODE;
}

function updateHitbox(entity) {
	entity.joint.remove();
	entity.attackHitbox.x = (entity.sprite.x + (50 * entity.direction));
	entity.joint = new GlueJoint(entity.sprite, entity.attackHitbox);
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
	//move(enemy, -1);
}


//
//	Entity Actions: possible actions player or enemy can make
//
function attack(entity) {
	updateHitbox(entity);
	entity.sprite.changeAni(["attack", 'stand']);

	entity.attackHitbox.overlaps(entityGroup, handleAttack);
}

function handleAttack(source, receiver) {
	console.log(source);
	console.log(receiver);
}

function move(entity, value) {
	// Setting the animation based on movement
	// if the sprite is standing or running
	if(entity.sprite.ani.name == 'stand' || entity.sprite.ani.name == 'run') {
		if (value > 0 || value < 0) {
			entity.sprite.changeAni("run");
			if(entity.direction != value) {
				entity.direction = value;
				entity.sprite.mirror.x = (value < 0);
			}
		} else {
			entity.sprite.changeAni("stand");
		}
	}
	entity.sprite.velocity.x = value * entity.speed;
}

function jump(entity) {
	entity.sprite.changeAni(['jump', 'stand']);
	entity.sprite.velocity.y = -entity.jump;
}

function handleInput() {
	if (kb.presses('up')) jump(player);
	
	if (kb.pressing('left')) move(player, -1);
	else if (kb.pressing('right')) move(player, 1);
	else move(player, 0);

	if (kb.presses("j")) attack(player);
	if (kb.presses("g")) console.log(player.sprite);
}



function draw() {
	background("beige");

	updateAllEntities(1);

	handleInput();
}
