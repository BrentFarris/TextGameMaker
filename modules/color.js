export class Color {
	/** @type {number} */
	r = 255;

	/** @type {number} */
	g = 255;

	/** @type {number} */
	b = 255;

	/** @type {number} */
	a = 255;

	constructor(r, g, b, a) {
		this.r = r || 255;
		this.g = g || 255;
		this.b = b || 255;
		this.a = a || 255;
	}

	/**
	 * Converts this color object to a Canvas readable color string "rgba(r,g,b,a)" or "rgb(r,g,b)"
	 * @method
	 * @param {boolean} [noAlpha=true] Set to false if alpha should not be included "rgb(r,g,b)"
	 * @return {string} The Canvas readable color string
	 */
	toStandard(noAlpha) {
		if (noAlpha == null || !noAlpha)
			return "rgba(" + this.r + "," + this.g + "," + this.b + "," + this.a + ")";
		else
			return "rgb(" + this.r + "," + this.g + "," + this.b + ")";
	};
}