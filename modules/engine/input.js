import { Vec2 } from "./vec2.js";
import { JSEvent } from "./event.js";

export class Input {
	/**
	 * @type {string}
	 */
	static #keyString = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

	/**
	 * @type {string}
	 */
	static #keyNumberStrings = "0123456789";

	/** @type {boolean} */
	static Left = false;
	/** @type {boolean} */
	static Right = false;
	/** @type {boolean} */
	static Up = false;
	/** @type {boolean} */
	static Down = false;
	/** @type {boolean} */
	static Enter = false;
	/** @type {boolean} */
	static Space = false;
	/** @type {boolean} */
	static Period = false;
	/** @type {boolean} */
	static Comma = false;
	/** @type {boolean} */
	static Slash = false;
	/** @type {boolean} */
	static Backslash = false;
	/** @type {boolean} */
	static Escape = false;
	/** @type {boolean} */
	static Delete = false;
	/** @type {boolean} */
	static Backspace = false;
	/** @type {boolean} */
	static Shift = false;
	/** @type {boolean} */
	static Capslock = false;
	/** @type {boolean} */
	static Tab = false;
	/** @type {boolean} */
	static Backquote = false;
	/** @type {boolean} */
	static Ctrl = false;
	/** @type {boolean} */
	static Alt = false;
	/** @type {boolean} */
	static Add = false;
	/** @type {boolean} */
	static Subtract = false;
	/** @type {boolean} */
	/** @type {boolean} */
	static Divide = false;
	/** @type {boolean} */
	static Multiply = false;
	/** @type {boolean} */
	static Decimal = false;
	/** @type {boolean} */
	static mouseIsDown = false;
	/** @type {Vec2} */
	static mousePosition = new Vec2();

	/** @type {Object<string,number>} */
	static keys = {
		/** @type {number} */
		Left: 37,
		/** @type {number} */
		Up: 38,
		/** @type {number} */
		Right: 39,
		/** @type {number} */
		Down: 40,
		/** @type {number} */
		Enter: 13,
		/** @type {number} */
		Space: 32,
		/** @type {number} */
		Period: 190,
		/** @type {number} */
		Comma: 188,
		/** @type {number} */
		Slash: 191,
		/** @type {number} */
		Backslash: 220,
		/** @type {number} */
		Escape: 27,
		/** @type {number} */
		Delete: 46,
		/** @type {number} */
		Backspace: 8,
		/** @type {number} */
		Shift: 16,
		/** @type {number} */
		Capslock: 20,
		/** @type {number} */
		Tab: 9,
		/** @type {number} */
		Backquote: 192,
		/** @type {number} */
		Ctrl: 17,
		/** @type {number} */
		Alt: 18,
		/** @type {number} */
		Add: 107,
		/** @type {number} */
		Subtract: 109,
		/** @type {number} */
		Divide: 111,
		/** @type {number} */
		Multiply: 106,
		/** @type {number} */
		Decimal: 110,
		/** @type {number} */
		A: 65,
		/** @type {number} */
		B: 66,
		/** @type {number} */
		C: 67,
		/** @type {number} */
		D: 68,
		/** @type {number} */
		E: 69,
		/** @type {number} */
		F: 70,
		/** @type {number} */
		G: 71,
		/** @type {number} */
		H: 72,
		/** @type {number} */
		I: 73,
		/** @type {number} */
		J: 74,
		/** @type {number} */
		K: 75,
		/** @type {number} */
		L: 76,
		/** @type {number} */
		M: 77,
		/** @type {number} */
		N: 78,
		/** @type {number} */
		O: 79,
		/** @type {number} */
		P: 80,
		/** @type {number} */
		Q: 81,
		/** @type {number} */
		R: 82,
		/** @type {number} */
		S: 83,
		/** @type {number} */
		T: 84,
		/** @type {number} */
		U: 85,
		/** @type {number} */
		V: 86,
		/** @type {number} */
		W: 87,
		/** @type {number} */
		X: 88,
		/** @type {number} */
		Y: 89,
		/** @type {number} */
		Z: 90,
	};

	/**
	 * Fired when a key has been pressed
	 * @type {JSEvent}
	 * @event
	 * @param {Number} keycode The code of the key that was pressed
	 */
	static keyDown = new JSEvent();

