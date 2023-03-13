import { CharacterDatabase } from "./database/character_database.js";
import { Inventory, ItemDatabase } from "./database/item_database.js";
import { LogDatabase } from "./database/log_database.js";
import { Media } from "./media.js";
import { VariableDatabase } from "./database/variable_database.js";
import { StringHelpers } from "./engine/std.js";

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

	/**
	 * @param {number} id 
	 * @return {string}
	 */
	 characterName(id) {
		return this.characterDatabase.name(id);
	}

	/**
	 * @param {string} text 
	 * @returns {string}
	 */
	parseText(text) {
		let matches = text.match(/\{[a-zA-Z0-9\s]+\}/gi);
		if (matches) {
			for (let i = 0; i < matches.length; i++) {
				let varName = matches[i].substring(1, matches[i].length - 1);
				if (this.variableDatabase.exists(varName))
					text = text.replace(matches[i], this.variableDatabase.valueByName(varName));
			}
		}
		var stripper = document.createElement("div");
		stripper.innerHTML = text;
		const allowedTags = ["b", "i", "strong", "span"];
		let process = (parent) => {
			for (let i = 0; i < parent.childElementCount; ++i) {
				if (!allowedTags.includes(parent.children[i].tagName.toLowerCase()))
					parent.children[i].remove();
				else
					process(parent.children[i]);
			}
		};
		process(stripper);
		text = stripper.innerHTML;
		return StringHelpers.nl2br(text);
	}
}