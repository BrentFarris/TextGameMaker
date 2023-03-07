import { Optional } from "../engine/std.js";
import { CoreNode, DialogNode, StoryNode, CommentNode } from "../node.js";
import { Variable, VariableDatabase } from "../database/variable_database.js";
import { Item, ItemDatabase } from "../database/item_database.js";
import { Character, CharacterDatabase } from "../database/character_database.js";

export class DatabaseEntry {
	/** @type {string} */
	name = "";
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

	/** @type {CharacterDatabase} */
	database = new CharacterDatabase();

	/**
	 * @param {HTMLElement|null} elm 
	 * @param {CharacterDatabase} characterDatabase
	 */
	constructor(elm, characterDatabase) {
		super(elm);
		this.database = characterDatabase;
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
		let match = name.toLowerCase();
		let found = false;
		this.database.each(item => {
			found = found || item.name.toLowerCase() === match;
		});
		if (found)
			alert("A character with that name already exists");
		else {
			this.database.add(new Character(this.database.NextId, name));
			this.name("");
		}
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

	/** @type {ItemDatabase} */
	database;

	/**
	 * @param {HTMLElement|null} elm 
	 * @param {ItemDatabase} itemDatabase
	 */
	constructor(elm, itemDatabase) {
		super(elm);
		this.database = itemDatabase
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
		let match = name.toLowerCase();
		let found = false;
		this.database.each(item => {
			found = found || item.name.toLowerCase() === match;
		});
		if (found)
			alert("An item with that name already exists");
		else {
			this.database.add(new Item(this.database.NextId, name));
			this.name("");
		}
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

	/** @type {VariableDatabase} */
	database;

	/**
	 * @param {HTMLElement|null} elm 
	 * @param {VariableDatabase} variableDatabase 
	 */
	constructor(elm, variableDatabase) {
		super(elm);
		this.database = variableDatabase;
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
		if (this.database.exists(name))
			alert("A variable with that name already exists");
		else {
			this.database.add(new Variable(this.database.NextId, name, type, null));
			this.name("");
			this.type("");
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

	/** @type {CharacterManager} */
	#characterManager;

	/**
	 * @param {HTMLElement|null} elm 
	 * @param {CharacterManager} characterManager
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
		if (scope instanceof StoryNode) {
			let n = /** @type {StoryNode} */ (scope);
			this.title("Story");
			this.value(n.text.Value);
		} else if (scope instanceof CommentNode) {
			let n = /** @type {CommentNode} */ (scope);
			this.title("Comment");
			this.value(n.text.Value);
		} else {
			let n = /** @type {DialogNode} */ (scope);
			this.title(this.#characterManager.database.name(n.character.Value));
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