/**
 * @callback ElementCheckCallback
 * @param {Element} element
 * @return {boolean|void}
 */

/**
 * @callback ElementCallback
 * @param {number} index
 * @param {Element} element
 */

/**
 * @method
 * @param {number} min 
 * @param {number} max 
 * @returns {number}
 */
export function random(min, max) {
	return Math.floor(min + (Math.random() * (max - min)));
};

/**
 * @callback EachCallback
 * @param {string|number} key
 * @param {Array|Object} arrobj
 * @return {boolean}
 */

/**
 * Loop through an array or object and call a callback function for each item
 * @param {Array|Object} arrobj
 * @param {EachCallback|Function} callback
 */
export function each(arrobj, callback) {
	for (let key in arrobj) {
		if (!arrobj.hasOwnProperty(key))
			continue;
		if (key == "length" && Object.prototype.toString.call(arrobj) === "[object HTMLCollection]")
			continue;
		if (callback(key, arrobj[key]) === false)
			break;
	}
}

/**
 * Loop through an array or object and call a callback function for each item
 * @param {Array|Object} arrobj
 * @param {EachCallback|Function} callback
 * @returns {Promise<void>}
 * @async
 */
export async function eachAsync(arrobj, callback) {
	for (let key in arrobj) {
		if (!arrobj.hasOwnProperty(key))
			continue;
		if (key == "length" && Object.prototype.toString.call(arrobj) === "[object HTMLCollection]")
			continue;
		let response = await callback(key, arrobj[key]);
		if (response === false)
			break;
	}
}

/**
 * Get's a parameter from the page's query string
 * @method
 * @param {string} name The name of the query value to get
 * @return {Optional<string>}
 */
export function getURLParam(name) {
	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	let regex = new RegExp("[\\?&]" + name + "=([^&#]*)"), results = regex.exec(location.search);
	let res = new Optional();
	if (results !== null)
		res.Value = decodeURIComponent(results[1].replace(/\+/g, " "));
	return res;
}

export class StringHelpers {
	/**
	 * Replaces all occurrences found in the string
	 * @param {string} str The string to search for within the string
	 * @param {string} search The string to search for within the string
	 * @param {string} replacement The replacement string for the found string
	 * @returns {string}  The modified string
	 */
	static replaceAllReg(str, search, replacement) {
		var target = str;
		return target.replace(new RegExp(search, 'g'), replacement);
	}

	/**
	 * Replaces all occurrences found in the string
	 * @param {string} str The string to search for within the string
	 * @param {string} search The string to search for within the string
	 * @param {string} replacement The replacement string for the found string
	 * @returns {string} The modified string
	 */
	static replaceAllFunc(str, search, replacement) {
		var target = str;
		return target.split(search).join(replacement);
	}

	/**
	 * Replaces all occurrences found in the string
	 * @param {string} str The string to search for within the string
	 * @param {string} search 
	 * @param {string} replacement 
	 * @returns {string}
	 */
	static replaceAll(str, search, replacement) {
		return StringHelpers.replaceAllReg(str, search, replacement);
	}

	/**
	 * Searches for a string within a string
	 * @param {string} str
	 * @param {string} search 
	 * @returns {boolean}
	 */
	static contains(str, search) {
		return str.indexOf(search) >= 0;
	}

	/**
	 * Replaces the first character of a string with an uppercase character
	 * @param {string} str
	 * @returns {string}
	 */
	static ucfirst(str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	/**
	 * Replaces any instance of a new line character '\n' with a break tag
	 * @param {string} str 
	 * @param {boolean} [isXHTML] 
	 * @returns {string}
	 */
	static nl2br(str, isXHTML) {
		var breakTag = isXHTML || typeof isXHTML === "undefined" ? "<br />" : "<br>";
		return (str + "").replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, "$1" + breakTag + "$2");
	}

	/**
	 * @param {string} str 
	 * @param {string} search 
	 * @returns {boolean}
	 */
	static endsWith(str, search) {
		return str.substr(str.length - search.length) === search;
	}
}

/** Array overrides */
export class ArrayHelpers {
	/**
	 * Get the first object in this array
	 * @template T
	 * @param {Array<T>} arr
	 * @returns {Object} The first object in the array
	 */
	static head(arr) {
		return arr[0];
	}

