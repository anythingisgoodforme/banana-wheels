(function () {
  const keys = new Set();
  const pressed = new Set();
  const touch = {
    left: false,
    right: false,
    brake: false,
    boost: false,
  };

  const keyMap = {
    ArrowLeft: "left",
    KeyA: "left",
    ArrowRight: "right",
    KeyD: "right",
    ArrowUp: "up",
    KeyW: "up",
    ArrowDown: "brake",
    KeyS: "brake",
    ShiftLeft: "boost",
    ShiftRight: "boost",
  };

  function bindHoldButton(id, name) {
    const button = document.getElementById(id);
    if (!button) return;

    const setActive = (event, active) => {
      event.preventDefault();
      touch[name] = active;
    };

    button.addEventListener("pointerdown", (event) => setActive(event, true));
    button.addEventListener("pointerup", (event) => setActive(event, false));
    button.addEventListener("pointercancel", (event) => setActive(event, false));
    button.addEventListener("pointerleave", (event) => setActive(event, false));
  }

  window.addEventListener("keydown", (event) => {
    const browserShortcut = event.metaKey || event.ctrlKey;
    if (!browserShortcut && (keyMap[event.code] || event.code === "Space" || event.code === "KeyP" || event.code === "Escape" || event.code === "Enter")) {
      event.preventDefault();
    }
    if (!keys.has(event.code)) pressed.add(event.code);
    keys.add(event.code);
  });

  window.addEventListener("keyup", (event) => {
    keys.delete(event.code);
  });

  bindHoldButton("leftButton", "left");
  bindHoldButton("rightButton", "right");
  bindHoldButton("brakeButton", "brake");
  bindHoldButton("boostButton", "boost");

  window.CarGameInput = {
    isDown(action) {
      return touch[action] || Array.from(keys).some((code) => keyMap[code] === action);
    },
    wasPressed(code) {
      return pressed.has(code);
    },
    clear(code) {
      pressed.delete(code);
    },
  };
})();
