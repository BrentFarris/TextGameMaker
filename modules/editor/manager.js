import { Optional } from "../std.js";
import { CoreNode, DialogNode, StoryNode, CommentNode } from "../node.js";
import { Variable } from "../variable_database.js";
import { Item } from "../item_database.js";

export class DatabaseEntry {
	/** @type {string} */
	name = "";
}

export class CharacterEntry extends DatabaseEntry {

}

export class BeastEntry extends DatabaseEntry {

}

export class TemplateEntry extends DatabaseEntry {
	/** @type {string} */
	template = "";
}

function getEvent(e) { return e || window.event; }

/**
 * The base class for all of the management windows
 * @class
 * @abstract
 */
export class Manager {
	/** @type {Optional<HTMLElement>} */
	elm = new Optional();

	/**
	 * @param {HTMLElement|null} elm 
	 */
	constructor(elm) {
		this.elm.Value = elm;
	}

	/**
	 * @param {CoreNode} scope 
	 * @virtual
	 */
	show(scope) {
		if (this.elm.HasValue)
			this.elm.Value.style.display = "block";
	}

	/**
	 * @virtual
	 */
	close() {
		if (this.elm.HasValue)
			this.elm.Value.style.display = "none";
	}

	/**
	 * @virtual
	 */
	inputExec() { }
}

/**
 * A character management window for creating and deleting characters
 * @class
 * @extends {Manager}
 */
export class CharacterManager extends Manager {
	/** @type {KnockoutObservable<string>} */
	name = ko.observable();

	/** @type {KnockoutObservableArray<CharacterEntry>} */
	characters = ko.observableArray();

	/**
	 * @param {HTMLElement|null} elm 
	 */
	constructor(elm) {
		super(elm);
	}

	/**
	 * @param {CoreNode} scope 
	 * @override
	 */
	show(scope) {
		super.show(scope);
		this.elm.Value.getElementsByTagName("input")[0].focus();
	}

	/**
	 * @override 
	 */
	 inputExec() {
		let name = this.name().trim();
		if (!name.length) {
			return;
		}
		for (let i = 0; i < this.characters().length; i++) {
			if (this.characters()[i].name.toLowerCase() === name.toLowerCase()) {
				alert("A character with that name already exists");
				return;
			}
		}
		this.characters.push({ name: name });
		this.name("");
	}
}

/**
 * A beast management window for creating and deleting enemies
 * @class
 * @extends {Manager}
 */
export class BeastManager extends Manager {
	/** @type {KnockoutObservable<string>} */
	name = ko.observable();

	/** @type {KnockoutObservableArray<BeastEntry>} */
	beasts = ko.observableArray();

	/**
	 * @param {HTMLElement|null} elm 
	 */
	constructor(elm) {
		super(elm);
	}

	/**
	 * @param {CoreNode} scope 
	 * @override
	 */
	show(scope) {
		super.show(scope);
		this.elm.Value.getElementsByTagName("input")[0].focus();
	}

	/**
	 * @override
	 */
	 inputExec() {
		let name = this.name().trim();
		if (!name.length) {
			return;
		}
		for (let i = 0; i < this.beasts().length; i++) {
			if (this.beasts()[i].name.toLowerCase() === name.toLowerCase()) {
				alert("An enemy with that name already exists");
				return;
			}
		}
		this.beasts.push({ name: name });
		this.name("");
	}
}


/**
 * An item management window for creating and deleting items
 * @class
 * @extends {Manager}
 */
export class ItemManager extends Manager {
	/** @type {KnockoutObservable<string>} */
	name = ko.observable();

	/** @type {KnockoutObservableArray<Item>} */
	items = ko.observableArray();

	/**
	 * @param {HTMLElement|null} elm 
	 */
	constructor(elm) {
		super(elm);
	}

	/**
	 * @param {CoreNode} scope 
	 * @override
	 */
	show(scope) {
		super.show(scope);
		this.elm.Value.getElementsByTagName("input")[0].focus();
	}

	/**
	 * @override 
	 */
	 inputExec() {
		let name = this.name().trim();
		if (!name.length) {
			return;
		}
		for (let i = 0; i < this.items().length; i++) {
			if (this.items()[i].name.toLowerCase() === name.toLowerCase()) {
				alert("An item with that name already exists");
				return;
			}
		}
		this.items.push({ name: name });
		this.name("");
	}
}

/**
 * A variable management window for creating and deleting variables
 * @class
 * @extends {Manager}
 */
export class VariableManager extends Manager {
	/** @type {KnockoutObservable<string>} */
	name = ko.observable();

	/** @type {KnockoutObservable<string>} */
	type = ko.observable("");

	/** @type {KnockoutObservableArray<Variable>} */
	variables = ko.observableArray();

	/**
	 * @param {HTMLElement|null} elm 
	 */
	constructor(elm) {
		super(elm);
	}

	/**
	 * @param {CoreNode} scope 
	 * @override
	 */
	show(scope) {
		super.show(scope);
		this.elm.Value.getElementsByTagName("input")[0].focus();
	}

	/**
	 * @override 
	 */
	 inputExec() {
		let name = this.name().trim();
		let type = this.type().trim();
		if (!name.length || !type.length) {
			return;
		}
		for (let i = 0; i < this.variables().length; i++) {
			if (this.variables()[i].name.toLowerCase() === name.toLowerCase()) {
				alert("A variable with that name already exists");
				return;
			}
		}
		this.variables.push({
			name: name,
			type: type
		});
		this.name("");
		this.type("");
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

	/** @type {CharacterManager} */
	#characterManager;

	/**
	 * @param {HTMLElement|null} elm 
	 */
	constructor(elm, characterManager) {
		super(elm);
		this.#characterManager = characterManager;
	}

	/**
	 * @param {CoreNode} scope 
	 * @override
	 */
	show(scope) {
		super.show(scope);
		if (scope.type === "Story") {
			let n = /** @type {StoryNode} */ (scope);
			this.title("Story");
			this.value(n.text.Value);
		} else if (scope.type === "Comment") {
			let n = /** @type {CommentNode} */ (scope);
			this.title("Comment");
			this.value(n.text.Value);
		} else {
			let n = /** @type {DialogNode} */ (scope);
			this.title(this.#characterManager.characters()[n.character.Value].name);
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
	/** @type {KnockoutObservableArray<TemplateEntry>} */
	nodeTemplates = ko.observableArray();

	/**
	 * @param {HTMLElement|null} elm 
	 */
	constructor(elm) {
		super(elm);
	}

	/**
	 * @param {CoreNode} scope 
	 * @override
	 */
	show(scope) {
		super.show(scope);
	}
}