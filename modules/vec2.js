export class Vec2 {
	/**
	* The x dimension of this vector
	* @type {number}
	*/
	x = 0;

	/**
	 * The y dimension of this vector
	 * @type {number}
	 */
	y = 0;

	/**
	 * 
	 * @param {number} [x] 
	 * @param {number} [y] 
	 */
	constructor(x, y) {
		this.x = x || 0;
		this.y = y || 0;
	}

	/**
	 * Copies the x and y dimension of a Vec2 to this one
	 * @param {number} x The value to assign to the x component
	 * @param {number} y The value to assign to the y component
	 */
	set(x, y) {
		if (x !== null)
			this.x = x;
		if (y !== null)
			this.y = y;
	}

	/**
	 * @param {Vec2} vec 
	 */
	assign(vec) {
		this.x = vec.x;
		this.y = vec.y;
	}

	/**
	 * Transposes this vector by another vector by shifting (adding)
	 * @param {Vec2} vector The vector to be added to this vector
	 */
	move(vector) {
		this.x += vector.x;
		this.y += vector.y;
	}

	/**
	 * Transposes this vector by a given x and y by shifting (adding)
	 * @param {number} x The value to add to the x component
	 * @param {number} y The value to add to the y component
	 */
	shift(x, y) {
		this.x += x;
		this.y += y;
	}

	/**
	 * Multiplies each component of this vector by the given value
	 * @param {number} value The value to multiply each component by
	 */
	times(value) {
		this.x *= value;
		this.y *= value;
	}

	/**
	 * Get's the magnitude (pythagorean theorem) of this vector (the length of the hypotenuse of the right triangle produced by this vector)
	 * @return {number} The length of the hypotenuse
	 */
	get magnitude() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	/**
	 * @returns {boolean} True if both the x and y coordinates are equal to zero
	 */
	get isZero() {
		return this.is(0, 0);
	}

	/**
	 * Get's the dot product of this vector and another
	 * @param {Vec2} vector The vector to be multiplied with this vector
	 * @return {number} The result of dot product (vector multiplication)
	 */
	dot(vector) {
		return this.x * vector.x + this.y * vector.y;
	}

	/**
	 * This will return a new normalized Vec2 of this vector
	 * @return {Vec2} The normalized Vec2
	 */
	get normalized() {
		let tmp = new Vec2(this.x, this.y);
		let mag = this.magnitude;
		tmp.x = tmp.x / mag;
		tmp.y = tmp.y / mag;
		return tmp;
	}

	/**
	 * Will get the distance between this vector and another supplied vector
	 * @param {Vec2} vector The vector to check the distance from
	 * @return {number} The distance between this Vec2 and the supplied Vec2
	 */
	distance(vector) {
		return Math.sqrt((vector.x - this.x) * (vector.x - this.x) + (this.y - vector.y) * (this.y - vector.y));
	}

	/**
	 * Will subtract this vector from another vector
	 * @param {Vec2} vector The vector to use as the difference of this
	 * @return {Vec2} The result of this vector subtracted by a supplied vector (in that order)
	 */
	difference(vector) {
		let vec = new Vec2();
		vec.set(this.x - vector.x, this.y - vector.y);
		return vec;
	}

	/**
	 * Will add this vector from another vector
	 * @method
	 * @param {Vec2} vector The vector to add with this vector
	 * @return {Vec2} The result of this vector added by a supplied vector
	 */
	sum(vector) {
		return new Vec2(this.x + vector.x, this.y + vector.y);
	}

	/**
	 * Will check if this vector's components are equal to the supplied vectors
	 * @method
	 * @param {Vec2} vector The vector to compare against
	 * @return {boolean} <c>true</c> if the x and y of both vectors are the same value otherwise <c>false</c>
	 */
	equals(vector) {
		if (!(vector instanceof Vec2)) {
			return false;
		}

		return this.x === vector.x && this.y === vector.y;
	}

	/**
	 * Will check if this vector's components are equal to the supplied x and y
	 * @method
	 * @param {number} x The x to compare against
	 * @param {number} y The y to compare against
	 * @return {boolean} <c>true</c> if the x and y of the vector is the supplied x and y otherwise <c>false</c>
	 */
	is(x, y) {
		return this.x === x && this.y === y;
	}

	/**
	 * Will check if this vector's components are equal to the supplied vectors
	 * @method
	 * @param {Vec2} vector The vector to compare against
	 * @param {number} length The magnitude to check against
	 * @return {boolean} True if the x and y of both vectors are within the length otherwise false
	 */
	closeTo(vector, length) {
		if (!length)
			length = 0.01;
		return this.distance(vector) <= length;
	}

	/**
	 * Will check if this vector's components are equal to the supplied x and y
	 * @method
	 * @param {number} x The x to compare against
	 * @param {number} y The y to compare against
	 * @param {number} length The magnitude to check against
	 * @return {boolean} True if the x and y are within the length otherwise false
	 */
	near(x, y, length) {
		if (!length)
			length = 0.01;
		return this.distance(new Vec2(x, y)) <= length;
	}
}