	/**
	 * Get the last object in this array
	 * @template T
	 * @param {Array<T>} arr
	 * @returns {Object}  The last object in the array
	 */
	static tail(arr) {
		return arr[arr.length - 1];
	}

	/**
	 * Removes a given element from an array given its index
	 * @template T
	 * @param {Array<T>} arr
	 * @param {number} position The index of the element to be removed from the array
	 * @returns {Array} this
	 */
	static removeAt(arr, position) {
		arr.splice(position, 1);
		return arr;
	}

	/**
	 * Removes an item from the array if the item's signatures match; Only removes the first found instance
	 * @template T
	 * @param {Array<T>} arr
	 * @param {Object} arg The object to be compared against and removed
	 * @returns {Array} this
	 */
	static remove(arr, arg) {
		for (let i = 0; i < arr.length; i++) {
			if (arr[i] === arg) {
				arr.splice(i, 1);
				break;
			}
		}
		return arr;
	}

	/**
	 * Removes an item from the array if the item's signatures match; Removes all instances
	 * @template T
	 * @param {Array<T>} arr
	 * @param {Object} arg The object to be compared against and removed
	 * @returns {Array} this
	 */
	static removeAll(arr, arg) {
		for (let i = 0; i < arr.length; i++) {
			if (arr[i] === arg)
				arr.splice(i--, 1);
		}
		return arr;
	}

	/**
	 * Delete all the items from the array
	 * @template T
	 * @param {Array<T>} arr
	 */
	static clear(arr) {
		arr.length = 0;
	}

	/**
	 * Insert an Object into the array at a given position; this shifts the one at that current position to the next index
	 * @template T
	 * @param {Array<T>} arr
	 * @param {Object} arg The object to be inserted into the array at the supplied index
	 * @param {number} position The position to insert the supplied object at in the array
	 * @returns {Array} this
	 */
	static insertAt(arr, arg, position) {
		let arr1 = arr.slice(0, position);
		let arr2 = arr.slice(position);
		ArrayHelpers.clear(arr);
		for (let i = 0; i < arr1.length; i++)
			arr.push(arr1[i]);
		arr.push(arg);
		for (let j = 0; j < arr2.length; j++)
			arr.push(arr2[j]);
		return arr;
	};

	/**
	 * Determines if the supplied object is already in the array
	 * @template T
	 * @param {Array<T>} arr
	 * @param {Object} arg The object to compare against
	 * @return {boolean} Returns true if the object was found in the array
	 */
	static contains(arr, arg) {
		let found = false;
		for (let i = 0; i < arr.length && !found; i++)
			found = arr[i] === arg;
		return found;
	};

	/**
	 * This counts how many times the object occurs in the array
	 * @template T
	 * @param {Array<T>} arr
	 * @param {Object} arg The object to be compared against
	 * @return {number} counter The amount of times the supplied object was found in the array
	 */
	static occurs(arr, arg) {
		let counter = 0;
		for (let i = 0; i < arr.length; i++) {
			if (arr[i] === arg)
				counter++;
		}
		return counter;
	};

	/**
	 * Iterate through the collection and pass each element in the collection through the supplied expression
	 * @template T
	 * @param {Array<T>} arr
	 * @param {function} expression The Anonymous function that each element in the collection will be passed through
	 * @example myArray.iterate((elm) => { elm.count++; });
	 * @returns {Array} this
	 */
	static iterate(arr, expression) {
		for (let i = 0; i < arr.length; i++)
			expression(arr[i]);
		return arr;
	};

	/**
	 * Iterate through the collection and pass each element in the collection
	 * through the supplied expression, whatever is returned from the
	 * expression is added to a collection that is then returned
	 * @template T
	 * @param {Array<T>} arr
	 * @param {function} expression The Anonymous function that each element in the collection will be passed through
	 * @param {boolean} [includeNulls=false] Include null objects in the returned collection
	 * @example var names = myArray.IterateExecute((elm) => { return elm.name; });
	 * @returns {Array<T>} The elements that passed the evaluation of the expression
	 */
	static iterateExecute(arr, expression, includeNulls) {
		let evaluatedCollection = [];
		for (let i = 0; i < arr.length; i++) {
			if (includeNulls) {
				evaluatedCollection.push(expression(arr[i]));
			} else {
				let tmp = expression(arr[i]);
				if (tmp != null)
					evaluatedCollection.push(tmp);
			}
		}
		return evaluatedCollection;
	};

