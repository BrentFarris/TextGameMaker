import { Database, DatabaseEntry } from "./database.js";

/**
 * @extends {DatabaseEntry}
 */
export class Character extends DatabaseEntry {
	/** @type {string} */
	name = "";

	/**
	 * @param {number} id 
	 * @param {string} name 
	 */
	constructor(id, name) {
		super(id);
		this.name = name;
	}
}

/**
 * @extends {Database<Character>}
 */
export class CharacterDatabase extends Database {
	/**
	 * @param {number} id 
	 * @returns {string}
	 */
	name(id) {
		return this._entry(id).name;
	}
}