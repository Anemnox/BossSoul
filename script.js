const WIDTH = 640;
const HEIGHT = 480;

const UP = {
	x: 0,
	y: -1
}

const WALLS = [
	{x: WIDTH / 2, y: 0, h: 5, w: WIDTH},
	{x: 0, y: HEIGHT / 2, h: HEIGHT, w: 5},
	{x: WIDTH / 2, y: HEIGHT, h: 5, w: WIDTH},
	{x: WIDTH, y: HEIGHT / 2, h: HEIGHT, w: 5},
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
	cooldowns: {
		dash: 0,
		dJump: 0
	}
}

let entityMap = {};
let entityGroup;

function preload() {

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

	let temp = new Sprite();
	temp.collider = "s";
	temp.h = 5;
	temp.w = 200;
	temp.y = 380;
	temp.friction = 0;
}

function worldSetUp() {
	world.gravity.y = 30;

	entityGroup = new Group();
}

function playerSetUp() {
	player.sprite = new Sprite();
	player.sprite.rotationLock = true;
	player.sprite.friction = 0;

	entityMap[player.sprite] = player;
	entityGroup.push(player.sprite);
}

function constructEntity() {
	return {
		health: 100,
		power: 10,
		speed: 5,
		jump: 12,
		sprite: null,
		cooldowns: {
			dash: 0,
			dJump: 0
		}
	}
}

function spawnSoul() {
	let soul = constructEntity();
	soul.sprite = new Sprite();
	soul.sprite.rotationLock = true;
	soul.sprite.friction = 0;
	soul.sprite.layer = 3;

	entityMap[soul.sprite] = soul;
	entityGroup.add(soul.sprite);
	return soul;
}









function setup() {
	let canvas = new Canvas(WIDTH, HEIGHT);
	canvas.parent("p5canvas");

	boundarySetUp();
	worldSetUp();

	playerSetUp();
	spawnSoul();
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
	Object.keys(entity.cooldowns).forEach((key) => {
		entity.cooldowns[key] -= dt;
		if (entity.cooldowns[key] < 0) {
			entity.cooldowns[key] = 0;
		}
	});
}

function move(entity, value) {
	entity.sprite.velocity.x = value;
}

function jump(entity) {
	if (isTouchingFloor(entity)) {
		entity.sprite.velocity.y = -entity.jump;
	} else if(!entity.cooldowns.dJump) {
		entity.sprite.velocity.y = -entity.jump;
		entity.cooldowns.dJump = BASE_CD.dJump;
	}
}

function dash(entity) {
	if (entity.sprite.velocity.x &&
			!entity.cooldowns.dash) {
		entity.sprite.velocity.x *= 20;
		entity.cooldowns.dash = BASE_CD.dash;
	}
}

function inputHandle() {
	if (kb.presses('up')) jump(player);
	
	if (kb.pressing('left')) move(player, -player.speed);
	else if (kb.pressing('right')) move(player, player.speed);
	else move(player, 0);

	if (kb.presses('j')) dash(player);

	if (kb.presses("g")) console.log(player.sprite);
}

function isTouchingFloor(entity) {
	let normals = getContactDirecton(entity);
	if(!normals) return false;
	for (let i = 0; i < normals.length; i++) {
		if(vectorAngleComp(UP, normals[i]) > 0.9) {
			return true;
		}
	}
	return false;
}

function getContactDirecton(entity) {
	let contacts = entity.sprite.body.m_contactList;
	if (!contacts) return null;
	let normals = [];
	do {
		normals.push(contacts.contact.v_normal);
		contacts = contacts.next;
	} while (contacts);
	return normals;
}

function vectorAngleComp(v1, v2) {
	return v1.x * v2.x + v1.y * v2.y;
}



function draw() {
	background("beige");

	updateAllEntities(1);

	inputHandle();
}
