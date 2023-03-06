import * as ko from "./knockout.js";
import { Input } from "./modules/input.js";
import { Optional } from "./modules/std.js";
import { EditorApplication } from "./main.js";
import { CoreNode, DialogNode, StoryNode, CommentNode } from "./node.js";

function getEvent(e) { return e || window.event; }

/**
 * The base class for all of the management windows
 * @class
 * @abstract
 */
export class Manager {
	/** @type {Optional<HTMLElement>} */
	elm = new Optional();

	/** @type {Manager[]} */
	static managers = [];

	static closeManagers() {
		for (let i = 0; i < Manager.managers.length; i++)
			Manager.managers[i].close();
	}

	/**
	 * @param {HTMLElement|null} elm 
	 */
	constructor(elm) {
		this.elm.Value = elm;
		Manager.managers.push(this);
	}

	/**
	 * @param {EditorApplication} app 
	 * @param {CoreNode} scope 
	 * @virtual
	 */
	show(app, scope) {
		Manager.closeManagers();
		if (this.elm.HasValue)
			this.elm.Value.style.display = "block";
		app.fileOptionsVisible(false);
	}

	/**
	 * @virtual
	 */
	close() {
		if (this.elm.HasValue)
			this.elm.Value.style.display = "none";
	}
}

/**
 * A character management window for creating and deleting characters
 * @class
 * @extends {Manager}
 */
export class CharacterManager extends Manager {
	/** @type {KnockoutObservable<any>} */
	name = ko.observable();

	/**
	 * @param {HTMLElement|null} elm 
	 */
	constructor(elm) {
		super(elm);
	}

	/**
	 * @param {EditorApplication} app 
	 * @param {CoreNode} scope 
	 * @override
	 */
	show(app, scope) {
		super.show(app, scope);
		this.elm.Value.getElementsByTagName("input")[0].focus();
	}

	/**
	 * 
	 * @param {EditorApplication} app 
	 * @param {KeyboardEvent} e 
	 * @returns 
	 */
	create(app, e) {
		e = getEvent(e);
		if (e.keyCode === Input.keys.Enter) {
			let name = this.name().trim();
			if (!name.length) {
				return;
			}
			for (let i = 0; i < app.characters().length; i++) {
				if (app.characters()[i].name.toLowerCase() === name.toLowerCase()) {
					alert("A character with that name already exists");
					return;
				}
			}
			app.characters.push({ name: name });
			this.name("");
			app.saveTemp();
			app.metaChanged(true);
		}
	}
}

/**
 * A beast management window for creating and deleting enemies
 * @class
 * @extends {Manager}
 */
export class BeastManager extends Manager {
	/** @type {KnockoutObservable<any>} */
	name = ko.observable();

	/**
	 * @param {HTMLElement|null} elm 
	 */
	constructor(elm) {
		super(elm);
	}

	/**
	 * @param {EditorApplication} app 
	 * @param {CoreNode} scope 
	 * @override
	 */
	show(app, scope) {
		super.show(app, scope);
		this.elm.Value.getElementsByTagName("input")[0].focus();
	}

	/**
	 * @param {EditorApplication} app 
	 * @param {KeyboardEvent} e 
	 * @returns 
	 */
	create(app, e) {
		e = getEvent(e);
		if (e.keyCode === Input.keys.Enter) {
			let name = this.name().trim();
			if (!name.length) {
				return;
			}
			for (let i = 0; i < app.beasts().length; i++) {
				if (app.beasts()[i].name.toLowerCase() === name.toLowerCase()) {
					alert("A character with that name already exists");
					return;
				}
			}
			app.beasts.push({ name: name });
			this.name("");
			app.saveTemp();
			app.metaChanged(true);
		}
	}
}


/**
 * An item management window for creating and deleting items
 * @class
 * @extends {Manager}
 */
export class ItemManager extends Manager {
	/** @type {KnockoutObservable<any>} */
	name = ko.observable();

