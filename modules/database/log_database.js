export class Log {
	/** @type {string} */
	title = "";

	/** @type {string} */
	text = "";

	/**
	 * @param {string} title 
	 * @param {string} text 
	 */
	constructor(title, text) {
		this.title = title;
		this.text = text;
	}
}

export class LogDatabase {
	/** @type {KnockoutObservableArray<string>} */
	logs = ko.observableArray();

	/** @type {KnockoutObservableArray<string>} */
	openedLog = ko.observable();

	/**
	 * @param {Log} log 
	 */
	prepend(log) {
		this.logs.shift(log);
	}

	/**
	 * @param {Log} log 
	 */
	append(log) {
		this.logs.push(log);
	}
}