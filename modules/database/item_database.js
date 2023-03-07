import { Database, DatabaseEntry } from "./database.js";

/**
 * @extends {DatabaseEntry}
 */
 export class Item extends DatabaseEntry {
	/** @type {string} */
	name = "";

	/** @type {number} */
	quantity = 1;

	/**
	 * @param {number} id 
	 * @param {string} name 
	 * @param {number} [quantity] 
	 */
	constructor(id, name, quantity) {
		super(id);
		this.name = name;
		this.quantity = quantity || 1;
	}
}

/**
 * @extends {Database<Item>}
 */
export class ItemDatabase extends Database {
	/**
	 * @param {number} id 
	 * @returns {Item}
	 */
	item(id) {
		let src = this._entry(id);
		let cpy = JSON.parse(JSON.stringify(src));
		return cpy;
	}

	/**
	 * @param {number} id 
	 */
	name(id) {
		return this._entry(id).name;
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