	/**
	 * @param {HTMLElement|null} elm 
	 */
	constructor(elm) {
		super(elm);
	}

	/**
	 * @param {EditorApplication} app 
	 * @param {CoreNode} scope 
	 * @override
	 */
	show(app, scope) {
		super.show(app, scope);
		this.elm.Value.getElementsByTagName("input")[0].focus();
	}

	/**
	 * @param {EditorApplication} app 
	 * @param {KeyboardEvent} e 
	 */
	create(app, e) {
		e = getEvent(e);
		if (e.keyCode === Input.keys.Enter) {
			let name = this.name().trim();
			if (!name.length) {
				return;
			}
			for (let i = 0; i < app.beasts().length; i++) {
				if (app.beasts()[i].name.toLowerCase() === name.toLowerCase()) {
					alert("A character with that name already exists");
					return;
				}
			}
			app.items.push({ name: name });
			this.name("");
			app.saveTemp();
			app.metaChanged(true);
		}
	}
}

/**
 * A variable management window for creating and deleting variables
 * @class
 * @extends {Manager}
 */
export class VariableManager extends Manager {
	/** @type {KnockoutObservable<any>} */
	name = ko.observable();

	/** @type {KnockoutObservable<string>} */
	type = ko.observable("");

	/**
	 * @param {HTMLElement|null} elm 
	 */
	constructor(elm) {
		super(elm);
	}

	/**
	 * @param {EditorApplication} app 
	 * @param {CoreNode} scope 
	 * @override
	 */
	show(app, scope) {
		super.show(app, scope);
		this.elm.Value.getElementsByTagName("input")[0].focus();
	}

	/**
	 * @param {EditorApplication} app 
	 * @param {KeyboardEvent} e 
	 */
	create(app, e) {
		e = getEvent(e);
		if (e.keyCode === Input.keys.Enter) {
			let name = this.name().trim();
			let type = this.type().trim();
			if (!name.length || !type.length) {
				return;
			}
			for (let i = 0; i < app.variables().length; i++) {
				if (app.variables()[i].name.toLowerCase() === name.toLowerCase()) {
					alert("A variable with that name already exists");
					return;
				}
			}
			app.variables.push({
				name: name,
				type: type
			});
			this.name("");
			this.type("");
			app.saveTemp();
			app.metaChanged(true);
		}
	};
}

/**
 * A popup window that can be used to view the details of a node
 * @class
 * @extends {Manager}
 */
export class ViewManager extends Manager {
	/** @type {KnockoutObservable<any>} */
	title = ko.observable(null);

	/** @type {KnockoutObservable<any>} */
	value = ko.observable(null);

	/**
	 * @param {HTMLElement|null} elm 
	 */
	constructor(elm) {
		super(elm);
	}

	/**
	 * @param {EditorApplication} app 
	 * @param {CoreNode} scope 
	 * @override
	 */
	show(app, scope) {
		super.show(app, scope);
		if (scope.type === "Story") {
			let n = /** @type {StoryNode} */ (scope);
			this.title("Story");
			this.value(n.text.Value);
		}
		else if (scope.type === "Comment") {
			let n = /** @type {CommentNode} */ (scope);
			this.title("Comment");
			this.value(n.text.Value);
		}
		else {
			let n = /** @type {DialogNode} */ (scope);
			this.title(app.characters()[n.character.Value].name);
			this.value(n.text.Value);
		}
	}
}

/**
 * A node template management window for managing node templates
 * @class
 * @extends {Manager}
 */
export class NodeTemplateManager extends Manager {
	/**
	 * @param {HTMLElement|null} elm 
	 */
	constructor(elm) {
		super(elm);
	}

	/**
	 * @param {EditorApplication} app 
	 * @param {CoreNode} scope 
	 * @override
	 */
	show(app, scope) {
		super.show(app, scope);
	}
}