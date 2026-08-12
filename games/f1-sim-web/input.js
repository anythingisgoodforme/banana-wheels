export function createInput() {
  const keys = new Set();
  let pausedToggle = false;

  const onKeyDown = (event) => {
    if (event.code.startsWith("Arrow") || event.code === "Space" || event.code === "Escape") {
      event.preventDefault();
    }
    keys.add(event.code);
  };

  const onKeyUp = (event) => {
    keys.delete(event.code);
  };

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  return {
    get throttle() {
      return keys.has("ArrowUp") ? 1 : 0;
    },
    get brake() {
      return keys.has("ArrowDown") ? 1 : 0;
    },
    get steerTarget() {
      const left = keys.has("ArrowLeft") ? -1 : 0;
      const right = keys.has("ArrowRight") ? 1 : 0;
      return left + right;
    },
    consumeReset() {
      if (keys.has("Space")) {
        keys.delete("Space");
        return true;
      }
      return false;
    },
    consumePauseToggle() {
      const pressed = keys.has("Escape");
      if (pressed && !pausedToggle) {
        pausedToggle = true;
        return true;
      }
      if (!pressed) {
        pausedToggle = false;
      }
      return false;
    },
    destroy() {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    },
  };
}