	/**
	 * Fired when a key has been released
	 * @type {JSEvent}
	 * @event
	 * @param {Number} keycode The code of the key that was pressed
	 */
	static keyUp = new JSEvent();

	/**
	 * Fired when the mouse button has been pressed
	 * @type {JSEvent}
	 * @event
	 */
	static mouseDown = new JSEvent();

	/**
	 * Fired when the mouse button has been released
	 * @type {JSEvent}
	 * @event
	 */
	static mouseUp = new JSEvent();

	/**
	 * Fired when the mouse has changed position
	 * @type {JSEvent}
	 * @event
	 * @param {Number} x The x position of the mouse after the update
	 * @param {Number} y The y position of the mouse after the update
	 */
	static mouseMove = new JSEvent();

	/**
	 * Fired when the mouse wheel has scrolled
	 * @type {JSEvent}
	 * @event
	 * @param {number} scrollCount The scroll count (direction)
	 */
	static wheelScroll = new JSEvent();

	/**
	 * @param {MouseEvent|TouchEvent} evt
	 */
	static #inputMousePosition(evt) {
		evt = evt || /** @type {MouseEvent|TouchEvent} */ (window.event);
		let isTouch =  evt.hasOwnProperty("clientX");
		Input.mousePosition.x = !isTouch
			? /** @type {MouseEvent} */ (evt).clientX
			: /** @type {TouchEvent} */ (evt).changedTouches[0].clientX;
		Input.mousePosition.y = !isTouch
			? /** @type {MouseEvent} */ (evt).clientY
			: /** @type {TouchEvent} */ (evt).changedTouches[0].clientY;
		Input.mouseMove.fire([Input.mousePosition.x, Input.mousePosition.y]);
	}

	/**
	 * 
	 */
	static #inputMouseDown() {
		Input.mouseIsDown = true;
		Input.mouseDown.fire([Input.mousePosition]);
	}

	/**
	 * 
	 */
	static #inputMouseUp() {
		Input.mouseIsDown = false;
		Input.mouseUp.fire();
	}

	/**
	 * 
	 */
	static #inputKeyDown(key) {
		if (Input.#setKeyDown(key)) {
			Input.keyDown.fire([key]);
		}
	}

	/**
	 * 
	 */
	static #inputKeyUp(key) {
		if (Input.#setKeyUp(key))
			Input.keyUp.fire([key]);
	}

	/**
	 * @param {Object} key
	 */
	static #setKeyDown(key) {
		for (let i = 0; i < Input.#keyString.length; i++) {
			if (key.keyCode === Input.keys[Input.#keyString[i]]) {
				if (this[Input.#keyString.charAt(i)]) {
					return false;
				}

				this[Input.#keyString.charAt(i)] = true;
				return true;
			}
		}
		for (let i = 0; i < Input.#keyNumberStrings.length; i++) {
			if (key.keyCode === Input.keys["Num" + Input.#keyNumberStrings[i]]) {
				if (this["Num" + Input.#keyNumberStrings.charAt(i)])
					return false;

				this["Num" + Input.#keyNumberStrings.charAt(i)] = true;
				return true;
			}
		}
		for (let i = 0; i < Input.#keyNumberStrings.length; i++) {
			if (key.keyCode === Input.keys["Numpad" + Input.#keyNumberStrings[i]]) {
				if (this["Numpad" + Input.#keyNumberStrings.charAt(i)])
					return false;

				this["Numpad" + Input.#keyNumberStrings.charAt(i)] = true;
				return true;
			}
		}
		let startVal = false;
		if (key.keyCode == Input.keys.Left) {
			startVal = Input.Left;
			Input.Left = true;
		} else if (key.keyCode == Input.keys.Right) {
			startVal = Input.Right;
			Input.Right = true;
		} else if (key.keyCode == Input.keys.Up) {
			startVal = Input.Up;
			Input.Up = true;
		} else if (key.keyCode == Input.keys.Down) {
			startVal = Input.Down;
			Input.Down = true;
		} else if (key.keyCode == Input.keys.Enter) {
			startVal = Input.Enter;
			Input.Enter = true;
		} else if (key.keyCode == Input.keys.Space) {
			startVal = Input.Space;
			Input.Space = true;
		} else if (key.keyCode == Input.keys.Period) {
			startVal = Input.Period;
			Input.Period = true;
		} else if (key.keyCode == Input.keys.Comma) {
			startVal = Input.Comma;
			Input.Comma = true;
		} else if (key.keyCode == Input.keys.Slash) {
			startVal = Input.Slash;
			Input.Slash = true;
		} else if (key.keyCode == Input.keys.Backslash) {
			startVal = Input.Backslash;
			Input.Backslash = true;
		} else if (key.keyCode == Input.keys.Escape) {
			startVal = Input.Escape;
			Input.Escape = true;
		} else if (key.keyCode == Input.keys.Backspace) {
			startVal = Input.Backspace;
			Input.Backspace = true;
		} else if (key.keyCode == Input.keys.Delete) {
			startVal = Input.Delete;
			Input.Delete = true;
		} else if (key.keyCode == Input.keys.Shift) {
			startVal = Input.Shift;
			Input.Shift = true;
		} else if (key.keyCode == Input.keys.Capslock) {
			startVal = Input.Capslock;
			Input.Capslock = true;
		} else if (key.keyCode == Input.keys.Tab) {
			startVal = Input.Tab;
			Input.Tab = true;
		} else if (key.keyCode == Input.keys.Backquote) {
			startVal = Input.Backquote;
			Input.Backquote = true;
		} else if (key.keyCode == Input.keys.Ctrl) {
			startVal = Input.Ctrl;
			Input.Ctrl = true;
		} else if (key.keyCode == Input.keys.Alt) {
			startVal = Input.Alt;
			Input.Alt = true;
		} else if (key.keyCode == Input.keys.Add) {
			startVal = Input.Add;
			Input.Add = true;
		} else if (key.keyCode == Input.keys.Subtract) {
			startVal = Input.Subtract;
			Input.Subtract = true;
		} else if (key.keyCode == Input.keys.Divide) {
			startVal = Input.Divide;
			Input.Divide = true;
		} else if (key.keyCode == Input.keys.Multiply) {
			startVal = Input.Multiply;
			Input.Multiply = true;
		} else if (key.keyCode == Input.keys.Decimal) {
			startVal = Input.Decimal;
			Input.Decimal = true;
		}
		return !startVal;
	}

	/**
	 * @param {Object} key
	 */
	static #setKeyUp(key) {
		for (let i = 0; i < Input.#keyString.length; i++) {
			if (key.keyCode === Input.keys[Input.#keyString[i]]) {
				if (!this[Input.#keyString.charAt(i)])
					return false;

				this[Input.#keyString.charAt(i)] = false;
				return true;
			}
		}
		for (let i = 0; i < Input.#keyNumberStrings.length; i++) {
			if (key.keyCode === Input.keys["Num" + Input.#keyNumberStrings[i]]) {
				if (!this["Num" + Input.#keyNumberStrings.charAt(i)])
					return false;

				this["Num" + Input.#keyNumberStrings.charAt(i)] = false;
				return true;
			}
		}
		for (let i = 0; i < Input.#keyNumberStrings.length; i++) {
			if (key.keyCode === Input.keys["Numpad" + Input.#keyNumberStrings[i]]) {
				if (!this["Numpad" + Input.#keyNumberStrings.charAt(i)])
					return false;

				this["Numpad" + Input.#keyNumberStrings.charAt(i)] = false;
				return true;
			}
		}
		let startVal = false;
		if (key.keyCode == Input.keys.Left) {
			startVal = Input.Left;
			Input.Left = false;
		} else if (key.keyCode == Input.keys.Right) {
			startVal = Input.Right;
			Input.Right = false;
		} else if (key.keyCode == Input.keys.Up) {
			startVal = Input.Up;
			Input.Up = false;
		} else if (key.keyCode == Input.keys.Down) {
			startVal = Input.Down;
			Input.Down = false;
		} else if (key.keyCode == Input.keys.Enter) {
			startVal = Input.Enter;
			Input.Enter = false;
		} else if (key.keyCode == Input.keys.Space) {
			startVal = Input.Space;
			Input.Space = false;
		} else if (key.keyCode == Input.keys.Period) {
			startVal = Input.Period;
			Input.Period = false;
		} else if (key.keyCode == Input.keys.Comma) {
			startVal = Input.Comma;
			Input.Comma = false;
		} else if (key.keyCode == Input.keys.Slash) {
			startVal = Input.Slash;
			Input.Slash = false;
		} else if (key.keyCode == Input.keys.Backslash) {
			startVal = Input.Backslash;
			Input.Backslash = false;
		} else if (key.keyCode == Input.keys.Escape) {
			startVal = Input.Escape;
			Input.Escape = false;
		} else if (key.keyCode == Input.keys.Backspace) {
			startVal = Input.Backspace;
			Input.Backspace = false;
		} else if (key.keyCode == Input.keys.Delete) {
			startVal = Input.Delete;
			Input.Delete = false;
		} else if (key.keyCode == Input.keys.Shift) {
			startVal = Input.Shift;
			Input.Shift = false;
		} else if (key.keyCode == Input.keys.Capslock) {
			startVal = Input.Capslock;
			Input.Capslock = false;
		} else if (key.keyCode == Input.keys.Tab) {
			startVal = Input.Tab;
			Input.Tab = false;
		} else if (key.keyCode == Input.keys.Backquote) {
			startVal = Input.Backquote;
			Input.Backquote = false;
		} else if (key.keyCode == Input.keys.Ctrl) {
			startVal = Input.Ctrl;
			Input.Ctrl = false;
		} else if (key.keyCode == Input.keys.Alt) {
			startVal = Input.Alt;
			Input.Alt = false;
		} else if (key.keyCode == Input.keys.Add) {
			startVal = Input.Add;
			Input.Add = false;
		} else if (key.keyCode == Input.keys.Subtract) {
			startVal = Input.Subtract;
			Input.Subtract = false;
		} else if (key.keyCode == Input.keys.Divide) {
			startVal = Input.Divide;
			Input.Divide = false;
		} else if (key.keyCode == Input.keys.Multiply) {
			startVal = Input.Multiply;
			Input.Multiply = false;
		} else if (key.keyCode == Input.keys.Decimal) {
			startVal = Input.Decimal;
			Input.Decimal = false;
		}
		return startVal;
	}

	/**
	 * @param {WheelEvent} evt
	 */
	static #wheelScroll(evt) {
		Input.wheelScroll.fire([evt.deltaY]);
	}

	/**
	 * Checks to see if the passed keyname matches a key that is currently being held down
	 * @param {String} keyname The name of the key to check
	 * @return Literal True if the letter is currently held down
	 */
	static isKeyDown(keyname) {
		return this[keyname.toUpperCase()];
	}

	/**
	 * Checks to see if the passed keyname matches a key that is currently released
	 * @param {String} keyname The name of the key to check
	 * @return Literal True if the letter is currently released
	 */
	static isKeyUp(keyname) {
		return !this[keyname.toUpperCase()];
	}

	/**
	 * Checks to see if the mouse button is currently being held down
	 * @return Literal True if the mouse button is currently held down
	 */
	static isMouseDown() {
		return Input.mouseIsDown;
	}

	/**
	 * Checks to see if the mouse button is currently released
	 * @return Literal True if the mouse button is currently released
	 */
	static isMouseUp() {
		return !Input.mouseIsDown;
	}

	static {
		document.onmousemove = Input.#inputMousePosition.bind(Input);
		document.onmousedown = Input.#inputMouseDown.bind(Input);
		document.onmouseup = Input.#inputMouseUp.bind(Input);
		document.onkeydown = Input.#inputKeyDown.bind(Input);
		document.onkeyup = Input.#inputKeyUp.bind(Input);
		document.onwheel = Input.#wheelScroll.bind(Input);

		// TODO:  Support game controllers
		window.addEventListener("gamepadconnected", function (e) {
			console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
				e.gamepad.index, e.gamepad.id, e.gamepad.buttons.length, e.gamepad.axes.length);
		});

		window.addEventListener("gamepaddisconnected", function (e) {
			console.log("Gamepad disconnected from index %d: %s", e.gamepad.index, e.gamepad.id);
		});
	}
}
