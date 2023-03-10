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
	 * @param {number} id 
	 * @return {Variable}
	 */
	variable(id) {
		return this._entry(id);
	}

	/**
	 * @param {string} name 
	 * @return {Variable}
	 */
	variableByName(name) {
		/** @type {Optional<Variable>} */
		let found = new Optional();
		this.each(v => {
			if (!found.HasValue && v.name == name)
				found.Value = v;
		});
		return found.Value;
	}

	/**
	 * @param {number} id 
	 * @return {string}
	 */
	type(id) {
		return this.variable(id).type;
	}

	/**
	 * @param {number} id 
	 * @return {any}
	 */
	value(id) {
		return this.variable(id).value;
	}

	/**
	 * @param {number} id 
	 * @param {any} value
	 */
	setValue(id, value) {
		this.variable(id).value = value;
	}

	/**
	 * @param {string} name 
	 * @return {boolean}
	 */
	exists(name) {
		let found = false;
		this.each(v => { found = found || v.name === name });
		return found;
	}
}