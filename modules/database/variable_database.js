import { Optional } from "../engine/std.js";
import { Database, DatabaseEntry } from "./database.js";

/**
 * @extends {DatabaseEntry}
 */
export class Variable extends DatabaseEntry {
	/** @type {string} */
	name = "";

	/** @type {string} */
	type = "";

	/** @type {any} */
	value;

	/**
	 * @param {number} id 
	 * @param {string} name 
	 * @param {string} type 
	 * @param {any} value 
	 */
	 constructor(id, name, type, value) {
		super(id);
		this.name = name;
		this.type = type;
		this.value = value;
	}
}

/**
 * @extends {Database<Variable>}
 */
export class VariableDatabase extends Database {
	/**
	 * @param {string} name 
	 * @return {Variable}
	 */
	variable(name) {
		/** @type {Optional<Variable>} */
		let found = new Optional();
		this.each(v => {
			if (!found.HasValue && v.name == name)
				found.Value = v;
		});
		return found.Value;
	}

	/**
	 * @param {string} name 
	 * @return {string}
	 */
	type(name) {
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
		this.each(v => found = found || v.name === name);
		return found;
	}
}