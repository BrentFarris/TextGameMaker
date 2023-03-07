import { each } from "../engine/std.js";

/**
 * @class
 * @abstract
 */
export class DatabaseEntry {
	/** @type {number} */
	id = 0;

	/**
	 * @param {number} id 
	 */
	constructor(id) {
		this.id = id;
	}
}

/**
 * @class
 * @abstract
 * @template {DatabaseEntry} T 
 */
export class Database {
	/** @type {Object<number,T>} */
	#entries = {};

	/** @type {KnockoutObservableArray<T>} */
	entryView = ko.observableArray();

	/**
	 * @return {number}
	 */
	get Count() {
		let count = 0;
		each(this.#entries, (key, val) => count++);
		return count;
	}

	/**
	 * @return {number}
	 */
	get NextId() {
		let id = 0;
		each(this.#entries, (key, val) => id = Math.max(id, val.id));
		return id + 1;
	}

	/**
	 * @param {T} entry 
	 */
	add(entry) {
		this.#entries[entry.id] = entry;
		this.entryView.push(entry);
	}

	/**
	 * @param {T[]} entries 
	 */
	addMany(entries) {
		for (let i = 0; i < entries.length; ++i)
			this.add(entries[i]);
	}

	/**
	 * @param {T} entry 
	 */
	remove(entry) {
		delete this.#entries[entry.id];
		this.entryView.remove(entry);
	}

	/**
	 * @return {T[]}
	 */
	asArray() {
		/** @type {T[]} */
		let arr = [];
		each(this.#entries, (key, val) => arr.push(val));
		return arr;
	}

	/**
	 * 
	 */
	clear() {
		this.#entries = {};
		this.entryView.removeAll();
	}

	/**
	 * @param {number} id 
	 * @return {T}
	 */
	_entry(id) {
		return this.#entries[id];
	}

	/**
	 * @callback DBEachCallback
	 * @param {T} arg
	 */

	/**
	 * 
	 * @param {DBEachCallback} expression 
	 */
	each(expression) {
		each(this.#entries, (key, val) => expression(val));
	}
}