	/**
	 * Find all objects in the array that meet the expression
	 * @template T
	 * @param {Array<T>} arr
	 * @param {function} expression The expression that is to be evaluated on each element in the collection
	 * @return {Array} The elements that passed the functions boolean return
	 * @example myArray.where((elm) => { return elm.groupId == 1; });
	 * @returns {Array} this
	 */
	static where(arr, expression) {
		let evaluatedCollection = [];
		for (let i = 0; i < arr.length; i++) {
			if (expression(arr[i]))
				evaluatedCollection.push(arr[i]);
		}
		return evaluatedCollection;
	};

	/**
	 * Returns the first element in the collection that passes the expressions boolean check
	 * @template T
	 * @param {Array<T>} arr
	 * @param {function} expression The expression that is to be evaluated true/false
	 * @return {Optional<T>} The first object where the expression returned true or null if all returned false
	 * @example var first = myArray.first((elm) => { return elm.firstName == "Brent"; });
	 */
	static findFirst(arr, expression) {
		/** @type {Optional<T>} */
		let elm = new Optional();
		for (let i = 0; i < arr.length && !elm.HasValue; i++) {
			if (expression(arr[i]))
				elm.Value = arr[i];
		}
		return elm;
	};

	/**
	 * Returns the last element in the collection that passes the expressions boolean check
	 * @template T
	 * @param {Array<T>} arr
	 * @param {function} expression The expression that is to be evaluated true/false
	 * @return {Optional<T>} The last object where the expression returned true or null if all returned false
	 * @example myArray.last((elm) => { return elm.lastName == "Farris"; });
	 */
	static findLast(arr, expression) {
		/** @type {Optional<T>} */
		let elm = new Optional();
		for (let i = arr.length - 1; i >= 0 && !elm.HasValue; i--) {
			if (expression(arr[i]))
				elm.Value = arr[i];
		}
		return elm;
	};

	/**
	 * @template T
	 * @param {Array<T>} arr
	 * @param {Function} expression The args are(index, value)
	 */
	static each(arr, expression) {
		for (let i = 0; i < arr.length; i++)
			expression(i, arr[i]);
	};

	/**
	 * @param {Array<number>} arr
	 * @return {number}
	 */
	static sum(arr) {
		let sum = 0;
		for (let i = 0; i < arr.length; i++)
			sum += arr[i];
		return sum;
	};
}

export class ElementCollectionHelpers {
	/**
	 * Find the index of the first element in the collection that passes the expression
	 * @param {HTMLCollection} elements
	 * @param {function} expression The expression to use on each element
	 * @returns {number} -1 if not found otherwise the index of the element
	 */
	static findFirstIndex(elements, expression) {
		let index = -1;
		for (let i = 0; i < elements.length; i++) {
			if (expression(elements[i]))
				index = i;
		}
		return index;
	}

	/**
	 * Find the first element in the collection that passes the expression
	 * @param {HTMLCollection} elements
	 * @param {ElementCheckCallback} expression The expression to use on each element
	 * @returns {Optional<Element>} The first element found
	 */
	static findFirst(elements, expression) {
		/** @type {Optional<Element>} */
		let elm = new Optional();
		for (let i = 0; i < elements.length && !elm.HasValue; i++) {
			if (expression(elements[i]))
				elm.Value = elements[i];
		}
		return elm;
	}

	/**
	 * Find the last element in the collection that passes the expression
	 * @param {HTMLCollection} elements
	 * @param {ElementCheckCallback} expression The expression to use on each element
	 * @returns {Optional<Element>} The last element found
	 */
	static findLast(elements, expression) {
		/** @type {Optional<Element>} */
		let elm = new Optional();
		for (let i = elements.length - 1; i >= 0 && !elm.HasValue; i--) {
			if (expression(elements[i]))
				elm.Value = elements[i];
		}
		return elm;
	}

	/**
	 * Run a function on each element in the collection
	 * @param {HTMLCollection} elements
	 * @param {ElementCheckCallback} expression The expression to use on each element
	 */
	static iterate(elements, expression) {
		for (let i = 0; i < elements.length; i++)
			expression(elements[i]);
	}

