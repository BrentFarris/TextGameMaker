/**
 * The event class is responsible for registering multiple events to one function call
 * @class
 */
export class JSEvent {
	/**
	 * The list of events to be fired when "Fire" is called
	 * @type {Object<Function, Object>[]}
	 */
	#events = [];

	/**
	 * Registers events to this objects event array to be called
	 * @param {Function} evt The function to be called
	 * @param {Object} [obj=window] The object that the function belongs to
	*/
	register(evt, obj) {
		this.#events.push([evt, !obj ? window : obj]);
	}

	/**
	 * Removes a specified function signature from the array
	 * @param {Function} event
	 */
	remove(event) {
		for (let i = 0; i < this.#events.length; i++) {
			if (this.#events[i][0] === event) {
				this.#events.splice(i, 1);
				break;
			}
		}
	}

	/**
	 * Goes through all of the registered events and fires them off
	 * @method
	 * @param {Object[]} [args] All of the arguments to be mapped to the events (functions)
	 */
	fire(args) {
		for (let i = 0; i < this.#events.length; i++) {
			this.#events[i][0].apply(this.#events[i][1], args);
		}
	}

	/**
	 * Clears out all the callbacks associated with this event
	 */
	clear() {
		this.#events.length = 0;
	}
}