
class Manager {
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

	show(app) {
		Manager._closeManagers();
		this.elm.style.display = "block";
		app.fileOptionsVisible(false);
	}

	close() {
		this.elm.style.display = "none";
	}
}

class CharacterManager extends Manager {
	constructor(elm) {
		super(elm);
		this.name = ko.observable();
	}

	show(app) {
		super.show(app);
		this.elm.getElementsByTagName("input")[0].focus();
	}

	create(scope, e) {
		e = getEvent(e);

		if (e.keyCode === web2d.input.keys.Enter) {
			let name = this.name().trim();
			if (!name.length) {
				return;
			}

			for (let i = 0; i < scope.characters().length; i++) {
				if (scope.characters()[i].name.toLowerCase() === name.toLowerCase()) {
					alert("A character with that name already exists");
					return;
				}
			}

			scope.characters.push({
				name: name
			});

			
			this.name("");
			scope.saveTemp();
			scope.metaChanged(true);
		}
	}
}

class BeastManager extends Manager {
	constructor(elm) {
		super(elm);
		this.name = ko.observable();
	}

	show(app) {
		super.show(app);
		this.elm.getElementsByTagName("input")[0].focus();
	}

	create(scope, e) {
		e = getEvent(e);

		if (e.keyCode === web2d.input.keys.Enter) {
			let name = this.name().trim();
			if (!name.length) {
				return;
			}

			for (let i = 0; i < scope.beasts().length; i++) {
				if (scope.beasts()[i].name.toLowerCase() === name.toLowerCase()) {
					alert("A character with that name already exists");
					return;
				}
			}

			scope.beasts.push({
				name: name
			});

			
			this.name("");
			scope.saveTemp();
			scope.metaChanged(true);
		}
	}
}

class ItemManager extends Manager {
	constructor(elm) {
		super(elm);
		this.name = ko.observable();
	}

	show(app) {
		super.show(app);
		this.elm.getElementsByTagName("input")[0].focus();
	}

	create(scope, e) {
		e = getEvent(e);

		if (e.keyCode === web2d.input.keys.Enter) {
			let name = this.name().trim();
			if (!name.length) {
				return;
			}

			for (let i = 0; i < scope.beasts().length; i++) {
				if (scope.beasts()[i].name.toLowerCase() === name.toLowerCase()) {
					alert("A character with that name already exists");
					return;
				}
			}

			scope.items.push({
				name: name
			});
			
			this.name("");
			scope.saveTemp();
			scope.metaChanged(true);
		}
	}
}

class VariableManager extends Manager {
	constructor(elm) {
		super(elm);
		this.name = ko.observable("");
		this.type = ko.observable("");
	}

	show(app) {
		super.show(app);
		this.elm.getElementsByTagName("input")[0].focus();
	}

	create(scope, e) {
		e = getEvent(e);

		if (e.keyCode === web2d.input.keys.Enter) {
			let name = this.name().trim();
			let type = this.type().trim();

			if (!name.length || !type.length) {
				return;
			}

			for (let i = 0; i < scope.variables().length; i++) {
				if (scope.variables()[i].name.toLowerCase() === name.toLowerCase()) {
					alert("A variable with that name already exists");
					return;
				}
			}

			scope.variables.push({
				name: name,
				type: type
			});

			this.name("");
			this.type("");
			scope.saveTemp();
			scope.metaChanged(true);
		}
	};
}

class ViewManager extends Manager {
	constructor(elm, app) {
		super(elm);
		this.title = ko.observable(null);
		this.value = ko.observable(null);
		this.app = app;
	}

	show(scope) {
		super.show(this.app);

		if (scope.type === "Story") {
			this.title("Story");
		} else {
			this.title(scope.character);
		}
		
		this.value(scope.text.Value);
	}
}

class NodeTemplateManager extends Manager {
	constructor(elm) {
		super(elm);
	}

	show(app) {
		super.show(app);
	}
}