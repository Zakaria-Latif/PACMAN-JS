import { LEVEL, OBJECT_TYPE } from './setup';
import { randomMovement } from './ghostMove';

// Classes
import GameBoard from './GameBoard';
import Pacman from './Pacman';
import Ghost from './Ghosts';

// Sounds
import soundDot from './sounds/munch.wav';
import soundPill from './sounds/pill.wav';
import soundGameStart from './sounds/game_start.wav';
import soundGameOver from './sounds/death.wav';
import soundGhost from './sounds/eat_ghost.wav';

// DOM Elements
const gameGrid = document.querySelector('#game');
const scoreTable = document.querySelector('#score');
const startButton = document.querySelector('#start-button');

// Game Constants
const POWER_PILL_TIME = 10000; // ms
const GLOBAL_SPEED = 80; // ms
const gameBoard =  GameBoard.createGameBoard(gameGrid, LEVEL);

// Initial Setup
let score = 0 ;
let timer = null;
let gameWin = false;
let PowerPillActive = false;
let PowerPillTimer = null;

function gameOver(pacman, grid) {
    playAudio(soundGameOver);
    document.removeEventListener('keydown', e => pacman.handleKeyInput(e, gameBoard.objectExist));
    gameBoard.showGameStatus(gameWin);
    clearInterval(timer);
    startButton.classList.remove('hide');
    
}

function checkCollision(pacman, ghosts) {
    const collidedGhost = ghosts.find( ghost => pacman.pos === ghost.pos);

    if(collidedGhost) {
        // pacman eats ghost
        if(pacman.powerPill) {
            playAudio(soundGhost);
            gameBoard.removeObject(collidedGhost.pos, [ OBJECT_TYPE.GHOST, OBJECT_TYPE.SCARED, collidedGhost.name]);
            collidedGhost.pos = collidedGhost.startPos;
            score +=100;
        } else {
            gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.PACMAN]);
            gameBoard.rotateDiv(pacman.pos, 0);
            gameOver(pacman, gameGrid);
            
        }
    }
}

function gameLoop(pacman, ghosts) {
    gameBoard.moveCharacter(pacman);
    checkCollision(pacman, ghosts);

    ghosts.forEach((ghost) => gameBoard.moveCharacter(ghost));
    checkCollision(pacman, ghosts);

    // Check if Pacman eats a dot
    if (gameBoard.objectExist(pacman.pos, OBJECT_TYPE.DOT)) {
        playAudio(soundDot);

        gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.DOT]);
        gameBoard.dotCount--;
        score +=10;
    }
    // Check if Pacman eats a powerpill
    if (gameBoard.objectExist(pacman.pos, OBJECT_TYPE.PILL)) {
        playAudio(soundPill);

        gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.PILL]);

        pacman.powerPill = true;
        score += 50;

        clearTimeout(PowerPillTimer);
        PowerPillTimer = setTimeout(() => (pacman.powerPill = false), POWER_PILL_TIME );
    }

    // Change ghost scare mode depening on Powerpill
    if (pacman.powerPill !== PowerPillActive) {
        PowerPillActive = pacman.powerPill;
        ghosts.forEach((ghost) => (ghost.isScared = pacman.powerPill));
    }

    // check if all dots have been eaten
    if (gameBoard.dotCount === 0) {
        gameWin = true;
        gameOver(pacman, ghosts);
    }

    // Show the score
    scoreTable.innerHTML = score;
}

// Audio
function playAudio(audio) {
    const soundEffect = new Audio(audio);
    soundEffect.play();
}

function startGame() {
    playAudio(soundGameStart);

    gameWin = false;
    PowerPillActive = false;
    score = 0;

    startButton.classList.add('hide');

    gameBoard.createGrid(LEVEL);

    const pacman = new Pacman(2, 287);
    gameBoard.addObject(287, [OBJECT_TYPE.PACMAN]);
    document.addEventListener('keydown', (e) => pacman.handleKeyInput(e, gameBoard.objectExist));

    const ghosts = [
        new Ghost(5, 188, randomMovement, OBJECT_TYPE.BLINKY),
        new Ghost(4, 209, randomMovement, OBJECT_TYPE.PINKY),
        new Ghost(3, 230, randomMovement, OBJECT_TYPE.INKY),
        new Ghost(2, 251, randomMovement, OBJECT_TYPE.CLYDE)
    ]

    timer = setInterval(() => gameLoop(pacman, ghosts), GLOBAL_SPEED);
}

// Initialize Game
startButton.addEventListener('click', startGame);