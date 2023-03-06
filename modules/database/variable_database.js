export class Variable {
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
 * @typedef GameVariable
 * @property {string} type
 * @property {any} value
 */

export class VariableDatabase {
	/** @type {Object<string,GameVariable>} */
	#variables = {};

	/** @type {KnockoutObservableArray<Variable>} */
	#viewVariables = ko.observableArray();

	/**
	 * @param {string} name 
	 * @param {string} type 
	 * @param {any} value 
	 */
	add(name, type, value) {
		let v = new Variable(name, type, value);
		this.#variables[name] = v;
		this.#viewVariables.push(v)
	}

	/**
	 * @param {string} name 
	 * @return {GameVariable}
	 */
	variable(name) {
		return this.#variables[name];
	}

	/**
	 * @param {string} name 
	 * @return {string}
	 */
	type(name) {
		return this.#variables[name].type;
	}

	/**
	 * @param {string} name 
	 * @return {any}
	 */
	value(name) {
		return this.#variables[name].value;
	}

	/**
	 * @param {string} name 
	 * @param {any} value
	 */
	setValue(name, value) {
		this.#variables[name].value = value;
	}

	/**
	 * @param {string} name 
	 * @return {boolean}
	 */
	exists(name) {
		return name in this.#variables;
	}
}