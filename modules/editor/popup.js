/**
 * @typedef {function(string):void} PromptCallback
 */

export class Popup {
	/** @type {KnockoutObservable<boolean>} */
	showing = ko.observable(false);
	
	/** @type {KnockoutObservable<boolean>} */
	isConfirm = ko.observable(false);
	
	/** @type {KnockoutObservable<boolean>} */
	isAlert = ko.observable(false);
	
	/** @type {KnockoutObservable<boolean>} */
	isPrompt = ko.observable(false);
	
	/** @type {KnockoutObservable<string>} */
	title = ko.observable("Title");
	
	/** @type {KnockoutObservable<string>} */
	description = ko.observable("Description");

	/** @type {KnockoutObservable<string>} */
	input = ko.observable("");

	/** @type {KnockoutObservable<string>} */
	yesText = ko.observable("");

	/** @type {KnockoutObservable<string>} */
	noText = ko.observable("");

	/** @type {KnockoutObservable<string>} */
	alertOkayText = ko.observable("");

	/** @type {PromptCallback|null} */
	#promptCallback = null;
	
	/** @type {Function|null} */
	#successCallback = null;
	
	/** @type {Function|null} */
	#failureCallback = null;

	/**
	 * @param {Application} app 
	 * @param {KeyboardEvent} evt 
	 */
	inputExec(app, evt) {
		if (evt.keyCode === 13) {
			this.confirm();
			evt.preventDefault();
		}
	}

	confirm() {
		if (this.#successCallback)
			this.#successCallback();
		else if (this.#promptCallback)
			this.#promptCallback(this.input());
		this.close();
	}

	cancel() {
		if (this.#failureCallback)
			this.#failureCallback();
		this.close();
	}

	close() {
		this.showing(false);
		this.isConfirm(false);
		this.isAlert(false);
		this.isPrompt(false);
		this.title("");
		this.description("");
		this.input("");
		this.yesText("");
		this.noText("");
		this.alertOkayText("");
		this.#promptCallback = null;
		this.#successCallback = null;
		this.#failureCallback = null;
	}

	/**
	 * @param {string} title
	 * @param {string} description
	 * @param {PromptCallback} [successCallback]
	 * @param {string} [okayText]
	 */
	showAlert(title, description, successCallback, okayText) {
		this.title(title);
		this.description(description);
		this.alertOkayText(okayText || "Okay");
		this.isAlert(true);
		this.showing(true);
		this.#successCallback = successCallback || null;
	}

	/**
	 * @param {string} title
	 * @param {string} description
	 * @param {Function} successCallback
	 * @param {Function} [failureCallback]
	 * @param {string} [yesText]
	 * @param {string} [noText]
	 */
	showConfirm(title, description, successCallback, failureCallback, yesText, noText) {
		this.title(title);
		this.description(description);
		this.yesText(yesText || "Confirm");
		this.noText(noText || "Cancel");
		this.isConfirm(true);
		this.showing(true);
		this.#successCallback = successCallback;
		this.#failureCallback = failureCallback || null;
	}

	/**
	 * @param {string} title
	 * @param {string} description
	 * @param {PromptCallback} promptCallback
	 * @param {Function} [failureCallback]
	 * @param {string} [yesText]
	 * @param {string} [noText]
	 * @param {string} [input]
	 */
	showPrompt(title, description, promptCallback, failureCallback, yesText, noText, input) {
		this.title(title);
		this.description(description);
		this.yesText(yesText || "Confirm");
		this.noText(noText || "Cancel");
		this.input(input || "");
		this.isPrompt(true);
		this.showing(true);
		this.#promptCallback = promptCallback;
		this.#failureCallback = failureCallback || null;
	}
}