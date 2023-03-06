import { Optional } from "./std.js";
import { Vec2 } from "./vec2.js";
import { JSEvent } from "./event.js";

/**
 * An object to manage a HTML5 <Canvas> element
 * @class
 */
export class Canvas {
	/**
	 * This is the actual Canvas element in the document 
	 * @type {HTMLCanvasElement}
	 */
	elm;

	/** @type {number} */
	animationRequestId = 0;

	/**
	 * The context which is required to get anything showing up 
	 * @type {Optional<CanvasRenderingContext2D>}
	*/
	context = new Optional();

	/** @type {Vec2} */
	viewScale = new Vec2(1, 1);

	/**
	 * Fires at the beginning this objects <a href="web2d.canvas.html#method_Draw">Draw</a> function before the <a href="web2d.canvas.html#event_Draw">drawing</a> event fires
	 * @event
	 */
	updating = new JSEvent();

	/**
	 * Fires whenever this objects <a href="web2d.canvas.html#method_Draw">Draw</a> function is called
	 * @event
	 * @param {Canvas} canvas This canvas element
	 */
	drawing = new JSEvent();

	/**
	 * @event
	 * @param {Canvas} canvas This canvas element
	 */
	lateDrawing = new JSEvent();

	/** @type {Date} */
	#lastTime = new Date();

	/** @type {number} */
	deltaTime = 0;

	/**
     * @param {HTMLElement|null} elm The Canvas element on the page to reference
     * @param {!number} [widthPercent] The width scale factor of the Canvas (if null uses default width set in the Canvas tag)
     * @param {!number} [heightPercent] The height scale factor of the Canvas (if null uses default height set in the Canvas tag)
     */
	constructor(elm, widthPercent, heightPercent) {
		if (!elm)
            throw "The Canvas id passed was not valid";
		if (typeof elm !== "object" || elm.tagName !== "CANVAS")
			throw "The Canvas id passed was not a Canvas element";
		this.elm = /** @type {HTMLCanvasElement} */ (elm);
		this.context.Value = this.elm.getContext("2d");
		if (widthPercent != null) {
			let width = this.elm.parentElement?.clientWidth;
			if (!width && this.elm.parentElement)
				width = parseFloat(this.elm.parentElement.style.width);
			if (!width)
				width = document.body.clientWidth;
			this.elm.width = width * widthPercent;
		}
		if (heightPercent != null) {
			let height = this.elm.parentElement?.clientHeight;
			if (!height && this.elm.parentElement)
				height = parseFloat(this.elm.parentElement.style.height);
			if (!height)
				height = document.body.clientHeight;
			this.elm.height = height * heightPercent;
		}
		this.elm.style.width = this.elm.width + "px";
        this.elm.style.height = this.elm.height + "px";
		if (!this.context.HasValue) {
			let err = "The Canvas element does not have a valid context";
			console.error(err);
			alert(err);
		}
	}

	/**
	 * Gets the width of the canvas element
	 * @return {number}
	 */
	get width() {
		return this.elm.width;
	}

	/**
	 * Sets the width of the canvas and the width of the canvas element
	 * @param {number} val
	 */
	set width(val) {
		this.elm.width = val;
		this.elm.style.width = val + "px";
	}

	/**
	 * Gets the height of the canvas element
	 * @return {number}
	 */
	get height() {
		return this.elm.height;
	}

	/**
	 * Sets the height of the canvas and the height of the canvas element
	 * @param {number} val
	 */
	set height(val) {
		this.elm.height = val;
		this.elm.style.height = val + "px";
	}

	/**
	 * Calls all of the events registered to <a href="web2d.canvas.html#event_drawing">drawing</a> event on this Canvas object 
	*/
	draw() {
		let now = new Date();
		this.deltaTime = (now - this.#lastTime) / 1000;
		this._lastTime = now;
		this.updating.fire([this.deltaTime]);
		this.drawing.fire([this]);
		this.lateDrawing.fire([this]);
	}

	/**
	 * Calls the web2d.canvas#resize and the web2d.canvas#scale method internally
	 * @method
	 * @param {number} baseWidth The base width to be multiplied by the ratio
	 * @param {number} baseHeight The base height to be multiplied by the ratio
	 * @param {number} ratio The ratio to scale to
	 */
	scaleAndResize(baseWidth, baseHeight, ratio) {
		this.resize(baseWidth * ratio, baseHeight * ratio);
		this.scale(ratio, ratio);
	}

	/**
	 * Resizes the canvas to a given size
	 * @method
	 * @param {number} width The width to resize to
	 * @param {number} height The height to resize to
	 */
	resize(width, height) {
		if (typeof width === "string")
			width = parseFloat(width);
		if (typeof height === "string")
			height = parseFloat(height);
		if (this.elm.width === width && this.elm.height === height)
			return;
		this.elm.width = width;
		this.elm.height = height;
		this.elm.style.width = width + "px";
		this.elm.style.height = height + "px";
	}

	/**
	 * This will scale the canvas up without resizing the canvas. It only scales up everything that is being drawn (1, 1) is default (2, 2) would be 2x the size of default
	 * @method
	 * @param {Number} x The scale for the x-axis
	 * @param {Number} y The scale for the y-axis
	 */
	scale(x, y) {
		let ctx = this.context.Value;
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.scale(x, y);
		this.viewScale.x = x;
		this.viewScale.y = y;
	}

	translate(x, y) {
		let ctx = this.context.Value;
		ctx.translate(x, y);
	}

	/**
	 * @param {Canvas} canvas 
	 */
	static updateRequestId(canvas) {
		if (canvas.animationRequestId === 0 || !canvas.context.HasValue)
			return;
		let ctx = canvas.context.Value;
		canvas.animationRequestId = window.requestAnimationFrame(() => {
			ctx.clearRect(0, 0, canvas.width * (1 / canvas.viewScale.x), canvas.height * (1 / canvas.viewScale.y));
			ctx.save();
			canvas.draw();
			ctx.restore();
			this.updateRequestId(canvas);
		});
	}

	/**
	 * @param {Canvas} canvas 
	 */
	static start(canvas) {
		canvas.animationRequestId = -1;
		this.updateRequestId(canvas);
	}

	/**
	 * @param {Canvas} canvas 
	 */
	static stop(canvas) {
		if (canvas.animationRequestId) {
			window.cancelAnimationFrame(canvas.animationRequestId);
			canvas.animationRequestId = 0;
		}
	}
}