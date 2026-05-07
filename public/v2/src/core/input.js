export class Input {
  constructor() {
    this.leftPressed = false;
    this.rightPressed = false;
    this.boostHeld = false;
    this.pausePressed = false;
    this.restartPressed = false;
    this.leftTap = false;
    this.rightTap = false;

    window.addEventListener('keydown', (event) => this.onKey(event, true));
    window.addEventListener('keyup', (event) => this.onKey(event, false));
  }

  onKey(event, pressed) {
    const key = event.key.toLowerCase();
    if (['arrowleft', 'arrowright', ' ', 'a', 'd'].includes(key)) event.preventDefault();
    if (key === 'arrowleft' || key === 'a') {
      if (pressed && !this.leftPressed) this.leftTap = true;
      this.leftPressed = pressed;
    }
    if (key === 'arrowright' || key === 'd') {
      if (pressed && !this.rightPressed) this.rightTap = true;
      this.rightPressed = pressed;
    }
    if (key === ' ') this.boostHeld = pressed;
    if (key === 'escape' && pressed && !event.repeat) this.pausePressed = true;
    if (key === 'r' && pressed && !event.repeat) this.restartPressed = true;
  }

  bindTouch(left, boost, right) {
    const bind = (element, start, end = start) => {
      element.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        element.setPointerCapture(event.pointerId);
        start(true);
      });
      element.addEventListener('pointerup', () => end(false));
      element.addEventListener('pointercancel', () => end(false));
    };

    bind(
      left,
      () => {
        this.leftTap = true;
        this.leftPressed = true;
      },
      (pressed) => {
        this.leftPressed = pressed;
      }
    );
    bind(
      right,
      () => {
        this.rightTap = true;
        this.rightPressed = true;
      },
      (pressed) => {
        this.rightPressed = pressed;
      }
    );
    bind(boost, (pressed) => {
      this.boostHeld = pressed;
    });
  }

  consume() {
    const snapshot = {
      leftTap: this.leftTap,
      rightTap: this.rightTap,
      boostHeld: this.boostHeld,
      pausePressed: this.pausePressed,
      restartPressed: this.restartPressed,
    };
    this.leftTap = false;
    this.rightTap = false;
    this.pausePressed = false;
    this.restartPressed = false;
    return snapshot;
  }
}
