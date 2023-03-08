import { CharacterDatabase } from "./database/character_database.js";
import { Inventory, ItemDatabase } from "./database/item_database.js";
import { LogDatabase } from "./database/log_database.js";
import { Media } from "./media.js";
import { VariableDatabase } from "./database/variable_database.js";
import { LocalStorage } from "./engine/local_storage.js";

/**
 * @abstract
 */
export class Application {
	/** @type {CharacterDatabase} */
	characterDatabase = new CharacterDatabase();

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

	/** @type {LocalStorage} */
	storage = new LocalStorage();

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