export class Item {
	/** @type {number} */
	id = 0;

	/** @type {string} */
	name = "";

	/** @type {number} */
	quantity = 1;
}

export class ItemDatabase {
	/** @type {Item[]} */
	#itemTemplates = [];

	item(index) {
		let src = this.#itemTemplates[index];
		let cpy = JSON.parse(JSON.stringify(src));
		return cpy;
	}
}

export class Inventory {
	/** @type {Object<number,Item>} */
	#inventory = {};

	/**
	 * @param {Item} item 
	 */
	add(item) {
		if (!this.exists(item.id))
			this.#inventory[item.id] = item;
		else
			this.#inventory[item.id].quantity += item.quantity;
	}

	/**
	 * @param {number} id 
	 */
	removeMatching(id) {
		delete this.#inventory[id];
	}

	/**
	 * @param {number} id 
	 * @return {boolean}
	 */
	exists(id) {
		return this.#inventory[id] != null;
	}

	/**
	 * @param {number} id 
	 * @return {number}
	 */
	count(id) {
		return this.#inventory[id].quantity;
	}

	/**
	 * @param {number} id 
	 * @param {number} count 
	 */
	use(id, count) {
		if (this.#inventory[id].quantity < count)
			throw "Used too many of the given item";
		else
			this.#inventory[id].quantity -= count;
	}
}