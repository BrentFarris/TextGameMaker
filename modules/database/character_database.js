import { Database, DatabaseEntry } from "./database.js";

/**
 * @extends {DatabaseEntry<string>}
 */
export class Character extends DatabaseEntry {
	/**
	 * @param {number} id 
	 * @param {string} name 
	 */
	constructor(id, name) {
		super(id, name);
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
		return this._entry(id).data;
	}
}