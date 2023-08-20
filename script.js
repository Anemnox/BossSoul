const WIDTH = 320;
const HEIGHT = 240;

const DEBUG_MODE = true;

const UP = {
	x: 0,
	y: -1
}

const WALLS = [
	{ x: WIDTH / 2, y: -5, h: 5, w: WIDTH },
	{ x: -5, y: HEIGHT / 2, h: HEIGHT, w: 5 },
	{ x: WIDTH / 2, y: HEIGHT + 5, h: 5, w: WIDTH },
	{ x: WIDTH + 5, y: HEIGHT / 2, h: HEIGHT, w: 5 },
]

const FLOOR = {
	x: WIDTH / 2, y: HEIGHT - 10, h: 20, w: WIDTH
}

const BASE_CD = {
	ROLL: 100,
	D_JUMP: 100,
}

const ANIMATIONS = {
	run: { row: 0, frames: 8 },
	jump: { row: 1, frames: 6, frameDelay: 8 },
	fall: { row: 1, col: 4, frames: 1},
	roll: { row: 2, frames: 5, frameDelay: 6 },
	turn: { row: 3, frames: 7 },
	stand: { row: 3, frames: 1 },
	attack: { row: 10, frames: 10 },
	die: { row: 14, frames: 7 }
}

const ACTIONS = {
	NONE: "NONE",
	ATTACK: "ATTACK",
	ROLL: "ROLL",
	DIE: "DIE"
}

const ACTION_DATA = {
	ATTACK: {actionTime: 20, duration: 10, cancelTime: 10, cancelable: true},
	ROLL: {cancelable: false}
}

let player;

let entityMap = {};
let entityGroup;

// Images
let playerImg;


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

	world.gravity.y = 30 * -UP.y;

	entityGroup = new Group();
}

function playerSetUp() {
	player = constructEntity();
	player.sprite.layer = 5;				// enemies are drawn behind player
}

function constructEntity() {
	let entity = {
		health: 100,
		power: 10,
		speed: 3,
		jump: 10,
		direction: 1,
		action: ACTIONS.NONE,
		actionTime: 0,
		sprite: null,
		attackHitbox: null,
		cooldowns: {
			ROLL: 0,
			D_JUMP: 0
		}
	}
	entity.sprite = new Sprite();
	entity.sprite.h = 32;
	entity.sprite.w = 32;
	entity.sprite.rotationLock = true;
	entity.sprite.friction = 0;

	//
	//	Initialize Animations
	//
	entity.sprite.anis.offset.x = 2;
	entity.sprite.anis.offset.y = -5;
	entity.sprite.anis.frameDelay = 4;

	entity.sprite.addAnis(playerImg, ANIMATIONS);

	// Set the player Collision box. Use sprite.debug = true to see the
	// Collision area
	entity.sprite.h = 20;
	entity.sprite.w = 16;
	entity.sprite.debug = DEBUG_MODE;

	// Scale your entity
	entity.sprite.scale = 2;

	entity.sprite.changeAni('stand');

	// Make sure that entities overlap each other
	let entities = Object.values(entityMap);
	for (let i = 0; i < entities.length; i++) {
		let e = entities[i];
		entity.sprite.overlaps(e.sprite);
	}

	entityMap[entity.sprite] = entity;
	entityGroup.add(entity.sprite);

	setupAttackHitbox(entity);
	return entity;
}

function setupAttackHitbox(entity) {
	entity.attackHitbox = new Sprite();
	entity.attackHitbox.w = 20;
	entity.attackHitbox.h = 10;
	entity.attackHitbox.mass = 0;
	entity.attackHitbox.visible = DEBUG_MODE;
	entity.attackHitbox.debug = DEBUG_MODE;

	entity.joint = new GlueJoint(entity.sprite, entity.attackHitbox);
	entity.joint.visible = DEBUG_MODE;
	updateHitbox(entity);
}

