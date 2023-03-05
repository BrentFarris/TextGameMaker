/**
 * MyNewType definition
 * @template T
 * @typedef {Function} Observable
 * @param {T} value
 * @returns T
 */

/**
 * MyNewType definition
 * @template T
 * @typedef {Function} ObservableArray
 * @param {T[]} value
 * @returns T[]
 */

/**
 * The base class for all of the management windows
 * @class
 * @abstract
 */
class Manager {
	/** @type {HTMLElement} */
	elm = null;

	/**
	 * @param {HTMLElement} elm 
	 */
	constructor(elm) {
		this.elm = elm;
		if (!Manager.managers) {
			Manager.managers = [];

			Manager._closeManagers = function() {
				for (let i = 0; i < Manager.managers.length; i++) {
					Manager.managers[i].close();
				}
			};
		}

		Manager.managers.push(this);
	}

	/**
	 * @param {EditorApplication} app 
	 * @virtual
	 */
	show(app) {
		Manager._closeManagers();
		this.elm.style.display = "block";
		app.fileOptionsVisible(false);
	}

	/**
	 * @virtual
	 */
	close() {
		this.elm.style.display = "none";
	}
}

/**
 * A character management window for creating and deleting characters
 * @class
 * @extends {Manager}
 */
class CharacterManager extends Manager {
	/** @type {Observable<any>} */
	name = ko.observable();

	/**
	 * @param {HTMLElement} elm 
	 */
	constructor(elm) {
		super(elm);
	}

	/**
	 * @param {EditorApplication} app 
	 * @override
	 */
	show(app) {
		super.show(app);
		this.elm.getElementsByTagName("input")[0].focus();
	}

	/**
	 * 
	 * @param {EditorApplication} app 
	 * @param {Event} e 
	 * @returns 
	 */
	create(app, e) {
		e = getEvent(e);
		if (e.keyCode === web2d.input.keys.Enter) {
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
class BeastManager extends Manager {
	/** @type {Observable<any>} */
	name = ko.observable();

	/**
	 * @param {HTMLElement} elm 
	 */
	constructor(elm) {
		super(elm);
	}

	/**
	 * @param {EditorApplication} app 
	 */
	show(app) {
		super.show(app);
		this.elm.getElementsByTagName("input")[0].focus();
	}

	/**
	 * @param {EditorApplication} app 
	 * @param {Event} e 
	 * @returns 
	 */
	create(app, e) {
		e = getEvent(e);
		if (e.keyCode === web2d.input.keys.Enter) {
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
class ItemManager extends Manager {
	/** @type {Observable<any>} */
	name = ko.observable();

	/**
	 * @param {HTMLElement} elm 
	 */
	constructor(elm) {
		super(elm);
	}

	/**
	 * @param {EditorApplication} app 
	 */
	show(app) {
		super.show(app);
		this.elm.getElementsByTagName("input")[0].focus();
	}

	/**
	 * @param {EditorApplication} app 
	 * @param {Event} e 
	 */
	create(app, e) {
		e = getEvent(e);
		if (e.keyCode === web2d.input.keys.Enter) {
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
class VariableManager extends Manager {
	/** @type {Observable<any>} */
	name = ko.observable();

	/** @type {Observable<string>} */
	type = ko.observable("");

	/**
	 * @param {HTMLElement} elm 
	 */
	constructor(elm) {
		super(elm);
	}

	/**
	 * @param {EditorApplication} app 
	 */
	show(app) {
		super.show(app);
		this.elm.getElementsByTagName("input")[0].focus();
	}

	/**
	 * @param {EditorApplication} app 
	 * @param {Event} e 
	 */
	create(app, e) {
		e = getEvent(e);

		if (e.keyCode === web2d.input.keys.Enter) {
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
class ViewManager extends Manager {
	/** @type {Observable<any>} */
	title = ko.observable(null);

	/** @type {Observable<any>} */
	value = ko.observable(null);

	/** @type {EditorApplication} */
	app = null;

	/**
	 * @param {HTMLElement} elm 
	 * @param {EditorApplication} app 
	 */
	constructor(elm, app) {
		super(elm);
		this.app = app;
	}

	/**
	 * @param {EditorApplication} app 
	 */
	show(scope) {
		super.show(this.app);
		if (scope.type === "Story") {
			this.title("Story");
		} else if (scope.type === "Comment") {
			this.title("Comment");
		} else {
			this.title(this.app.characters()[scope.character.Value].name);
		}
		this.value(scope.text.Value);
	}
}

/**
 * A node template management window for managing node templates
 * @class
 * @extends {Manager}
 */
class NodeTemplateManager extends Manager {
	/**
	 * @param {HTMLElement} elm 
	 */
	constructor(elm) {
		super(elm);
	}

	/**
	 * @param {EditorApplication} app 
	 */
	show(app) {
		super.show(app);
	}
}