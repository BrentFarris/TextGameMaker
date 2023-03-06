export class Character {
	/** @type {string} */
	name = "";
}

export class CharacterDatabase {
	/** @type {Character[]} */
	#characters = [];

	/** @type {KnockoutObservableArray<Character>} */
	characterView = ko.observableArray();

	/**
	 * @param {Character} character 
	 */
	add(character) {
		this.#characters.push(character);
		this.characterView.push(character);
	}

	/**
	 * @param {Character[]} characters 
	 */
	addMany(characters) {
		for (let i = 0; i < characters.length; ++i)
			this.add(characters[i]);
	}

	/**
	 * @param {number} id 
	 * @returns {string}
	 */
	characterName(id) {
		return this.#characters[id].name;
	}
}