	/**
	 * Find the first child element with the given class name
	 * @param {HTMLCollection} elements
	 * @param {string} cssClass The css class name to search for
	 * @returns {Optional<Element>} The first child found with the given class name
	 */
	static findChildByClass(elements, cssClass) {
		cssClass = cssClass.toLowerCase();
		/** @type {ElementCheckCallback} */
		let check = (child) => { return child.className.toLowerCase() === cssClass; };
		return ElementCollectionHelpers.findFirst(elements, check);
	}

	/**
	 * Find the first child element with the given tag name
	 * @param {HTMLCollection} elements
	 * @param {string} tagName The Element tag name to look for
	 * @returns {Optional<Element>} The first child found with the given tag name
	 */
	static findChildByTag(elements, tagName) {
		tagName = tagName.toLowerCase();
		/** @type {ElementCheckCallback} */
		let check = (child) => { return child.tagName.toLowerCase() === tagName; };
		return ElementCollectionHelpers.findFirst(elements, check);
	}

	/**
	 * Find the last child element with the given class name
	 * @param {HTMLCollection} elements
	 * @param {string} cssClass The css class name to search for
	 * @returns {Optional<Element>} The last child found with the given class name
	 */
	static findLastChildByClass(elements, cssClass) {
		cssClass = cssClass.toLowerCase();
		/** @type {ElementCheckCallback} */
		let check = (child) => { return child.className.toLowerCase() === cssClass; };
		return ElementCollectionHelpers.findLast(elements, check);
	}

	/**
	 * 
	 * @param {HTMLCollection} elements
	 * @param {string} tagName The Element tag name to look for
	 * @returns {Optional<Element>} The last child found with the given tag name
	 */
	static findLastChildByTag(elements, tagName) {
		tagName = tagName.toLowerCase();
		/** @type {ElementCheckCallback} */
		let check = (child) => { return child.tagName.toLowerCase() === tagName; };
		return ElementCollectionHelpers.findLast(elements, check);
	}

	/**
	 * Execute a function on each child element
	 * @param {HTMLCollection} elements
	 * @param {ElementCallback} expression The expression to use on each element
	 */
	static each(elements, expression) {
		for (let i = elements.length - 1; i >= 0; i--)
			expression(i, elements[i]);
	}
}

export class ElementHelpers {
	/**
	 * Get's the innerHTML of this element or sets it if an argument is provided
	 * @param {HTMLElement} elm
	 * @param {string} html The html to assign the innerHTML (if left blank it will return current innerHTML)
	 * @returns {HTMLElement|string} The current innerHTML of the element if no html was provided as an argument
	 */
	static html(elm, html) {
		if (!html) {
			return elm.innerHTML;
		} else {
			elm.innerHTML = html;
			return elm;
		}
	};

	/**
	 * Get's the textContent of this element or sets it if an argument is provided
	 * @param {HTMLElement} elm
	 * @param {string} text The text to assign the textContent (if left blank it will return current textContent)
	 * @returns {HTMLElement|string} The current textContent of the element if no text was provided as an argument
	 */
	static text(elm, text) {
		if (!text) {
			return elm.textContent || "";
		} else {
			elm.textContent = text;
			return elm;
		}
	};

	/**
	 * Sets the width of the element, this sets both the width and style.width properties
	 * @param {HTMLElement} elm
	 * @param {number} width The width to set
	 */
	static setWidth(elm, width) {
		elm.setAttribute("width", width.toString());
		elm.style.width = width + "px";
	};

	/**
	 * Sets the height of the element, this sets both the height and style.height properties
	 * @param {HTMLElement} elm
	 * @param {number} height The height to set
	 */
	static setHeight(elm, height) {
		elm.setAttribute("height", height.toString());
		elm.style.height = height + "px";
	};
}

/**
 * @class
 * @template T
 */
export class Optional {
	/** @type {T|null} */
	#value = null;

	constructor(value) {
		this.#value = value;
	}

	/** @returns {boolean} */
	get HasValue() {
		return this.#value !== null && this.#value !== undefined;
	}

	/**
	 * @param {T|null} value
	 */
	set Value(value) {
		this.#value = value;
	}
	
	/** @returns {T} */
	get Value() {
		if (this.#value === null)
			throw "No value";
		return this.#value;
	}
}