import { Optional } from "../engine/std.js";
import { Database, DatabaseEntry } from "./database.js";

export class VariableData {
	/** @type {string} */
	name = "";

	/** @type {string} */
	type = "";

	/** @type {any} */
	value;

	/**
	 * @param {string} name 
	 * @param {string} type 
	 * @param {any} value 
	 */
	constructor(name, type, value) {
		this.name = name;
		this.type = type;
		this.value = value;
	}
}

/**
 * @extends {DatabaseEntry<VariableData>}
 */
export class Variable extends DatabaseEntry {
	/**
	 * @param {number} id 
	 * @param {VariableData} varInfo 
	 */
	 constructor(id, varInfo) {
		super(id, varInfo);
	}
}

/**
 * @extends {Database<Variable>}
 */
export class VariableDatabase extends Database {
	/**
	 * @param {string} name 
	 * @return {VariableData}
	 */
	variable(name) {
		/** @type {Optional<VariableData>} */
		let found = new Optional();
		this.each(v => {
			if (!found.HasValue && v.data.name == name)
				found.Value = v.data;
		});
		return found.Value;
	}

	/**
	 * @param {string} name 
	 * @return {string}
	 */
	type(name) {
		debugger;
		return this.variable(name).type;
	}

	/**
	 * @param {string} name 
	 * @return {any}
	 */
	value(name) {
		return this.variable(name).value;
	}

	/**
	 * @param {string} name 
	 * @param {any} value
	 */
	setValue(name, value) {
		this.variable(name).value = value;
	}

	/**
	 * @param {string} name 
	 * @return {boolean}
	 */
	exists(name) {
		let found = false;
		this.each(v => found = found || v.data.name === name);
		return found;
	}
}