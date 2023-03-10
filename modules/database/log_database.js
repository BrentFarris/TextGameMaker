import { Database, DatabaseEntry } from "./database.js";

/**
 * @typedef {object} KnockoutObservable
 * @template T
 * @callable
 */

/**
 * @typedef {object} KnockoutObservableArray
 * @template T
 * @callable
 */

/**
 * @extends {DatabaseEntry}
 */
export class Log extends DatabaseEntry {
	/** @type {string} */
	title = "";

	/** @type {string} */
	text = "";

	/**
	 * @param {number} id
	 * @param {string} title 
	 * @param {string} text 
	 */
	constructor(id, title, text) {
		super(id);
		this.title = title;
		this.text = text;
	}
}

export class LogDatabase extends Database {
	/** @type {KnockoutObservableArray<string>} */
	openedLog = ko.observable();
}