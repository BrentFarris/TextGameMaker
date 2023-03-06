import { Inventory, ItemDatabase } from "./item_database.js";
import { LogDatabase } from "./log_database.js";
import { Media } from "./media.js";
import { VariableDatabase } from "./variable_database.js";

/**
 * @abstract
 */
export class Application {
	/** @type {VariableDatabase} */
	variableDatabase = new VariableDatabase();

	/** @type {LogDatabase} */
	logDatabase = new LogDatabase();

	/** @type {ItemDatabase} */
	itemDatabase = new ItemDatabase();

	/** @type {Media} */
	media = new Media();

	/** @type {Inventory} */
	inventory = new Inventory();

	/**
	 * @virtual
	 */
	returnToPrevious() {}

	/**
	 * @param {string} funcName 
	 * @virtual
	 */
	remoteCall(funcName) {}

	/**
	 * @param {number} nodeId 
	 * @virtual
	 */
	jumpTo(nodeId) {}

	/**
	 * @param {string} file 
	 * @param {number} fromId 
	 * @param {number} toId 
	 */
	load(file, fromId, toId) {}

	/**
	 * @param {number} nodeId number
	 * @param {*} optionId 
	 */
	activateNodeOption(nodeId, optionId) {}

	/**
	 * @param {number} nodeId number
	 * @param {*} optionId 
	 */
	deactivateNodeOption(nodeId, optionId) {}
}