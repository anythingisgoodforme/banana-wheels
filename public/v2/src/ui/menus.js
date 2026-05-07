import { UPGRADE_DEFS, upgradeCost } from '../systems/progression.js';
import { formatCombo, formatScore } from './runSummary.js';

export class Menus {
  constructor(game) {
    this.game = game;
    this.refs = {
      menu: document.getElementById('menuOverlay'),
      pause: document.getElementById('pauseOverlay'),
      summary: document.getElementById('summaryOverlay'),
      upgrades: document.getElementById('upgradeOverlay'),
      score: document.getElementById('scoreText'),
      combo: document.getElementById('comboText'),
      boost: document.getElementById('boostText'),
      damage: document.getElementById('damageText'),
      best: document.getElementById('bestScoreText'),
      wallet: document.getElementById('walletText'),
      upgradeWallet: document.getElementById('upgradeWalletText'),
      upgradeList: document.getElementById('upgradeList'),
      summaryTitle: document.getElementById('summaryTitle'),
      summaryScore: document.getElementById('summaryScore'),
      summaryDistance: document.getElementById('summaryDistance'),
      summaryBananas: document.getElementById('summaryBananas'),
      summaryCombo: document.getElementById('summaryCombo'),
      mute: document.getElementById('muteToggle'),
      motion: document.getElementById('motionToggle'),
    };

    document.getElementById('startButton').addEventListener('click', () => game.startRun());
    document.getElementById('againButton').addEventListener('click', () => game.startRun());
    document.getElementById('resumeButton').addEventListener('click', () => game.resume());
    document.getElementById('restartButton').addEventListener('click', () => game.startRun());
    document.getElementById('upgradeButton').addEventListener('click', () => game.showUpgrades());
    document
      .getElementById('summaryUpgradeButton')
      .addEventListener('click', () => game.showUpgrades());
    document.getElementById('closeUpgradesButton').addEventListener('click', () => game.showMenu());
    this.refs.mute.addEventListener('change', () =>
      game.updateOption('muted', this.refs.mute.checked)
    );
    this.refs.motion.addEventListener('change', () =>
      game.updateOption('reducedMotion', this.refs.motion.checked)
    );
  }

  setOverlay(name) {
    ['menu', 'pause', 'summary', 'upgrades'].forEach((key) => {
      this.refs[key].classList.toggle('hidden', key !== name);
    });
  }

  updateHud(run) {
    this.refs.score.textContent = formatScore(run.scoring.score);
    this.refs.combo.textContent = formatCombo(run.scoring.combo);
    this.refs.boost.textContent = `${Math.round(run.player.boost)}%`;
    this.refs.damage.textContent = `${run.player.damage}/5`;
  }

  updateSave(save) {
    this.refs.best.textContent = formatScore(save.bestScore);
    this.refs.wallet.textContent = save.wallet.toLocaleString();
    this.refs.upgradeWallet.textContent = save.wallet.toLocaleString();
    this.refs.mute.checked = save.options.muted;
    this.refs.motion.checked = save.options.reducedMotion;
    this.renderUpgrades(save);
  }

  showSummary(summary) {
    this.refs.summaryTitle.textContent = summary.distance >= 1000 ? 'Legend Run' : 'Crashed Out';
    this.refs.summaryScore.textContent = formatScore(summary.score);
    this.refs.summaryDistance.textContent = `${summary.distance}m`;
    this.refs.summaryBananas.textContent = summary.bananas.toLocaleString();
    this.refs.summaryCombo.textContent = formatCombo(summary.bestCombo);
    this.setOverlay('summary');
  }

  renderUpgrades(save) {
    this.refs.upgradeList.innerHTML = '';
    UPGRADE_DEFS.forEach((upgrade) => {
      const level = save.upgrades[upgrade.id] || 0;
      const cost = upgradeCost(level);
      const card = document.createElement('article');
      card.className = 'upgrade-card';
      card.innerHTML = `
        <div>
          <h3>${upgrade.name} ${level}/5</h3>
          <p>${upgrade.description}</p>
        </div>
        <button type="button"${level >= 5 || save.wallet < cost ? ' disabled' : ''}>
          ${level >= 5 ? 'Max' : `${cost}`}
        </button>
      `;
      card
        .querySelector('button')
        .addEventListener('click', () => this.game.buyUpgrade(upgrade.id));
      this.refs.upgradeList.append(card);
    });
  }
}
