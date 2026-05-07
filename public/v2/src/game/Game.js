import { Storage } from '../core/storage.js';
import { Input } from '../core/input.js';
import { Loop } from '../core/loop.js';
import { Camera } from '../render/camera.js';
import { Renderer } from '../render/Renderer.js';
import { RunController } from './RunController.js';
import { GameState } from './GameState.js';
import { Menus } from '../ui/menus.js';
import { upgradeCost } from '../systems/progression.js';

export class Game {
  constructor(canvas) {
    this.storage = new Storage();
    this.save = this.storage.load();
    this.input = new Input();
    this.camera = new Camera();
    this.renderer = new Renderer(canvas, this.camera);
    this.run = new RunController(this.save);
    this.state = GameState.Menu;
    this.menus = new Menus(this);
    this.menus.updateSave(this.save);
    this.menus.setOverlay('menu');

    this.input.bindTouch(
      document.getElementById('touchLeft'),
      document.getElementById('touchBoost'),
      document.getElementById('touchRight')
    );

    this.loop = new Loop(
      (dt) => this.update(dt),
      () => this.render()
    );
    this.loop.start();
  }

  startRun() {
    this.state = GameState.Playing;
    this.run.start();
    this.menus.setOverlay('none');
  }

  resume() {
    this.state = GameState.Playing;
    this.menus.setOverlay('none');
  }

  showMenu() {
    this.state = GameState.Menu;
    this.menus.updateSave(this.save);
    this.menus.setOverlay('menu');
  }

  showUpgrades() {
    this.state = GameState.Upgrades;
    this.menus.updateSave(this.save);
    this.menus.setOverlay('upgrades');
  }

  updateOption(key, value) {
    this.save.options[key] = value;
    this.storage.save(this.save);
    this.menus.updateSave(this.save);
  }

  buyUpgrade(id) {
    const level = this.save.upgrades[id] || 0;
    if (level >= 5) return;
    const cost = upgradeCost(level);
    if (this.save.wallet < cost) return;
    this.save.wallet -= cost;
    this.save.upgrades[id] = level + 1;
    this.storage.save(this.save);
    this.menus.updateSave(this.save);
  }

  update(dt) {
    const input = this.input.consume();

    if (input.pausePressed && this.state === GameState.Playing) {
      this.state = GameState.Paused;
      this.menus.setOverlay('pause');
      return;
    }

    if (input.restartPressed && this.state === GameState.Playing) {
      this.startRun();
      return;
    }

    if (this.state !== GameState.Playing) return;

    this.run.update(dt, input);
    this.camera.update(dt, this.run.player, this.save.options.reducedMotion);
    if (this.run.player.invulnerable > 0.76) this.camera.hit();

    if (this.run.complete) {
      this.finishRun();
    }
  }

  finishRun() {
    const summary = this.run.summary();
    this.state = GameState.RunComplete;
    this.save.wallet += summary.bananas;
    this.save.bestScore = Math.max(this.save.bestScore, summary.score);
    this.storage.save(this.save);
    this.menus.updateSave(this.save);
    this.menus.showSummary(summary);
  }

  render() {
    this.renderer.render(this.run, this.save);
    this.menus.updateHud(this.run);
  }
}
