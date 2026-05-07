import { Game } from './game/Game.js';

const canvas = document.getElementById('gameCanvas');
const game = new Game(canvas);

window.bananaWheelsV2 = game;