function updateHitbox(entity) {
	entity.joint.remove();
	entity.attackHitbox.x = (entity.sprite.x + (25 * entity.direction));
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

function spawnEnemy() {
	let enemy = constructEntity();
	enemy.sprite.layer = 1;				// enemies are drawn behind player

	return enemy;
}


// Entity Updates
function updateAllEntities(dt) {
	let entities = Object.values(entityMap);
	for (let i = 0; i < entities.length; i++) {
		let e = entities[i];
		updateEntity(e, dt);
	}
}

function updateEntity(entity, dt) {
	if (entity != player) soulAI(entity, dt);

	entity.actionTime += dt;
	Object.keys(entity.cooldowns).forEach((key) => {
		entity.cooldowns[key] -= dt;
		if (entity.cooldowns[key] < 0) {
			entity.cooldowns[key] = 0;
		}
	});
	handleEntityAction(entity, dt);
	handleEntityAnimation(entity, dt);
}

function handleEntityAnimation(entity, dt) {
	if (entity.action == ACTIONS.NONE) {
		if (isTouchingFloor(entity)) {
			if (entity.sprite.velocity.x != 0) {
				entity.sprite.changeAni("run");
			} else {
				entity.sprite.changeAni("stand");
			}
		} else {
			entity.sprite.changeAni("fall");
		}
	}
}

function handleEntityAction(entity, dt) {
	if (entity.action == ACTIONS.ROLL) {
		entity.sprite.velocity.x = normalizeScalar(
				entity.sprite.velocity.x
			) * entity.speed * 1.5;
	} else if (entity.action == ACTIONS.ATTACK) {
		let actionDat = ACTION_DATA[ACTIONS.ATTACK];

	}
}

function soulAI(soul, dt) {
	move(soul, -1);
}


//
//	Entity Actions
//

function attack(entity) {
	if(canDoAction(entity, ACTIONS.ATTACK)) {
		updateHitbox(entity);
		entity.action = ACTIONS.ATTACK;
		entity.actionTime = 0;

		entity.sprite.changeAni("attack").then(() => resetAction(entity));


		for(let i = 0; i < entityGroup.length; i++) {
			let e = entityGroup[i];
			if (entity.attackHitbox.overlapping(e)) {
				damage(entityMap[e], entity.power);
			}
		}
	}
}

function roll(entity) {
	if (entity.sprite.velocity.x && canDoAction(entity)) {
		entity.action = ACTIONS.ROLL;
		entity.cooldowns.ROLL = BASE_CD.ROLL;
		entity.actionTime = 0;

		entity.sprite.changeAni("roll").then(() => resetAction(entity));
	}
}

function resetAction(entity) {
	entity.action = ACTIONS.NONE;
}


function move(entity, value) {
	if(entity.action == ACTIONS.NONE) {
		if ((value > 0 || value < 0) && entity.direction != value) {
			entity.direction = value;
			entity.sprite.mirror.x = (value < 0);
		}
	}
	entity.sprite.velocity.x = value * entity.speed;
}

function jump(entity) {
	if (isTouchingFloor(entity)) {
		entity.sprite.velocity.y = entity.jump * UP.y;
	} else if (!entity.cooldowns.dJump) {
		entity.sprite.velocity.y = entity.jump * UP.y;
		entity.cooldowns.dJump = BASE_CD.dJump;
	}
}

function die(entity) {
	entity.action = ACTIONS.DIE;
	entity.sprite.changeAni("die");
	entity.sprite.ani.noLoop();
	entity.sprite.ani.play(0);
}

function revive(entity) {
	entity.action = ACTIONS.NONE;
	entity.sprite.ani.loop();
}


function damage(entity, amount) {
	entity.health -= amount;
}


function canDoAction(entity, action) {
	if (entity.action == ACTIONS.NONE) return true;
	if (entity.cooldowns[entity.action] > 0) return false;
	let actionDat = ACTION_DATA[entity.action];
	/*
	Something about the animations are not working
	actions are being cancelled but does not perform
	the action.
	if (actionDat.cancelable && 
		entity.actionTime <= actionDat.cancelTime) {
		entity.action = ACTIONS.NONE;
		return true;
	}*/

	return false;
}



function inputHandle() {
	if (kb.presses('up')) jump(player);

	if (kb.pressing('left')) move(player, -1);
	else if (kb.pressing('right')) move(player, 1);
	else move(player, 0);

	if (kb.presses('j')) roll(player);
	if (kb.presses('k')) attack(player);
	if (kb.presses('p')) die(player);

	if (kb.presses("g")) console.log(player.sprite);
}

function draw() {
	background("beige");
	if (player.action != ACTIONS.DIE) inputHandle();
	else if (kb.presses(';')) revive(player);

	updateAllEntities(1);
}

function isTouchingFloor(entity) {
	let normals = getContactDirecton(entity);
	if (!normals) return false;
	for (let i = 0; i < normals.length; i++) {
		if (vectorAngleComp(UP, normals[i]) > 0.9) {
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

function normalizeScalar(number) {
	if (!number) return 0;
	return Math.round(number / Math.abs(number));
}

function b_jump() {
	jump(player);
}

function b_move_left() {
	move(player, -1);
}

function b_move_right() {
	move(player, 1);
}

function b_attack() {
	attack(player);
}

function b_dash() {
	dash(player);
}
