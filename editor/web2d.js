/**
 * @method
 * @param {number} min 
 * @param {number} max 
 * @returns {number}
 */
function random(min, max) {
    return Math.floor(min + (Math.random() * (max - min)));
};

/** String overrides */
{
	/**
     * Replaces all occurences found in the string
     * @param {string} search The string to search for within the string
     * @param {string} replacement The replacement string for the found string
     * @returns {string}  The modified string
     */
    String.prototype.replaceAllReg = function (search, replacement) {
        var target = this;
        return target.replace(new RegExp(search, 'g'), replacement);
    };

    /**
     * Replaces all occurences found in the string
     * @method
     * @param {string} search The string to search for within the string
     * @param {string} replacement The replacement string for the found string
     * @returns {string} The modified string
     */
    String.prototype.replaceAllFunc = function (search, replacement) {
        var target = this;
        return target.split(search).join(replacement);
    };

    /**
     * @method
     * @param {string} search 
     * @param {string} replacement 
     * @returns {string}
     */
    String.prototype.replaceAll = function (search, replacement) {
        return this.replaceAllReg(search, replacement);
    };

    /**
     * @method
     * @param {string} search 
     * @returns {strin}
     */
    String.prototype.contains = function (search) {
        return this.indexOf(search) >= 0;
    };

    /**
     * @method
     * @returns {string}
     */
    String.prototype.ucfirst = function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    };

    /**
     * @method
     * @param {boolean} is_xhtml 
     * @returns {string}
     */
    String.prototype.nl2br = function (is_xhtml) {
        var breakTag = is_xhtml || typeof is_xhtml === "undefined" ? "<br />" : "<br>";
        return (this + "").replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, "$1" + breakTag + "$2");
    };
}

/** Array overrides */
{
	/**
	 * Get the first object in this array
	 * @returns {Object} The first object in the array
	 */
    Array.prototype.head = function () {
        return this[0];
    };

	/**
	 * Get the last object in this array
	 * @returns {Object}  The last object in the array
	 */
    Array.prototype.tail = function () {
        return this[this.length - 1];
    };

	/**
	 * Removes a given element from an array given its index
	 * @param {number} position The index of the element to be removed from the array
	 * @returns {Array} this
	 * @chainable
	 */
    Array.prototype.removeAt = function (position) {
        this.splice(position, 1);
        return this;
    };

	/**
	 * Removes an item from the array if the item's signatures match; Only removes the first found instance
	 * @param {Object} arg The object to be compared against and removed
	 * @returns {Array} this
	 * @chainable
	 */
    Array.prototype.remove = function (arg) {
        for (let i = 0; i < this.length; i++) {
            if (this[i] === arg) {
                this.splice(i, 1);
                break;
            }
        }

        return this;
    };

	/**
	 * Removes an item from the array if the item's signatures match; Removes all instances
	 * @param {Object} arg The object to be compared against and removed
	 * @returns {Array} this
	 * @chainable
	 */
    Array.prototype.removeAll = function (arg) {
        for (let i = 0; i < this.length; i++) {
            if (this[i] === arg) {
                this.splice(i--, 1);
            }
        }

        return this;
    };

	/**
	 * Delete all the items from the array
	 */
    Array.prototype.clear = function () {
        this.length = 0;
    };

	/**
	 * Insert an Object into the array at a given position; this shifts the one at that current position to the next index
	 * @param {Object} arg The object to be inserted into the array at the supplied index
	 * @param {number} position The position to insert the supplied object at in the array
	 * @returns {Array} this
	 * @chainable
	 */
    Array.prototype.insertAt = function (arg, position) {
        let arr1 = this.slice(0, position);
        let arr2 = this.slice(position);

        this.clear();

        for (let i = 0; i < arr1.length; i++) {
            this.push(arr1[i]);
        }

        this.push(arg);

        for (let j = 0; j < arr2.length; j++) {
            this.push(arr2[j]);
        }

        return this;
    };

	/**
	 * Determines if the supplied object is already in the array
	 * @param {Object} arg The object to compare against
	 * @return {boolean} Returns true if the object was found in the array
	 */
    Array.prototype.contains = function (arg) {
        for (let i = 0; i < this.length; i++) {
            if (this[i] === arg) {
                return true;
            }
        }

        return false;
    };

	/**
	 * This counts how many times the object occurs in the array
	 * @param {Object} arg The object to be compared against
	 * @return {number} counter The amount of times the supplied object was found in the array
	 */
    Array.prototype.occurs = function (arg) {
        let counter = 0;

        for (let i = 0; i < this.length; i++) {
            if (this[i] === arg)
                counter++;
        }

        return counter;
    };

	/**
	 * Iterate through the collection and pass each element in the collection through the supplied expression
	 * @param {function} expression The Anonymous function that each element in the collection will be passed through
	 * @example myArray.iterate((elm) => { elm.count++; });
	 * @returns {Array} this
	 * @chainable
	 */
    Array.prototype.iterate = function (expression) {
        for (let i = 0; i < this.length; i++) {
            expression(this[i]);
        }

        return this;
    };

	/**
	 * Iterate through the collection and pass each element in the collection through the supplied expression, whatever is returned from the expression is added to a collection that is then returned
	 * @param {function} expression The Anonymous function that each element in the collection will be passed through
	 * @param {boolean} [includeNulls=false] Include null objects in the returned collection
	 * @return {Array} The elements that passed the evaluation of the expression
	 * @example var names = myArray.IterateExecute((elm) => { return elm.name; });
	 * @returns {Array} this
	 * @chainable
	 */
    Array.prototype.iterateExecute = function (expression, includeNulls) {
        let evaluatedCollection = [];
        for (let i = 0; i < this.length; i++) {
            if (includeNulls) {
                evaluatedCollection.push(expression(this[i]));
            } else {
                let tmp = expression(this[i]);

                if (!NULL(tmp)) {
                    evaluatedCollection.push(tmp);
                }
            }
        }

        return evaluatedCollection;
    };

	/**
	 * Find all objects in the array that meet the expression
	 * @param {function} expression The expression that is to be evaluated on each element in the collection
	 * @return {Array} The elements that passed the functions boolean return
	 * @example myArray.where((elm) => { return elm.groupId == 1; });
	 * @returns {Array} this
	 * @chainable
	 */
    Array.prototype.where = function (expression) {
        let evaluatedCollection = [];

        for (let i = 0; i < this.length; i++) {
            if (expression(this[i])) {
                evaluatedCollection.push(this[i]);
            }
        }

        return evaluatedCollection;
    };

	/**
	 * Returns the first element in the collection that passes the expressions boolean check
	 * @param {function} expression The expression that is to be evaluated true/false
	 * @return {Object|null} The first object where the expression returned true or null if all returned false
	 * @example var first = myArray.first((elm) => { return elm.firstName == "Brent"; });
	 */
    Array.prototype.findFirst = function (expression) {
        for (let i = 0; i < this.length; i++) {
            if (expression(this[i])) {
                return this[i];
            }
        }

        return null;
    };

	/**
	 * Returns the last element in the collection that passes the expressions boolean check
     * @method
	 * @param {function} expression The expression that is to be evaluated true/false
	 * @return {Object|null} The last object where the expression returned true or null if all returned false
	 * @example myArray.last((elm) => { return elm.lastName == "Farris"; });
	 */
    Array.prototype.findLast = function (expression) {
        for (let i = this.length - 1; i >= 0; i--) {
            if (expression(this[i])) {
                return this[i];
            }
        }

        return null;
    };

    /**
     * @method
     * @param {Function} expression The args are(index, value)
     */
    Array.prototype.each = function (expression) {
        for (let i = 0; i < this.length; i++) {
            expression(i, this[i]);
        }
    };

    /**
     * @method
     */
    Array.prototype.sum = function () {
        let sum = 0;
        for (let i = 0; i < this.length; i++) {
            sum += this[i];
        }

        return sum;
    };
}

/** HTML Element overrides */
{
    /**
     * 
     * @param {function} expression The expression to use on each element
     * @returns {number|boolean} The index that was found otherwise false
     */
    HTMLCollection.prototype.findFirstIndex = function (expression) {
        for (let i = 0; i < this.length; i++) {
            if (expression(this[i])) {
                i;
            }
        }

        return false;
    };

    /**
     * 
     * @param {function} expression The expression to use on each element
     * @returns {Element|null} The first element found
     */
    HTMLCollection.prototype.findFirst = function (expression) {
        for (let i = 0; i < this.length; i++) {
            if (expression(this[i])) {
                return this[i];
            }
        }

        return null;
    };

    /**
     * 
     * @param {function} expression The expression to use on each element
     * @returns {Element|null} The last element found
     */
    HTMLCollection.prototype.findLast = function (expression) {
        for (let i = this.length - 1; i >= 0; i--) {
            if (expression(this[i])) {
                return this[i];
            }
        }

        return null;
    };

    /**
     * 
     * @param {function} expression The expression to use on each element
     */
    HTMLCollection.prototype.iterate = function (expression) {
        for (let i = 0; i < this.length; i++) {
            expression(this[i]);
        }
    };

    /**
     * 
     * @param {string} cssClass The css class name to search for
     * @returns {Element|null} The first child found with the given class name
     */
    HTMLCollection.prototype.findChildByClass = function (cssClass) {
        cssClass = cssClass.toLowerCase();
        return this.findFirst((child) => {
            return child.className.toLowerCase() === cssClass;
        });
    };

    /**
     * 
     * @param {string} tagName The Element tag name to look for
     * @returns {Element|null} The first child found with the given tag name
     */
    HTMLCollection.prototype.findChildByTag = function (tagName) {
        tagName = tagName.toLowerCase();
        return this.findFirst((child) => {
            return child.tagName.toLowerCase() === tagName;
        });
    };

    /**
     * 
     * @param {string} cssClass The css class name to search for
     * @returns {Element|null} The last child found with the given class name
     */
    HTMLCollection.prototype.findLastChildByClass = function (cssClass) {
        cssClass = cssClass.toLowerCase();
        return this.findLast((child) => {
            return child.className.toLowerCase() === cssClass;
        });
    };

    /**
     * 
     * @param {string} tagName The Element tag name to look for
     * @returns {Element|null} The last child found with the given tag name
     */
    HTMLCollection.prototype.findLastChildByTag = function (tagName) {
        tagName = tagName.toLowerCase();
        return this.findLast((child) => {
            return child.tagName.toLowerCase() === tagName;
        });
    };

    /**
     * Get's the innerHTML of this element or sets it if an argument is provided
     * @param {string} html The html to assign the innerHTML (if left blank it will return current innerHTML)
     * @returns {Element|string} The current innerHTML of the element if no html was provided as an argument
     */
    Element.prototype.html = function (html) {
        if (!html) {
            return this.innerHTML;
        } else {
            this.innerHTML = html;
            return this;
        }
    };

    /**
     * Get's the textContent of this element or sets it if an argument is provided
     * @param {string} text The text to assign the textContent (if left blank it will return current textContent)
     * @returns {Element|string} The current textContent of the element if no text was provided as an argument
     */
    Element.prototype.text = function (text) {
        if (!text) {
            return this.textContent;
        } else {
            this.textContent = text;
            return this;
        }
    };

    Element.prototype.setWidth = function (width) {
        this.width = width;
        this.style.width = width + "px";
    };

    Element.prototype.setHeight = function (height) {
        this.height = height;
        this.style.height = height + "px";
    };

    HTMLCollection.prototype.each = function (expression) {
        for (let i = this.length - 1; i >= 0; i--) {
            expression(i, this[i]);
        }
    };
}

/**
 * The web2d framework
 * @namespace
 */
var web2d = {
    usingFirebase: true,
    displays: [],
    readTextFile: function(blob) {
        return new Promise((resolve, reject) => {
            var reader = new FileReader();
            
            reader.onload = function() {
                resolve(reader.result);
            }

            reader.onerror = function(err) {
                reject(err)
            }

            reader.readAsText(blob);
        });
    },
    /**
     * An object to control and play audio
     * @constructor
     * @param {string|Audio} src The resource to use for this audio clip
     */
    audio: function (src) {
        /**
         * This is the number of times the track will loop
         * @type {number}
         * @private
         */
        this._loops = 0;

        if (typeof src == "string") {
            this.clip = new Audio();
            this.clip.src = src;
        } else {
            this.clip = src;
        }

        /**
         * Plays this audio clip. If looping it will play it for the remaining loop count
         * @method
         */
        this.play = function () {
            this.clip.play();
        };

        /**
         * Pauses this audio clip and allows to continue it from this point if played again
         * @method
         */
        this.pause = function () {
            this.clip.pause();
        };

        this.stop = function () {
            this.clip.pause();
            this.clip.currentTime = 0;
        };

        /**
         * This sets the current time of the audio clip to allow "jumping"
         * @method
         * @param {number} time time that the audio clip should start at
         */
        this.setTime = function (time) {
            this.clip.currentTime = time;
        };

        /**
         * Sets the volume for this audio clip
         * @method
         * @param {number} volume 
         */
        this.setVolume = function (volume) {
            if (volume > 1) {
                this.clip.volume = volume * 0.01;
            } else {
                this.clip.volume = volume;
            }
        };

        /**
         * The function that is to be used as a callback only for when the audio clip has ended
         * @method
         * @private
         */
        this._endLoopDecrement = function () {
            if (this._loops > 0) {
                this._loops--;
            }

            if (this._loops > 0) {
                this.play();
            }
        };

        /**
         * Sets how many times the audio clip should loop when playing. If 0 is passed then it will loop forever, if -1 is passed then it will turn looping off, otherwise loops the specified amount
         * @method
         * @param {number} repeats The amount of times this audio clip should loop
         */
        this.setLoopCount = function (repeats) {
            if (repeats == 0) {
                this.clip.loop = true;
            } else if (repeats < 0) {
                this.clip.loop = false;
                this._loops = 0;
            } else {
                this._loops = repeats;
            }
        };
    },
    /**
     * An object to manage a HTML5 <Canvas> element
     * @constructor
     * @param {Element} elm The Canvas element on the page to reference
     * @param {!number} [widthPercent] The width scale factor of the Canvas (if null uses default width set in the Canvas tag)
     * @param {!number} [heightPercent] The height scale factor of the Canvas (if null uses default height set in the Canvas tag)
     */
    canvas: function (elm, widthPercent, heightPercent) {
        if (!elm) {
            throw "The Canvas id passed was not valid";
        }

        /**
         * This is the actual Canvas element in the document 
         * @type {Element}
         */
        this.elm = elm;

        /** @type {number} */
        this.animationRequestId = 0;

        /**
         * The context which is required to get anything showing up 
         * @type {Context}
        */
        this.context = this.elm.getContext("2d");

        if (widthPercent != null) {
            let width = this.elm.parentNode.width || parseFloat(this.elm.parentNode.style.width) || document.body.clientWidth;
            this.elm.width = width * widthPercent;
        }

        if (heightPercent != null) {
            let height = this.elm.parentNode.height || parseFloat(this.elm.parentNode.style.height) || document.body.clientHeight;
            this.elm.height = height * heightPercent;
        }

        this.elm.style.width = this.elm.width + "px";
        this.elm.style.height = this.elm.height + "px";

        /**
         * The current scale of the canvas on the x and y; 1 is default
         * @type {web2d.vec2}
         */
        this.viewScale = new web2d.vec2(1, 1);

        this.__defineGetter__("width", () => {
            return this.elm.width;
        });

        this.__defineSetter__("width", val => {
            this.elm.width = val;
            this.elm.style.width = val + "px";
        });

        this.__defineGetter__("height", () => {
            return this.elm.height;
        });

        this.__defineSetter__("height", val => {
            this.elm.height = val;
            this.elm.style.height = val + "px";
        });

        /**
         * Fires at the beginning this objects <a href="web2d.canvas.html#method_Draw">Draw</a> function before the <a href="web2d.canvas.html#event_Draw">drawing</a> event fires
         * @event web2d.canvas.updating
         */
        this.updating = new web2d.event();

        /**
         * Fires whenever this objects <a href="web2d.canvas.html#method_Draw">Draw</a> function is called
         * @event web2d.canvas.drawing
         * @param {web2d.canvas} canvas This canvas element
         */
        this.drawing = new web2d.event();

        /**
         * @event web2d.canvas.drawing
         * @param {web2d.canvas} canvas This canvas element
         */
        this.lateDrawing = new web2d.event();

        /**
         * @type {Date}
         * @private
         */
        this._lastTime = new Date();

        /** @type {number} */
        this.deltaTime = 0;

        /**
         * Calls all of the events registered to <a href="web2d.canvas.html#event_drawing">drawing</a> event on this Canvas object 
         * @method
        */
        this.draw = function () {
            let now = new Date();
            this.deltaTime = (now - this._lastTime) / 1000;
            this._lastTime = now;

            this.updating.fire([this.deltaTime]);
            this.drawing.fire([this]);
            this.lateDrawing.fire([this]);
        };

        /**
         * Calls the web2d.canvas#resize and the web2d.canvas#scale method internally
         * @method
         * @param {number} baseWidth The base width to be multiplied by the ratio
         * @param {number} baseHeight The base height to be multiplied by the ratio
         * @param {number} ratio The ratio to scale to
         */
        this.scaleAndResize = function (baseWidth, baseHeight, ratio) {
            this.resize(baseWidth * ratio, baseHeight * ratio);
            this.scale(ratio, ratio);
        };

        /**
         * Resizes the canvas to a given size
         * @method
         * @param {number} width The width to resize to
         * @param {number} height The height to resize to
         */
        this.resize = function (width, height) {
            if (typeof width === "string") {
                width = parseFloat(width);
            }

            if (typeof height === "string") {
                height = parseFloat(height);
            }

            if (this.elm.width === width && this.elm.height === height) {
                return;
            }

            this.elm.width = width;
            this.elm.height = height;
            this.elm.style.width = width + "px";
            this.elm.style.height = height + "px";
        };

        /**
         * This will scale the canvas up without resizing the canvas. It only scales up everything that is being drawn (1, 1) is default (2, 2) would be 2x the size of default
         * @method
         * @param {Number} x The scale for the x-axis
         * @param {Number} y The scale for the y-axis
         */
        this.scale = function (x, y) {
            this.context.setTransform(1, 0, 0, 1, 0, 0);
            this.context.scale(x, y);

            this.viewScale.x = x;
            this.viewScale.y = y;
        };

        this.translate = function (x, y) {
            this.context.translate(x, y);
        };
    },
    /**
     * @namespace
     */
    canvasHelpers: {
        /**
         * @method updateRequestId
         * @param {web2d.canvas} canvas 
         */
        updateRequestId: function (canvas) {
            if (canvas.animationRequestId === 0) {
                return;
            }

            canvas.animationRequestId = window.requestAnimationFrame(() => {
                canvas.context.clearRect(0, 0, canvas.width * (1 / canvas.viewScale.x), canvas.height * (1 / canvas.viewScale.y));
                canvas.context.save();
                canvas.draw();
                canvas.context.restore();
                this.updateRequestId(canvas);
            });
        },

        /**
         * @method start
         * @param {web2d.canvas} canvas 
         */
        start: function (canvas) {
            canvas.animationRequestId = -1;
            this.updateRequestId(canvas);
        },

        /**
         * @method stop
         * @param {web2d.canvas} canvas 
         */
        stop: function (canvas) {
            if (canvas.animationRequestId) {
                window.cancelAnimationFrame(canvas.animationRequestId);
                canvas.animationRequestId = 0;
            }
        }
    },
    /**
     * Closes a display element so that it no longer is in the view. This effectively removes it from the DOM
     * @method
     * @param {Element} target
     */
    closeDisplay: function (target) {
        let that = this;
        let found = false;
        this.each(this.displays, (idx, val) => {
            if (target === null) {
                document.body.removeChild(val);
            } else {
                if (val === target) {
                    document.body.removeChild(val);
                    that.displays.removeAt(idx);
                    found = true;
                    return false;
                }
            }
        });

        if (!found) {
            document.body.removeChild(target);
        } else if (target === null) {
            this.displays = [];
        }
    },
    /**
     * A basic class to handle color (rgba) and its conversions for Canvas
     * @constructor
     * @param {Number} [r=255] A red value between 0 and 255 (inclusive)
     * @param {Number} [g=255] A green value between 0 and 255 (inclusive)
     * @param {Number} [b=255] A blue value between 0 and 255 (inclusive)
     * @param {Number} [a=1.0] An alpha between 0.0 and 1.0 (inclusive)
    */
    color: function (r, g, b, a) {
        /**
         * The red of this color which is between 0 and 255 (inclusinve)
         * @type {number}
         */
        this.r = web2d.undefined(r) ? 255 : r;

        /**
         * The green of this color which is between 0 and 255 (inclusinve)
         * @type {number}
         */
        this.g = web2d.undefined(g) ? 255 : g;

        /**
         * The blue of this color which is between 0 and 255 (inclusinve)
         * @type {number}
         */
        this.b = web2d.undefined(b) ? 255 : b;

        /**
         * The alpha of this color which is between 0.0 and 1.0 (inclusinve)
         * @type {number}
         */
        this.a = web2d.undefined(a) ? 1.0 : a;

        /**
         * Converts this color object to a Canvas readable color string "rgba(r,g,b,a)" or "rgb(r,g,b)"
         * @method
         * @param {boolean} [noAlpha=true] Set to false if alpha should not be included "rgb(r,g,b)"
         * @return {string} The Canvas readable color string
         */
        this.toStandard = function (noAlpha) {
            if (noAlpha == null || !noAlpha) {
                return "rgba(" + this.r + "," + this.g + "," + this.b + "," + this.a + ")";
            } else {
                return "rgb(" + this.r + "," + this.g + "," + this.b + ")";
            }
        };
    },
    /**
     * @namespace
     */
    cookie: {
        /**
         * Creates a cookie
         * @method
         * @param {string} name The name of the cookie
         * @param {string} value The value for the cookie
         * @param {number} exdays The number of days for the cookie to exist
         */
        set: function (name, value, exdays) {
            let d = new Date();
            d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
            let expires = "expires=" + d.toUTCString();
            document.cookie = name + "=" + value + "; " + expires;
        },
        /**
         * Gets the value of a cookie
         * @method
         * @param {string} cname The name of the cookie
         */
        get: function (name) {
            name = name + "=";
            let ca = document.cookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1);
                if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
            }

            return null;
        },
        /**
         * Deletes a cookie
         * @method
         * @param {string} name The name of the cookie
         */
        delete: function (name) {
            document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        }
    },
    /**
     * Get's the length of an array or the count of objects within an object
     * @method
     * @param {Array|Object} arr The array or object to count
     * @returns {number}
     */
    count: function (objarr) {
        if (objarr.length) {
            return objarr.length;
        }

        let count = 0;
        for (let key in objarr) {
            if (objarr.hasOwnProperty(key)) {
                count++;
            }
        }

        return count;
    },
    /**
     * Converts an integer into a date object
     * @method
     * @param {number} intDate The integer value for the date
     * @returns {Date}
     */
    dateFromInt: function (intDate) {
        if (typeof intDate === "undefined") {
            return null;
        }

        let y = intDate.substr(0, 4);
        let m = intDate.substr(4, 2);
        let d = intDate.substr(4, 2);
        return new Date(m + "/" + d + "/" + y);
    },
    /**
     * Displays an html snippet to the user (Creates it in the DOM)
     * @method
     * @param {string} file The name of the snippet to load
     * @param {Element} parent The element that will be the parent of the snippet elements
     * @param {Object} bindScope The scope that this element will be bound to
     */
    display: async function (file, parent, bindScope) {
        if (!parent) {
            parent = document.body;
        }

        let data = await this.http.get(file + ".html", {});
        let parser = new DOMParser();
        let htmlDoc = parser.parseFromString(data, "text/html");
        let elm = parent.appendChild(htmlDoc.body.firstChild);
        web2d.displays.push(elm);

        if (bindScope) {
            let refineScope = (str) => {
                let scope = bindScope;
                if (str.indexOf('.') >= 0) {
                    let parts = str.split('.');

                    for (let i = 0; i < parts.length - 1; i++) {
                        scope = scope[parts[i]];
                    }

                    return { scope: scope, val: parts[i] };
                }

                return { scope: scope, val: str };
            };

            let binding = (target) => {
                target.children.each((idx, child) => {
                    binding(child);
                });

                if (target.dataset.web2dClick) {
                    let data = refineScope(target.dataset.web2dClick);
                    target.addEventListener("click", data.scope[data.val].bind(data.scope, elm));
                }
            };

            binding(elm);
        }

        elm.web2d = {};
        elm.web2d.bindScope = bindScope;
        return elm;
    },
    /**
     * @method
     * @param {Array|Object} arrobj
     * @param {Function} callback
     */
    each: function (arrobj, callback) {
        for (let key in arrobj) {
            if (!arrobj.hasOwnProperty(key)) {
                continue;
            }

            if (key == "length" && Object.prototype.toString.call(arrobj) === "[object HTMLCollection]") {
                continue;
            }

            if (callback(key, arrobj[key]) === false) {
                break;
            }
        }
    },
    eachAsync: async function (arrobj, callback) {
        for (let key in arrobj) {
            if (!arrobj.hasOwnProperty(key)) {
                continue;
            }

            if (key == "length" && Object.prototype.toString.call(arrobj) === "[object HTMLCollection]") {
                continue;
            }

            let response = await callback(key, arrobj[key]);
            if (response === false) {
                break;
            }
        }
    },
    /**
     * The event class is responsible for registering multiple events to one function call much like C#'s "event" type
     * @constructor
     */
    event: function () {
        /**
         * The list of events to be fired when "Fire" is called
         * @type {Function[]}
         * @private
         */
        this._events = [];

        /**
         * Registers events to this objects event array to be called
         * @method
         * @param {Function} evt The function to be called
         * @param {Object} [obj=window] The object that the function belongs to
        */
        this.register = function (evt, obj) {
            this._events.push([evt, !obj ? window : obj]);
        };

        /**
         * Removes a specified function signature from the array
         * @method
         * @param {Function} event
         */
        this.remove = function (event) {
            for (let i = 0; i < this._events.length; i++) {
                if (this._events[i][0] === event) {
                    this._events.splice(i, 1);
                    break;
                }
            }
        };

        /**
         * Goes through all of the registered events and fires them off
         * @method
         * @param {Object[]} args All of the arguments to be mapped to the events (functions)
         */
        this.fire = function (args) {
            for (let i = 0; i < this._events.length; i++) {
                this._events[i][0].apply(this._events[i][1], args);
            }
        };

        /**
         * Clears out all the callbacks associated with this event
         */
        this.clear = function() {
            this._events.length = 0;
        };
    },
    getKeyWhere: function (object, value) {
        let found = null;
        object.each((k, v) => {
            if (v === value) {
                found = k;
                return false;
            }
        });

        return found;
    },
    /**
     * Get's a parameter from the page's query string
     * @method
     * @param {string} name The name of the query value to get
     */
    getParam: function (name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        let regex = new RegExp("[\\?&]" + name + "=([^&#]*)"), results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    },
    /**
     * @namespace
     */
    http: {
        /**
         * @method
         */
        xhr: function () {
            if (typeof XMLHttpRequest !== 'undefined') {
                return new XMLHttpRequest();
            }

            let versions = [
                "MSXML2.XmlHttp.6.0",
                "MSXML2.XmlHttp.5.0",
                "MSXML2.XmlHttp.4.0",
                "MSXML2.XmlHttp.3.0",
                "MSXML2.XmlHttp.2.0",
                "Microsoft.XmlHttp"
            ];

            let xhr;
            for (let i = 0; i < versions.length; i++) {
                try {
                    xhr = new ActiveXObject(versions[i]);
                    break;
                } catch (e) { }
            }

            return xhr;
        },
        /**
         * @method
         */
        send: function (url, method, data) {
            let that = this;
            return new Promise((resolve, reject) => {
                let x = that.xhr();

                if (method === "DOWNLOAD") {
                    x.open("GET", url);
                    x.responseType = 'blob';
                } else {
                    x.overrideMimeType("application/text");
                    x.open(method, url);
                }

                x.onreadystatechange = function () {
                    if (x.readyState == 4) {
                        let data = null;
                        if (method === "DOWNLOAD") {
                            data = x.response;
                        } else {
                            data = x.responseText;
                            try {
                                data = JSON.parse(x.responseText);
                            } catch (e) {
                                // Skip and just use raw text
                            }
                        }

                        resolve(data);
                    }
                };

                if (method === "POST") {
                    if (typeof data === "string") {
                        x.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                    } else {
                        x.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
                        data = JSON.stringify(data);
                    }
                }

                x.send(data);
            });
        },
        /**
         * @method
         */
        request: function (url, data, type) {
            if (type == "GET") {
                let query = [];

                if (data) {
                    for (let key in data) {
                        if (data.hasOwnProperty(key)) {
                            query.push(encodeURIComponent(key) + "=" + encodeURIComponent(data[key]));
                        }
                    }
                }

                if (url.indexOf("?") >= 0) {
                    url += (query.length ? "&" + query.join("&") : "");
                } else {
                    url += (query.length ? "?" + query.join("&") : "");
                }

                data = query.join("&");
            }

            return this.send(url, type, data);
        },
        /**
         * @method
         */
        get: function (url, data) {
            return this.request(url, data, "GET");
        },
        /**
         * @method
         */
        post: function (url, data) {
            return this.request(url, data, "POST");
        },
        /**
         * @method
         */
        put: function (url, data) {
            return this.request(url, data, "PUT");
        },
        /**
         * @method
         */
        delete: function (url, data) {
            return this.request(url, data, "DELETE");
        },
        /**
         * @method
         */
        download: function (url) {
            return this.request(url, null, "DOWNLOAD");
        }
    },
    /**
     * A default image class that allows for easy drawing in the engine
     * @constructor
     * @param {Image|String} src The native image object or string source of the image
     * @param {web2d.rectangle} rect The rectangle for the image to be drawn in
     * @param {Function} onLoad The method to call when the image has finished loading
     */
    image: function (src, onLoad) {
        /**
         * The actual native JavaScript Image object
         * @type {Image}
         */
        this.image = new Image();

        /** @type {web2d.vec2} */
        this.offset = new web2d.vec2();

        if (src != null) {
            if (typeof src === "string") {
                if (onLoad) {
                    this.image.onload = (() => {
                        onLoad(this);
                    });
                }

                this.image.src = src;
            } else {
                this.image = src;
                if (onLoad) {
                    onLoad(this);
                }
            }
        }

        this.setOffset = function (x, y) {
            this.offset.set(x, y);
        };

        /**
         * Used to load in an image for this object
         * @method load
         * @param {Image|String} src The native image object or string source of the image
         */
        this.load = function (src) {
            return new Promise((resolve, reject) => {
                if (typeof src === "string") {
                    this.image.onload = () => { resolve(); };
                    this.image.src = src;
                } else {
                    this.image = src;
                    resolve();
                }
            });
        };

        /**
         * Used to draw this image in a particular location on the canvas
         * @method
         * @param {web2d.canvas} canvas The canvas object to draw this image on
         * @param {Number} x The x position for this image to be drawn at
         * @param {Number} y The y position for this image to be drawn at
         * @param {Number} width The width to draw this image
         * @param {Number} height The height to draw this image
         */
        this.draw = function (canvas, x, y, width, height) {
            canvas.context.drawImage(this.image, x + this.offset.x, y + this.offset.y, width || this.image.width, height || this.image.height);
        };
    },
    /**
     * @namespace
     */
    input: {
        /**
         * @type {string}
         * @private
         */
        _keyString: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",

        /**
         * @type {string}
         * @private
         */
        _keyNumberStrings: "0123456789",

        /** @type {boolean} */
        Left: false,
        /** @type {boolean} */
        Right: false,
        /** @type {boolean} */
        Up: false,
        /** @type {boolean} */
        Down: false,
        /** @type {boolean} */
        Enter: false,
        /** @type {boolean} */
        Space: false,
        /** @type {boolean} */
        Period: false,
        /** @type {boolean} */
        Comma: false,
        /** @type {boolean} */
        Slash: false,
        /** @type {boolean} */
        Backslash: false,
        /** @type {boolean} */
        Escape: false,
        /** @type {boolean} */
        Backspace: false,
        /** @type {boolean} */
        Shift: false,
        /** @type {boolean} */
        Capslock: false,
        /** @type {boolean} */
        Tab: false,
        /** @type {boolean} */
        Backquote: false,
        /** @type {boolean} */
        Ctrl: false,
        /** @type {boolean} */
        Alt: false,
        /** @type {boolean} */
        Add: false,
        /** @type {boolean} */
        Subtract: false,
        /** @type {boolean} */
        /** @type {boolean} */
        Divide: false,
        /** @type {boolean} */
        Multiply: false,
        /** @type {boolean} */
        Decimal: false,
        /** @type {boolean} */
        mouseIsDown: false,
        /** @type {boolean} */
        mousePosition: null,
        /** @type {boolean} */
        offset: null,
        /** @type {boolean} */
        clamp: null,

        /** @type {{name: number}} */
        keys: {
            /** @type {number} */
            Left: 37,
            /** @type {number} */
            Up: 38,
            /** @type {number} */
            Right: 39,
            /** @type {number} */
            Down: 40,
            /** @type {number} */
            Enter: 13,
            /** @type {number} */
            Space: 32,
            /** @type {number} */
            Period: 190,
            /** @type {number} */
            Comma: 188,
            /** @type {number} */
            Slash: 191,
            /** @type {number} */
            Backslash: 220,
            /** @type {number} */
            Escape: 27,
            /** @type {number} */
            Backspace: 8,
            /** @type {number} */
            Backspace: 46,
            /** @type {number} */
            Shift: 16,
            /** @type {number} */
            Capslock: 20,
            /** @type {number} */
            Tab: 9,
            /** @type {number} */
            Backquote: 192,
            /** @type {number} */
            Ctrl: 17,
            /** @type {number} */
            Alt: 18,
            /** @type {number} */
            Add: 107,
            /** @type {number} */
            Subtract: 109,
            /** @type {number} */
            Divide: 111,
            /** @type {number} */
            Multiply: 106,
            /** @type {number} */
            Decimal: 110
        },
        /**
         * @method
         * @param {Event} evt
         * @private
         */
        _inputMousePosition: function (evt) {
            evt = evt || window.event;
            let isTouch = web2d.undefined(evt.clientX);

            this.mousePosition.x = !isTouch ? evt.clientX : evt.changedTouches[0].clientX;
            this.mousePosition.y = !isTouch ? evt.clientY : evt.changedTouches[0].clientY;

            this.mouseMove.fire([this.mousePosition.x, this.mousePosition.y]);
        },
        /**
         * @method
         * @private
         */
        _inputMouseDown: function () {
            this.mouseIsDown = true;
            this.mouseDown.fire([this.mousePosition]);
        },
        /**
         * @method
         * @private
         */
        _inputMouseUp: function () {
            this.mouseIsDown = false;
            this.mouseUp.fire();
        },
        /**
         * @method
         * @private
         */
        _inputKeyDown: function (key) {
            if (this._setKeyDown(key)) {
                this.keyDown.fire([key]);
            }
        },
        /**
         * @method
         * @private
         */
        _inputKeyUp: function (key) {
            if (this._setKeyUp(key)) {
                this.keyUp.fire([key]);
            }
        },

        /**
         * Fired when a key has been pressed
         * @event web2d.input.keyDown
         * @param {Number} keycode The code of the key that was pressed
         */
        keyDown: null,

        /**
         * Fired when a key has been released
         * @event web2d.input.keyUp
         * @param {Number} keycode The code of the key that was pressed
         */
        keyUp: null,

        /**
         * Fired when the mouse button has been pressed
         * @event web2d.input.mouseDown
         */
        mouseDown: null,

        /**
         * Fired when the mouse button has been released
         * @event web2d.input.mouseUp
         */
        mouseUp: null,

        /**
         * Fired when the mouse has changed position
         * @event web2d.input.mouseMove
         * @param {Number} x The x position of the mouse after the update
         * @param {Number} y The y position of the mouse after the update
         */
        mouseMove: null,

        /**
         * Fired when the mouse wheel has scrolled
         * @event web2d.input.mouseWheel
         * @param {number} scrollCount The scroll count (direction)
         */
        wheelScroll: null,

        /**
         * @method
         * @param {Object} key
         * @private
         */
        _setKeyDown: function (key) {
            for (let i = 0; i < this._keyString.length; i++) {
                if (key.keyCode === this.keys[this._keyString[i]]) {
                    if (this[this._keyString.charAt(i)]) {
                        return false;
                    }

                    this[this._keyString.charAt(i)] = true;
                    return true;
                }
            }

            for (let i = 0; i < this._keyNumberStrings.length; i++) {
                if (key.keyCode === this.keys["Num" + this._keyNumberStrings[i]]) {
                    if (this["Num" + this._keyNumberStrings.charAt(i)])
                        return false;

                    this["Num" + this._keyNumberStrings.charAt(i)] = true;
                    return true;
                }
            }

            for (let i = 0; i < this._keyNumberStrings.length; i++) {
                if (key.keyCode === this.keys["Numpad" + this._keyNumberStrings[i]]) {
                    if (this["Numpad" + this._keyNumberStrings.charAt(i)])
                        return false;

                    this["Numpad" + this._keyNumberStrings.charAt(i)] = true;
                    return true;
                }
            }

            let startVal = false;
            if (key.keyCode == this.keys.Left) {
                startVal = this.Left;
                this.Left = true;
            } else if (key.keyCode == this.keys.Right) {
                startVal = this.Right;
                this.Right = true;
            } else if (key.keyCode == this.keys.Up) {
                startVal = this.Up;
                this.Up = true;
            } else if (key.keyCode == this.keys.Down) {
                startVal = this.Down;
                this.Down = true;
            } else if (key.keyCode == this.keys.Enter) {
                startVal = this.Enter;
                this.Enter = true;
            } else if (key.keyCode == this.keys.Space) {
                startVal = this.Space;
                this.Space = true;
            } else if (key.keyCode == this.keys.Period) {
                startVal = this.Period;
                this.Period = true;
            } else if (key.keyCode == this.keys.Comma) {
                startVal = this.Comma;
                this.Comma = true;
            } else if (key.keyCode == this.keys.Slash) {
                startVal = this.Slash;
                this.Slash = true;
            } else if (key.keyCode == this.keys.Backslash) {
                startVal = this.Backslash;
                this.Backslash = true;
            } else if (key.keyCode == this.keys.Escape) {
                startVal = this.Escape;
                this.Escape = true;
            } else if (key.keyCode == this.keys.Backspace) {
                startVal = this.Backspace;
                this.Backspace = true;
            } else if (key.keyCode == this.keys.Delete) {
                startVal = this.Delete;
                this.Delete = true;
            } else if (key.keyCode == this.keys.Shift) {
                startVal = this.Shift;
                this.Shift = true;
            } else if (key.keyCode == this.keys.Capslock) {
                startVal = this.Capslock;
                this.Capslock = true;
            } else if (key.keyCode == this.keys.Tab) {
                startVal = this.Tab;
                this.Tab = true;
            } else if (key.keyCode == this.keys.Backquote) {
                startVal = this.Backquote;
                this.Backquote = true;
            } else if (key.keyCode == this.keys.Ctrl) {
                startVal = this.Ctrl;
                this.Ctrl = true;
            } else if (key.keyCode == this.keys.Alt) {
                startVal = this.Alt;
                this.Alt = true;
            } else if (key.keyCode == this.keys.Add) {
                startVal = this.Add;
                this.Addtrue;
            } else if (key.keyCode == this.keys.Subtract) {
                startVal = this.Subtract;
                this.Subtract = true;
            } else if (key.keyCode == this.keys.Divide) {
                startVal = this.Divide;
                this.Divide = true;
            } else if (key.keyCode == this.keys.Multiply) {
                startVal = this.Multiply;
                this.Multiply = true;
            } else if (key.keyCode == this.keys.Decimal) {
                startVal = this.Decimal;
                this.Decimal = true;
            }

            return !startVal;
        },

        /**
         * @method
         * @param {Object} key
         * @private
         */
        _setKeyUp: function (key) {
            for (let i = 0; i < this._keyString.length; i++) {
                if (key.keyCode === this.keys[this._keyString[i]]) {
                    if (!this[this._keyString.charAt(i)])
                        return false;

                    this[this._keyString.charAt(i)] = false;
                    return true;
                }
            }

            for (let i = 0; i < this._keyNumberStrings.length; i++) {
                if (key.keyCode === this.keys["Num" + this._keyNumberStrings[i]]) {
                    if (!this["Num" + this._keyNumberStrings.charAt(i)])
                        return false;

                    this["Num" + this._keyNumberStrings.charAt(i)] = false;
                    return true;
                }
            }

            for (let i = 0; i < this._keyNumberStrings.length; i++) {
                if (key.keyCode === this.keys["Numpad" + this._keyNumberStrings[i]]) {
                    if (!this["Numpad" + this._keyNumberStrings.charAt(i)])
                        return false;

                    this["Numpad" + this._keyNumberStrings.charAt(i)] = false;
                    return true;
                }
            }

            let startVal = false;
            if (key.keyCode == this.keys.Left) {
                startVal = this.Left;
                this.Left = false;
            } else if (key.keyCode == this.keys.Right) {
                startVal = this.Right;
                this.Right = false;
            } else if (key.keyCode == this.keys.Up) {
                startVal = this.Up;
                this.Up = false;
            } else if (key.keyCode == this.keys.Down) {
                startVal = this.Down;
                this.Down = false;
            } else if (key.keyCode == this.keys.Enter) {
                startVal = this.Enter;
                this.Enter = false;
            } else if (key.keyCode == this.keys.Space) {
                startVal = this.Space;
                this.Space = false;
            } else if (key.keyCode == this.keys.Period) {
                startVal = this.Period;
                this.Period = false;
            } else if (key.keyCode == this.keys.Comma) {
                startVal = this.Comma;
                this.Comma = false;
            } else if (key.keyCode == this.keys.Slash) {
                startVal = this.Slash;
                this.Slash = false;
            } else if (key.keyCode == this.keys.Backslash) {
                startVal = this.Backslash;
                this.Backslash = false;
            } else if (key.keyCode == this.keys.Escape) {
                startVal = this.Escape;
                this.Escape = false;
            } else if (key.keyCode == this.keys.Backspace) {
                startVal = this.Backspace;
                this.Backspace = false;
            } else if (key.keyCode == this.keys.Delete) {
                startVal = this.Delete;
                this.Delete = false;
            } else if (key.keyCode == this.keys.Shift) {
                startVal = this.Shift;
                this.Shift = false;
            } else if (key.keyCode == this.keys.Capslock) {
                startVal = this.Capslock;
                this.Capslock = false;
            } else if (key.keyCode == this.keys.Tab) {
                startVal = this.Tab;
                this.Tab = false;
            } else if (key.keyCode == this.keys.Backquote) {
                startVal = this.Backquote;
                this.Backquote = false;
            } else if (key.keyCode == this.keys.Ctrl) {
                startVal = this.Ctrl;
                this.Ctrl = false;
            } else if (key.keyCode == this.keys.Alt) {
                startVal = this.Alt;
                this.Alt = false;
            } else if (key.keyCode == this.keys.Add) {
                startVal = this.Add;
                this.Add = false;
            } else if (key.keyCode == this.keys.Subtract) {
                startVal = this.Subtract;
                this.Subtract = false;
            } else if (key.keyCode == this.keys.Divide) {
                startVal = this.Divide;
                this.Divide = false;
            } else if (key.keyCode == this.keys.Multiply) {
                startVal = this.Multiply;
                this.Multiply = false;
            } else if (key.keyCode == this.keys.Decimal) {
                startVal = this.Decimal;
                this.Decimal = false;
            }

            return startVal;
        },

        /**
         * @method
         * @param {WheelEvent} evt
         */
        _wheelScroll: function (evt) {
            this.wheelScroll.fire([evt.deltaY]);
        },

        /**
         * Checks to see if the passed keyname matches a key that is currently being held down
         * @method
         * @param {String} keyname The name of the key to check
         * @return Literal True if the letter is currently held down
         */
        isKeyDown: function (keyname) {
            return this[keyname.toUpperCase()];
        },

        /**
         * Checks to see if the passed keyname matches a key that is currently released
         * @method
         * @param {String} keyname The name of the key to check
         * @return Literal True if the letter is currently released
         */
        isKeyUp: function (keyname) {
            return !this[keyname.toUpperCase()];
        },

        /**
         * Checks to see if the mouse button is currently being held down
         * @method
         * @return Literal True if the mouse button is currently held down
         */
        isMouseDown: function () {
            return this.mouseIsDown;
        },

        /**
         * Checks to see if the mouse button is currently released
         * @method
         * @return Literal True if the mouse button is currently released
         */
        isMouseUp: function () {
            return !this.mouseIsDown;
        }
    },
    lerp: function (v0, v1, t) {
        return (1 - t) * v0 + t * v1;
    },
    /**
     * Dynamically loads a CSS file into the current DOM
     * @method
     * @param {string} baseOrAbsolute The folder that the CSS file is in
     * @param {string} file The CSS file name
     */
    loadCSS: async function (baseOrAbsolute, file) {
        let filePath = "";
        if (baseOrAbsolute && file) {
            if (baseOrAbsolute[baseOrAbsolute.length - 1] !== "/") {
                baseOrAbsolute += "/";
            }

            filePath = baseOrAbsolute + file + ".js";
        } else if (baseOrAbsolute) {
            filePath = baseOrAbsolute;
        }

        let data = await this.http.get(filePath + ".css", {});
        let style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = data;
        document.getElementsByTagName('head')[0].appendChild(style);
    },
    /**
     * @namespace
     */
    net: {
        /**
         * @constructor
         */
        client: function () {
            /** @type {WebSocket} */
            this.socket = null;

            /** @type {web2d.event} */
            this.message = new web2d.event();

            /** @type {web2d.event} */
            this.error = new web2d.event();

            /**
             * Used to connect to a WebSocket server
             * @method
             * @param {string} host The host address
             * @param {string} port The host port number
             */
            this.connect = function (host, port) {
                let that = this;
                return new Promise((resolve, reject) => {
                    try {
                        that.socket = new WebSocket("ws://" + host + ":" + port + "/");
                    } catch (e) {
                        reject("Your browser currently doesn't support web sockets, please upgrade your browser to chat!");
                        return;
                    }

                    that.socket.onopen = function (event) {
                        resolve(event);
                    };

                    that.socket.onerror = function (event) {
                        that.error.fire([event]);
                    };

                    that.socket.onmessage = function (event) {
                        that.message.fire([event]);
                    };
                });
            };

            /**
             * Sends data to the server in string or JSON object format
             * @method
             * @param {string|Object} message The string or JSON object to send to the server
             */
            this.send = function (message) {
                if (!message) {
                    return;
                }

                let json = {};
                if (typeof message === "string") {
                    json.message = message;
                } else {
                    json = message;
                }

                try {
                    this.socket.send(JSON.stringify(json));
                } catch (e) {
                    this.close();
                }
            };

            /**
             * Closes the connection with the server
             * @method
             */
            this.close = function () {
                this.socket.close();
            };
        }
    },
    /**
     * Converts new lines to <br> characters in code
     * @method
     * @param {string} str The string to have the new lines converted
     * @param {boolean} is_xhtml Used to determine if this is going to be a self closing tag
     */
    nl2br: function (str, is_xhtml) {
        let breakTag = is_xhtml || typeof is_xhtml === 'undefined' ? '<br />' : '<br>';
        return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
    },
    /**
     * Used to create a standard web browser notification window
     * @method
     * @param {string} title The title for the notification
     * @param {string} message The message for the notification
     * @returns {Promise}
     */
    notification: function (title, message, icon) {
        return new Promise((resolve, reject) => {
            // Let's check if the browser supports notifications
            if (!("Notification" in window)) {
                reject("Not supported by browser");
                return;
            }

            let notification = null;
            if (Notification.permission === "granted") {
                let options = {};

                if (message) {
                    options.body = message;
                }

                if (icon) {
                    options.icon = icon;
                }

                notification = new Notification(title, options);
            } else if (Notification.permission !== "denied") {
                Notification.requestPermission((permission) => {
                    // If the user accepts, let's create a notification
                    if (permission === "granted") {
                        let options = {};

                        if (message) {
                            options.body = message;
                        }

                        if (icon) {
                            options.icon = icon;
                        }

                        notification = new Notification(title, options);
                    }
                });
            } else {
                reject("Access denied");
            }

            if (notification) {
                notification.onclick = function (event) {
                    resolve(event);
                };
            }
        });
    },
    navigation: {
        /**
         * @class
         * @constructor
         * @param {number} i The id of the node
         * @param {number} x The x position of the node
         * @param {number} y The y position of the node
         * @param {number} s The size of the node
         */
        gridNode: function (i, x, y, s) {
            this.left = false;
            this.right = false;
            this.id = i;
            this.x = x;
            this.y = y;
            this.centerX = x + (s / 2);
            this.centerY = y + (s / 2);
            this.parent = -1;
            this.g = 0;
            this.h = 0;
            this.f = 0;
            this.size = s;

            this.rect = new web2d.rectangle(x, y, s, s, new web2d.color(0, 0, 0, 0));
        },
        /**
         * @class
         * @constructor
         * @param {number} width The width of the grid
         * @param {number} height The height of the grid
         * @param {number} size The size of each node
         */
        grid: function (width, height, size) {
            this.width = width;
            this.height = height;
            this.size = size;
            this.nodes = [];

            /**
             * Nodes inversely interpreted by the blocked grid nodes that can be moved to
             * @type {web2d.navigation.gridNode}
             * @private
             */
            this.openGridNodes = [];

            /**
             * Nodes interpreted by the blocked grid nodes that can't be moved to
             * @type {web2d.navigation.gridNode}
             * @private
             */
            this.closedGridNodes = [];

            /**
             * The grid nodes that are blocked and can't be moved to
             * @type {web2d.navigation.gridNode}
             */
            this.blockedGridNodes = [];

            this.left = function (location) {
                return location - 1;
            };

            this.right = function (location) {
                if (this.nodes.length - 1 > location) {
                    return location + 1;
                } else {
                    return -1;
                }
            };

            this.up = function (location) {
                let id = -1;

                for (let i = location - 1; i > 0; i--) {
                    if (this.nodes[i].x == this.nodes[location].x
                        && this.nodes[i].y != this.nodes[location].y) {
                        id = i;
                        break;
                    }
                }

                return id;
            };

            this.upLeft = function (location) {
                let id = -1;

                let test = (location - 1) - this.width;
                if (test >= 0)
                    if (!this.nodes[test].right)
                        id = test;

                return id;
            };

            this.upRight = function (location) {
                let id = -1;

                let test = (location + 1) - this.width;
                if (test >= 0)
                    if (!this.nodes[test].left)
                        id = test;

                return id;
            };

            this.down = function (location) {
                let id = -1;

                for (let i = location + 1; i < this.nodes.length; i++) {
                    if (this.nodes[i].x == this.nodes[location].x
                        && this.nodes[i].y != this.nodes[location].y) {
                        id = i;
                        break;
                    }
                }

                return id;
            };

            this.downLeft = function (location) {
                let id = -1;

                let test = (location - 1) + this.width;
                if (test < this.nodes.length) {
                    if (!this.nodes[test].right) {
                        id = test;
                    }
                }

                return id;
            };

            this.downRight = function (location) {
                let id = -1;

                let test = (location + 1) + this.width;
                if (test < this.nodes.length) {
                    if (!this.nodes[test].left) {
                        id = test;
                    }
                }

                return id;
            };

            let tempCount = 0;
            for (let i = 0; i < this.height; i++) {
                for (let j = 0; j < this.width; j++) {
                    this.nodes.push(new web2d.navigation.gridNode(tempCount, (j * this.size), (i * this.size), this.size));
                    if (j === 0) {
                        this.nodes[this.nodes.length - 1].left = true;
                    }

                    tempCount++;
                }

                this.nodes[this.nodes.length - 1].right = true;
            };
        },
        /**
         * @constructor
         * @param {number} width The width of the grid
         * @param {number} height The height of the grid
         * @param {number} size The size of each node
         * @param {bool} octogonal The size of each node
         */
        pathFinder: function (width, height, size, octogonal) {
            this.grid = new web2d.navigation.grid(width, height, size);
            this.start = 0;
            this.end = 0;
            this.path = [];
            this.back = 0;
            if (!octogonal) {
                this.octogonal = true;
            } else {
                this.octogonal = octogonal;
            }

            this.nodeCount = 0;

            /**
             * Used to calculate the path that the object will need to take
             * @param {web2d.vec2} start The starting position (the position of the object)
             * @param {web2d.vec2} end The ending position (the desired position of the object)
             * @return {web2d.vec2[]} An array of <c>web2d.vec2</c> with all of the positions required to move to
             */
            this.findPath = function (start, end) {
                this.start = -1;
                this.end = -1;

                for (let i = 0; i < this.grid.nodes.length; i++) {
                    if (this.grid.nodes[i].rect.contains(start.x, start.y)) {
                        this.start = i;
                    }

                    if (this.grid.nodes[i].rect.contains(end.x, end.y)) {
                        this.end = i;
                    }

                    if (this.start >= 0 && this.end >= 0) {
                        break;
                    }
                }

                this.path.clear();
                this.grid.openGridNodes.clear();
                this.grid.closedGridNodes.clear();

                for (let i = 0; i < this.grid.nodes.length; i++) {
                    this.grid.nodes[i].g = 0;
                    this.grid.nodes[i].h = 0;
                    this.grid.nodes[i].f = 0;
                    this.grid.nodes[i].parent = -1;
                }

                this.grid.nodes[this.start].g = 0;
                this.grid.nodes[this.start].h = 0;
                this.grid.nodes[this.start].f = 0;

                this.nodeCount = this.start;
                this.back = this.end;

                let goodPath = true;
                while (true) {
                    let temp = this.calculate();
                    if (temp == this.end) {
                        break;
                    } else if (temp == -1) {
                        goodPath = false;
                        break;
                    }
                }

                if (goodPath) {
                    this.path.push(new web2d.vec2(this.grid.nodes[this.end].x, this.grid.nodes[this.end].y));
                    while (true) {
                        if (this.reCalculate() == this.start) {
                            break;
                        }
                    }
                }

                if (this.path && this.path.length) {
                    let head = this.path.head(),
                        tail = this.path.tail();

                    if (head.equals(tail)) {
                        return [];
                    }

                    return this.path.removeAt(-1).reverse();
                }

                return this.path;
            };

            this.calculate = function () {
                this.cgf(this.nodeCount);

                let loc = -1;
                let f = -1;
                let fCount = -1;
                for (let i = 0; i < this.grid.openGridNodes.length; i++) {
                    if (f > this.grid.nodes[this.grid.openGridNodes[i]].f || f < 1) {
                        f = this.grid.nodes[this.grid.openGridNodes[i]].f;
                        fCount = this.grid.openGridNodes[i];
                        loc = i;
                    }
                }

                if (fCount == -1) {
                    return -1;
                }

                this.nodeCount = fCount;
                this.grid.closedGridNodes.push(fCount);
                this.grid.openGridNodes.removeAt(loc);
                return fCount;
            };

            this.reCalculate = function () {
                this.back = this.grid.nodes[this.back].parent;
                this.path.push(new web2d.vec2(this.grid.nodes[this.back].x, this.grid.nodes[this.back].y));

                return this.back;
            };

            this.cgf = function (nodeNum) {
                let r = this.grid.right(nodeNum), l = this.grid.left(nodeNum), u = this.grid.up(nodeNum), d = this.grid.down(nodeNum);
                if (this.octogonal) {
                    var ul = this.grid.upLeft(nodeNum), ur = this.grid.upRight(nodeNum), dl = this.grid.downLeft(nodeNum), dr = this.grid.downRight(nodeNum);
                }

                if (this.grid.nodes[nodeNum].left) {
                    l = -1;
                }

                if (this.grid.nodes[nodeNum].right) {
                    r = -1;
                }

                if (!this.grid.closedGridNodes.contains(u) && !this.grid.blockedGridNodes.contains(u) && u >= 0) {
                    if (!this.grid.openGridNodes.contains(u)) {
                        this.grid.nodes[u].g = this.grid.nodes[nodeNum].g + 10;

                        if (this.grid.nodes[u].h == 0) {
                            this.grid.nodes[u].h = this.findH(u);
                        }

                        this.grid.nodes[u].f = this.grid.nodes[u].g + this.grid.nodes[u].h;
                        this.grid.nodes[u].parent = nodeNum;
                        this.grid.openGridNodes.push(u);
                    } else {
                        if (this.grid.nodes[nodeNum].g + 10 < this.grid.nodes[u].g) {
                            this.grid.nodes[u].g = this.grid.nodes[nodeNum].g + 10;
                            this.grid.nodes[u].f = this.grid.nodes[u].g + this.grid.nodes[u].h;
                            this.grid.nodes[u].parent = nodeNum;
                        }
                    }
                }

                if (this.octogonal) {
                    if (!this.grid.closedGridNodes.contains(ul) && !this.grid.blockedGridNodes.contains(ul) && ul >= 0) {
                        if (!this.grid.openGridNodes.contains(ul)) {
                            this.grid.nodes[ul].g = this.grid.nodes[nodeNum].g + 14;

                            if (this.grid.nodes[ul].h == 0) {
                                this.grid.nodes[ul].h = this.findH(ul);
                            }

                            this.grid.nodes[ul].f = this.grid.nodes[ul].g + this.grid.nodes[ul].h;
                            this.grid.nodes[ul].parent = nodeNum;
                            this.grid.openGridNodes.push(ul);
                        } else {
                            if (this.grid.nodes[nodeNum].g + 14 < this.grid.nodes[ul].g) {
                                this.grid.nodes[ul].g = this.grid.nodes[nodeNum].g + 14;
                                this.grid.nodes[ul].f = this.grid.nodes[ul].g + this.grid.nodes[ul].h;
                                this.grid.nodes[ul].parent = nodeNum;
                            }
                        }
                    }

                    if (!this.grid.closedGridNodes.contains(ur) && !this.grid.blockedGridNodes.contains(ur) && ur >= 0) {
                        if (!this.grid.openGridNodes.contains(ur)) {
                            this.grid.nodes[ur].g = this.grid.nodes[nodeNum].g + 14;

                            if (this.grid.nodes[ur].h == 0) {
                                this.grid.nodes[ur].h = this.findH(ur);
                            }

                            this.grid.nodes[ur].f = this.grid.nodes[ur].g + this.grid.nodes[ur].h;
                            this.grid.nodes[ur].parent = nodeNum;
                            this.grid.openGridNodes.push(ur);
                        } else {
                            if (this.grid.nodes[nodeNum].g + 14 < this.grid.nodes[ur].g) {
                                this.grid.nodes[ur].g = this.grid.nodes[nodeNum].g + 14;
                                this.grid.nodes[ur].f = this.grid.nodes[ur].g + this.grid.nodes[ur].h;
                                this.grid.nodes[ur].parent = nodeNum;
                            }
                        }
                    }
                }

                if (!this.grid.closedGridNodes.contains(d) && !this.grid.blockedGridNodes.contains(d) && d >= 0) {
                    if (!this.grid.openGridNodes.contains(d)) {
                        this.grid.nodes[d].g = this.grid.nodes[nodeNum].g + 10;

                        if (this.grid.nodes[d].h == 0) {
                            this.grid.nodes[d].h = this.findH(d);
                        }

                        this.grid.nodes[d].f = this.grid.nodes[d].g + this.grid.nodes[d].h;
                        this.grid.nodes[d].parent = nodeNum;
                        this.grid.openGridNodes.push(d);
                    } else {
                        if (this.grid.nodes[nodeNum].g + 10 < this.grid.nodes[d].g) {
                            this.grid.nodes[d].g = this.grid.nodes[nodeNum].g + 10;
                            this.grid.nodes[d].f = this.grid.nodes[d].g + this.grid.nodes[d].h;
                            this.grid.nodes[d].parent = nodeNum;
                        }
                    }
                }

                if (this.octogonal) {
                    if (!this.grid.closedGridNodes.contains(dl) && !this.grid.blockedGridNodes.contains(dl) && dl >= 0) {
                        if (!this.grid.openGridNodes.contains(dl)) {
                            this.grid.nodes[dl].g = this.grid.nodes[nodeNum].g + 14;

                            if (this.grid.nodes[dl].h == 0) {
                                this.grid.nodes[dl].h = this.findH(dl);
                            }

                            this.grid.nodes[dl].f = this.grid.nodes[dl].g + this.grid.nodes[dl].h;
                            this.grid.nodes[dl].parent = nodeNum;
                            this.grid.openGridNodes.push(dl);
                        } else {
                            if (this.grid.nodes[nodeNum].g + 14 < this.grid.nodes[dl].g) {
                                this.grid.nodes[dl].g = this.grid.nodes[nodeNum].g + 14;
                                this.grid.nodes[dl].f = this.grid.nodes[dl].g + this.grid.nodes[dl].h;
                                this.grid.nodes[dl].parent = nodeNum;
                            }
                        }
                    }

                    if (!this.grid.closedGridNodes.contains(dr) && !this.grid.blockedGridNodes.contains(dr) && dr >= 0) {
                        if (!this.grid.openGridNodes.contains(dr)) {
                            this.grid.nodes[dr].g = this.grid.nodes[nodeNum].g + 14;

                            if (this.grid.nodes[dr].h == 0) {
                                this.grid.nodes[dr].h = this.findH(dr);
                            }

                            this.grid.nodes[dr].f = this.grid.nodes[dr].g + this.grid.nodes[dr].h;
                            this.grid.nodes[dr].parent = nodeNum;
                            this.grid.openGridNodes.push(dr);
                        } else {
                            if (this.grid.nodes[nodeNum].g + 14 < this.grid.nodes[dr].g) {
                                this.grid.nodes[dr].g = this.grid.nodes[nodeNum].g + 14;
                                this.grid.nodes[dr].f = this.grid.nodes[dr].g + this.grid.nodes[dr].h;
                                this.grid.nodes[dr].parent = nodeNum;
                            }
                        }
                    }
                }

                if (!this.grid.closedGridNodes.contains(l) && !this.grid.blockedGridNodes.contains(l) && l >= 0) {
                    if (!this.grid.openGridNodes.contains(l)) {
                        this.grid.nodes[l].g = this.grid.nodes[nodeNum].g + 10;

                        if (this.grid.nodes[l].h == 0) {
                            this.grid.nodes[l].h = this.findH(l);
                        }

                        this.grid.nodes[l].f = this.grid.nodes[l].g + this.grid.nodes[l].h;
                        this.grid.nodes[l].parent = nodeNum;
                        this.grid.openGridNodes.push(l);
                    } else {
                        if (this.grid.nodes[nodeNum].g + 10 < this.grid.nodes[l].g) {
                            this.grid.nodes[l].g = this.grid.nodes[nodeNum].g + 10;
                            this.grid.nodes[l].f = this.grid.nodes[l].g + this.grid.nodes[l].h;
                            this.grid.nodes[l].parent = nodeNum;
                        }
                    }
                }

                if (!this.grid.closedGridNodes.contains(r) && !this.grid.blockedGridNodes.contains(r) && r >= 0) {
                    if (!this.grid.openGridNodes.contains(r)) {
                        this.grid.nodes[r].g = this.grid.nodes[nodeNum].g + 10;

                        if (this.grid.nodes[r].h == 0) {
                            this.grid.nodes[r].h = this.findH(r);
                        }

                        this.grid.nodes[r].f = this.grid.nodes[r].g + this.grid.nodes[r].h;
                        this.grid.nodes[r].parent = nodeNum;
                        this.grid.openGridNodes.push(r);
                    } else {
                        if (this.grid.nodes[nodeNum].g + 10 < this.grid.nodes[r].g) {
                            this.grid.nodes[r].g = this.grid.nodes[nodeNum].g + 10;
                            this.grid.nodes[r].f = this.grid.nodes[r].g + this.grid.nodes[r].h;
                            this.grid.nodes[r].parent = nodeNum;
                        }
                    }
                }
            };

            this.findH = function (nodeNum) {
                if (this.grid.nodes[this.end].y != this.grid.nodes[nodeNum].y) {
                    if (this.grid.nodes[this.end].y < this.grid.nodes[nodeNum].y) {
                        for (let j = 0; j < (this.grid.height / this.grid.size); j++) {
                            if (this.grid.nodes[this.end].y == this.grid.nodes[nodeNum - ((this.grid.width / this.grid.size) * j)].y) {
                                if (nodeNum - ((this.grid.width / this.grid.size) * j) == this.end) {
                                    return j * 10;
                                } else if (nodeNum - ((this.grid.width / this.grid.size) * j) > this.end) {
                                    for (let k = 0; k < this.grid.width; k--) {
                                        if (nodeNum - ((this.grid.width / this.grid.size) * j) + k == this.end) {
                                            return (j * 10) + ((k * -1) * 10);
                                        }
                                    }
                                } else {
                                    for (let k = 0; k < this.grid.width; k++) {
                                        if (nodeNum - ((this.grid.width / this.grid.size) * j) + k == this.end) {
                                            return (j * 10) + (k * 10);
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        for (let j = 0; j < (this.grid.height / this.grid.size); j++) {
                            if (this.grid.nodes[this.end].y == this.grid.nodes[nodeNum + ((this.grid.width / this.grid.size) * j)].y) {
                                if (nodeNum + ((this.grid.width / this.grid.size) * j) == this.end) {
                                    return j * 10;
                                } else if (nodeNum + ((this.grid.width / this.grid.size) * j) > this.end) {
                                    for (let k = 0; k < this.grid.width; k--) {
                                        if (nodeNum + ((this.grid.width / this.grid.size) * j) + k == this.end) {
                                            return (j * 10) + ((k * -1) * 10);
                                        }
                                    }
                                } else {
                                    for (let k = 0; k < this.grid.width; k++) {
                                        if (nodeNum + ((this.grid.width / this.grid.size) * j) + k == this.end) {
                                            return (j * 10) + (k * 10);
                                        }
                                    }
                                }
                            }
                        }
                    }
                } else {
                    if (nodeNum == this.end) {
                        return 0;
                    } else if (nodeNum > this.end) {
                        for (let k = -1; k > -this.grid.width; k--) {
                            if (nodeNum + k == this.end) {
                                return (k * -1) * 10;
                            }
                        }
                    } else {
                        for (let k = 1; k < this.grid.width; k++) {
                            if (nodeNum + k == this.end) {
                                return k * 10 - 10;
                            }
                        }
                    }
                }

                return 0;
            };
        }
    },
    /**
     * Used to quickly print the current call stack for debugging
     * @method
     */
    printCallStack: function () {
        console.log(new Error().stack);
    },
    /**
     * A simple rectangle that can be used for placement, collision detection or even for debugging	
     * @constructor
     * @param {Number} x The x position for the rectangle
     * @param {Number} y The y position for the rectangle
     * @param {Number} w The width for the rectangle
     * @param {Number} h The height for the rectangle
     * @param {web2d.color} color The color for the debug draw of the rectangle
     */
    rectangle: function (x, y, w, h, color) {
        /** @type {web2d.vec2} */
        this.pos = new web2d.vec2(x || 0, y || 0);

        this.__defineSetter__("x", val => {
            this.pos.x = val;
        });

        this.__defineSetter__("y", val => {
            this.pos.y = val;
        });

        this.__defineGetter__("x", () => {
            return this.pos.x;
        });

        this.__defineGetter__("y", () => {
            return this.pos.y;
        });

        /**
         * The width of the web2d.rectangle
         * @type {number}
         */
        this.width = !w ? 0 : w;

        /**
         * The height of the web2d.rectangle
         * @type {number}
         */
        this.height = !h ? 0 : h;

        /**
         * The color of the web2d.rectangle to be used for debug drawing
         * @type {web2d.color}
         */
        this.color = color;

        /**
         * Checks to see if a point in 2D space (x and y) are within this web2d.rectangle's bounds
         * @method
         * @param {Number} x The x position to check if within this web2d.rectangle
         * @param {Number} y The y position to check if within this web2d.rectangle
         * @return {boolean} True if the x and y vector is within this rectangle
         */
        this.contains = function (x, y) {
            return x >= this.pos.x && x < this.pos.x + this.width && y >= this.pos.y && y < this.pos.y + this.height;
        };

        /**
         * Check to see if this web2d.rectangle is intersecting another web2d.rectangle
         * @method
         * @param {web2d.rectangle} other The other rectangle to check against
         * @param {web2d.vec2} [offset=null] The offset for this rectangle (usually a camera position)
         * @return {boolean} True if intersection other rectangle
         */
        this.intersects = function (other, offset) {
            if (offset == null)
                offset = new web2d.vec2(0, 0);

            if (this.contains(other.x + offset.x, other.y + offset.y) || this.contains(other.x + other.width + offset.x, other.y + offset.y) ||
                this.contains(other.x + offset.x, other.y + other.height + offset.y) || this.contains(other.x + other.width + offset.x, other.y + other.height + offset.y)) {
                return true;
            }
            else if (other.contains(this.pos.x, this.pos.y) || other.contains(this.pos.x + this.width, this.pos.y) ||
                other.contains(this.pos.x, this.pos.y + this.height) || other.contains(this.pos.x + this.width, this.pos.y + this.height)) {
                return true;
            }

            return false;
        };

        /**
         * Debug draw the rectangle on the Canvas with the supplied color
         * Note: This function is designed to work with the <a href="web2d.canvas.html#event_drawing">drawing</a> web2d.event object of the main Canvas object
         * @method
         * @param {web2d.canvas} Canvas The canvas to be drawn on
         */
        this.draw = function (canvas) {
            canvas.context.fillStyle = this.color.toStandard();
            canvas.context.fillRect(this.pos.x, this.pos.y, this.width, this.height);
        };
    },
    /**
     * Turns the number of seconds (like Unix time) to a Date object
     * @method
     * @param {number} seconds The number of seconds to turn into a date
     */
    secondsToDate: function (seconds) {
        return new Date(seconds * 1000);
    },
    /**
     * Used to dynamically load javascript files at runtime
     * @method
     * @param {string} baseOrAbsolute The folder that the CSS file is in
     * @param {string} file The CSS file name
     */
    require: function (baseOrAbsolute, file) {
        let filePath = "";
        if (baseOrAbsolute && file) {
            if (baseOrAbsolute[baseOrAbsolute.length - 1] !== "/") {
                baseOrAbsolute += "/";
            }

            filePath = baseOrAbsolute + file + ".js";
        } else if (baseOrAbsolute) {
            filePath = baseOrAbsolute;
        }

        let src = document.createElement('script');
        src.setAttribute("type", "text/javascript");
        src.setAttribute("src", filePath);
        document.head.appendChild(src);
        return src;
    },
    /**
     * A helper class that allows to easily animate regular (same sized) sprite sheets
     * @constructor
     * @param {Object} data The json object with the frame data
     */
    spriteSheet: function (data) {
        /**
         * The current sequence being played for this animation
         * @type {Object}
         * @private
         */
        this._sequence = null;

        /**
         * The current frame in the sequence being shown
         * @type {number}
         * @private
         */
        this._sequenceIndex = 0;

        /**
         * The data for this spritesheet
         * @type {Object}
         */
        this.data = data;

        /**
         * The frames per second for this animation
         * @type {number}
         */
        this.fps = data.anim.fps >= 33 ? 1 : 33 / data.anim.fps;

        /**
         * Used to count the elapsed time for frames
         * @type {number}
         * @private
         */
        this._fpsCounter = 0;

        /**
         * @type {Boolean}
         * @private
         */
        this._paused = false;

        /**
         * The current cropping position for the image
         * @type web2d.rectangle
         * @private
         */
        this._cropRect = new web2d.rectangle(0, 0, 0, 0);

        /**
         * The image to be used for the animation
         * @type Image
         * @private
         */
        this.image = new Image();
        this.image.src = data.img;

        /** @type {web2d.vec2} */
        this.extends = new web2d.vec2(1, 1);

        /** @type {web2d.vec2} */
        this.offset = new web2d.vec2();

        /**
         * Sets which sequence should currently be playing
         * @method
         * @param {Object} sequence The sequence to be played
         * @param {boolean} flipped If the sprite should be flipped
         */
        this.setSequence = function (sequence) {
            if (this._sequence === sequence) {
                return;
            }

            this._sequence = sequence;
            this._cropRect.width = this._sequence[this._sequenceIndex].w;
            this._cropRect.height = this._sequence[this._sequenceIndex].h;
            this._sequenceIndex = -1;

            this._updateCrop();
        };

        /**
         * @method
         * @param {number} x
         * @param {number} y
         */
        this.extend = function (x, y) {
            this.extends.set(x, y);
        };

        this.setOffset = function (x, y) {
            this.offset.set(x, y);
        };

        /**
         * Use to restart the animation from it's first frame
         * @method
         */
        this.restart = function () {
            this._sequenceIndex = -1;
            this._fpsCounter = 0;
            this._updateCrop();
        };

        /**
         * Used to play or unpause the animation
         * @method
         */
        this.play = function () {
            this._paused = false;
        };

        /**
         * Used to pause the animation on the current frame
         * @method
         */
        this.pause = function () {
            this._paused = true;
        };

        /**
         * Updates the cropping for the current frame in the current sequence
         * @method
         * @private
         */
        this._updateCrop = function () {
            if (++this._sequenceIndex >= this._sequence.length) {
                this._sequenceIndex = 0;
            }

            this._cropRect.x = this._sequence[this._sequenceIndex].x;
            this._cropRect.y = this._sequence[this._sequenceIndex].y;
        };

        /**
         * This will draw the individual sprite on the Canvas
         * Note: This function is designed to work with the <a href="web2d.canvas.html#event_drawing">drawing</a> web2d.event object of the main Canvas object
         * @method
         * @param {web2d.rectangle} drawRect The rectangle to draw the animation within
         * @param {web2d.canvas} canvas The Canvas element to be drawn on
         */
        this.draw = function (drawRect, canvas) {
            canvas.context.drawImage(this.image, this._cropRect.x, this._cropRect.y, this._cropRect.width, this._cropRect.height, drawRect.x + this.offset.x, drawRect.y + this.offset.y, drawRect.width * this.extends.x, drawRect.height * this.extends.y);

            if (!this._paused && this._fpsCounter++ >= this.fps) {
                this._fpsCounter = 0;
                this._updateCrop();
            }
        };
    },
    storage: {
        fs: null,
        Folder: class {
            constructor(parentFolder, name) {
                if (!parentFolder && !name) {
                    this.path = "/";
                    this.name = name;
                } else if (!parentFolder || !name) {
                    throw "A parent folder and name is required";
                } else {
                    this.path = parentFolder.path + name + "/";
                    this.name = name;
                }

                this.children = {};
                this.files = [];
            }
        },

        /**
         * @param {ArrayBuffer} buffer The array buffer to be turned into a string
         * @returns {string} The array buffer as a string
         */
        ab2str: function (buffer) {
            let str = "";
            let uint8 = new Uint8Array(buffer);

            for (let i = 0; i < uint8.length; i++) {
                str += String.fromCharCode(uint8[i]);
            }

            return str;
        },

        /**
         * @param {string} str The string that is to be turned into an array buffer
         * @returns {ArrayBuffer} The string as an array buffer
         */
        str2ab: function (str) {
            let buffer = new ArrayBuffer(str.length);
            let bufferView = new Uint8Array(buffer);
            for (let i = 0; i < str.length; i++) {
                bufferView[i] = str.charCodeAt(i);
            }

            return buffer;
        },

        /**
         * @returns {web2d.storage.Folder} The base file system
         */
        getFileSystem: async function () {
            if (this.fs === null) {
                this.fs = await this.get("/", true);

                if (!this.fs) {
                    this.fs = new this.Folder();
                    await this.updateFileSystem();
                }
            }

            return this.fs;
        },

        updateFileSystem: async function () {
            await this.set("/", this.fs);
        },

        _fixPath: function (path) {
            if (path[0] === '/') {
                path = path.substring(1);
            }

            if (path.endsWith('/')) {
                path = path.substring(0, path.length - 1);
            }

            return path;
        },

        /**
         * @param {string} path The path the the folder to get
         * @returns {web2d.storage.Folder|boolean} The folder that was found otherwise false
         */
        getFolder: async function (path) {
            path = this._fixPath(path);

            let fs = await this.getFileSystem();
            if (path.length === 0) {
                return fs;
            }

            let pathParts = path.split('/');
            let folder = fs;

            for (let i = 0; i < pathParts.length; i++) {
                if (!folder.children[pathParts[i]]) {
                    return null;
                }

                folder = folder.children[pathParts[i]];
            }

            return folder;
        },

        /**
         * @param {string} path The path the the folder to create
         * @returns {web2d.storage.Folder|boolean} The folder that was created otherwise false
         */
        createFolder: async function (path) {
            path = this._fixPath(path);

            let fs = await this.getFileSystem();
            if (path.length === 0) {
                return false;
            }

            let pathParts = path.split('/');
            let folder = fs;
            let last = 0, i;

            for (i = 0; i < pathParts.length; i++ , last = i) {
                if (!folder.children[pathParts[i]]) {
                    break;
                }

                folder = folder.children[pathParts[i]];
            }

            for (i = last; i < pathParts.length; i++) {
                let newFolder = new this.Folder(folder, pathParts[i]);
                folder.children[pathParts[i]] = newFolder;
                folder = newFolder;
            }

            await this.updateFileSystem();
            return folder;
        },

        getParentPath: function (path) {
            if (path === "/") {
                return path;
            }

            return this.getPath(this.getPath(path));
        },

        getPath: function (path) {
            return path.substring(0, path.lastIndexOf('/'), path.length - 2);
        },

        getName: function (path) {
            return path.substring(path.lastIndexOf('/', path.length - 2) + 1);
        },

        deleteFolder: async function (source) {
            let folder = null;
            if (typeof source === "string") {
                folder = await this.getFolder(source);
            } else {
                folder = source;
            }

            let parent = await this.getFolder(this.getParentPath(folder.path));

            for (let i = 0; i < folder.files.length; i++) {
                await this.deleteFile(folder, folder.files[i]);
            }

            web2d.each(folder.children, async (key, val) => {
                await this.deleteFolder(val);
            });

            delete parent.children[folder.name];
            await this.updateFileSystem();
        },

        /**
         * @param {web2d.storage.Folder} folder The folder that the file is found within
         * @param {string} fileName The name of the file to read
         * @returns {null|ArrayBuffer|object|string} The file data that was read
         */
        readFile: async function (folder, fileName) {
            let storageData = await this.get(folder.path + fileName);
            let type = storageData[0];
            storageData = storageData.substring(1);

            let data = null;
            if (type === "a") {
                data = this.str2ab(storageData);
            } else if (type === "t") {
                data = storageData;
            } else if (type === "j") {
                data = JSON.parse(storageData);
            }

            return data;
        },

        /**
         * @param {web2d.storage.Folder} folder The folder that the file is found within
         * @param {string} fileName The name of the file that is to be written to
         * @param {ArrayBuffer|string|string} data The data that is to be written to the file
         */
        writeFile: async function (folder, fileName, data) {
            let storageData = "";
            if (data instanceof ArrayBuffer) {
                storageData = "a" + this.ab2str(data);
            } else if (typeof data === "string") {
                storageData = "t" + data;
            } else {
                storageData = "j" + JSON.stringify(data);
            }

            await this.set(folder.path + fileName, storageData);

            if (!folder.files.contains(fileName)) {
                folder.files.push(fileName);
                await this.updateFileSystem();
            }
        },

        /**
         * @param {web2d.storage.Folder} folder The folder that the file is found within
         * @param {string} fileName The name of the file that is to be deleted
         */
        deleteFile: async function (folder, fileName) {
            if (folder.files.contains(fileName)) {
                await this.delete(folder.path + fileName);
                folder.files.remove(fileName);
                await this.updateFileSystem();
            }
        },

        moveFile: async function (folder, newFolder, fileName, newFileName) {
            if (newFolder.files.contains(newFileName)) {
                return false;
            } else if (folder.files.contains(fileName)) {
                let contents = await this.readFile(folder, fileName);
                await this.writeFile(newFolder, newFileName, contents);
                await this.deleteFile(folder, fileName);
                return true;
            }

            throw "Specified file could not be found";
        },

        fileExists: function (folder, fileName) {
            if (!folder.files || !folder.files.length) {
                return false;
            }

            return folder.files.contains(fileName);
        },

        export: async function (folder, expression) {
            if (!folder) {
                throw "Invalid folder supplied";
            }

            let readChildren = async (parent) => {
                let pathName = web2d.storage.getPath(parent.path);

                await web2d.eachAsync(parent.files, async (idx, fileName) => {
                    let data = await web2d.storage.readFile(parent, fileName);

                    if (typeof data === "string") {
                        await expression(pathName, fileName, data);
                    } else {
                        await expression(pathName, fileName, JSON.stringify(data));
                    }
                });

                await web2d.eachAsync(parent.children, async (idx, folder) => {
                    await readChildren(folder);
                });
            };

            await readChildren(folder);
            return false;
        },

        import: async function (path, file) {
            let folder = await this.getFileSystem();
            if (path && path.length > 0) {
                folder = await this.getFolder(path);
            }

            if (file.type !== "application/zip" && file.type !== "application/x-zip-compressed" && file.type !== "application/octet-stream") {
                throw "The specified file is not a zip file", "Failure";
            }

            let zip = await JSZip.loadAsync(file);
            let doneCounter = 0;
            let fileCount = web2d.count(zip.files);

            await web2d.eachAsync(zip.files, async (idx, zipFile) => {
                let targetFolder = await this.getFolder(this.getPath(zipFile.name));
                let fileName = this.getName(zipFile.name);
                
                if (!targetFolder) {
                    targetFolder = await this.createFolder(this.getPath(zipFile.name));
                }

                let str = await zipFile.async("string");

                try {
                    await this.writeFile(targetFolder, fileName, JSON.parse(str));
                } catch (e) {
                    await this.writeFile(targetFolder, fileName, str);
                }
            });

            return zip;
        },

        /**
         * Clears out the local storage
         */
        clear: function () {
            return localforage.clear();
            //localStorage.clear();
        },

        /**
         * Assigns a key/value in the local storage
         * @param {string} key The key that is to be used for this entry
         * @param {object|string} data The data for this entry
         */

        set: function (key, data) {
            if (typeof data !== "string") {
                data = JSON.stringify(data);
            }

            return localforage.setItem(key, data);
            //localStorage.setItem(key, data);
        },

        /**
         * Get's the value at the supplied key in local storage
         * @param {string} key The key that is to be used for this entry
         * @param {boolean} asJson Returns the result as json
         * @returns {string|JSON} The data that was found at the localStorage key
         */
        get: async function (key, asJson) {
            let data = await localforage.getItem(key);
            if (data && asJson) {
                return JSON.parse(data);
            }

            return data;
        },

        /**
         * Remove the data at the supplied key from local storage
         * @param {string} key The key to delete from in localStorage
         */
        delete: function (key) {
            return localforage.removeItem(key);
            //localStorage.removeItem(key);
        }
    },
    tweener: {
        /**
         * @type {Date}
         * @private
         */
        _lastTime: new Date(),

        /** @type {number} */
        deltaTime: 0,

        /** @type {number} */
        requestAnimationFrameId: 0,

        tweens: [],

        update: function () {
            let now = new Date();
            this.deltaTime = (now - this._lastTime) / 1000;
            this._lastTime = now;

            for (let i = 0; i < this.tweens.length; i++) {
                let tween = this.tweens[i];
                tween.options.each((key, val) => {
                    tween.obj[key] = (val - tween.obj[key]) / tween.time;
                });

                tween.time -= this.deltaTime;
                if (tween.time <= 0) {
                    tween.options.each((key, val) => {
                        tween.obj[key] = val;
                    });

                    tween.resolve(tween.obj);
                    this.tweens.removeAt(i--);
                }
            }
        },

        tween: function (obj, time, options) {
            return new Promise((resolve, reject) => {
                this.tweens.push({
                    obj: obj,
                    time: time,
                    options: options,
                    resolve: resolve,
                    reject: reject
                });
            });
        }
    },
    /**
     * A basic 2 dimensional vector
     * @constructor
     * @param {Number} [x=0] The x dimension of the vector
     * @param {Number} [y=0] The y dimension of the vector
     */
    vec2: function (x, y) {
        /**
        * The x dimension of this vector
        * @type {number}
        */
        this.x = x || 0;

        /**
         * The y dimension of this vector
         * @type {number}
         */
        this.y = y || 0;

        /**
         * Copys the x and y dimension of a web2d.vec2 to this one
         * @method
         * @param {number} x The value to assign to the x component
         * @param {number} y The value to assign to the y component
         */
        this.set = function (x, y) {
            if (x !== null) {
                this.x = x;
            }

            if (y !== null) {
                this.y = y;
            }
        };

        /**
         * @method
         * @param {web2d.vec2} vec 
         */
        this.assign = function (vec) {
            this.x = vec.x;
            this.y = vec.y;
        };

        /**
         * Transposes this vector by another vector by shifting (adding)
         * @method
         * @param {web2d.vec2} vector The vector to be added to this vector
         */
        this.move = function (vector) {
            this.x += vector.x;
            this.y += vector.y;
        };

        /**
         * Transposes this vector by a given x and y by shifting (adding)
         * @method
         * @param {number} x The value to add to the x component
         * @param {number} y The value to add to the y component
         */
        this.shift = function (x, y) {
            this.x += x;
            this.y += y;
        };

        /**
         * Multiplies each component of this vector by the given value
         * @method
         * @param {number} value The value to multiply each component by
         */
        this.times = function (value) {
            this.x *= value;
            this.y *= value;
        };

        /**
         * Get's the magnitude (pythagorean theorem) of this vector (the length of the hypotenuse of the right triangle produced by this vector)
         * @return {number} The length of the hypotenuse
         */
        this.__defineGetter__("magnitude", () => {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        });

        /**
         * @returns {boolean} True if both the x and y coordinates are equal to zero
         */
        this.__defineGetter__("isZero", () => {
            return this.is(0, 0);
        });

        /**
         * Get's the dot product of this vector and another
         * @method
         * @param {web2d.vec2} vector The vector to be multiplied with this vector
         * @return {number} The result of dot product (vector multiplication)
         */
        this.dot = function (vector) {
            return this.x * vector.x + this.y * vector.y;
        };

        /**
         * This will return a new normalized web2d.vec2 of this vector
         * @return {web2d.vec2} The normalized web2d.vec2
         */
        this.__defineGetter__("normalized", () => {
            let tmp = new web2d.vec2(this.x, this.y);

            let mag = this.magnitude;
            tmp.x = tmp.x / mag;
            tmp.y = tmp.y / mag;

            return tmp;
        });

        /**
         * Will get the distance between this vector and another supplied vector
         * @method
         * @param {web2d.vec2} vector The vector to check the distance from
         * @return {number} The distance between this web2d.vec2 and the supplied web2d.vec2
         */
        this.distance = function (vector) {
            return Math.sqrt((vector.x - this.x) * (vector.x - this.x) + (this.y - vector.y) * (this.y - vector.y));
        };

        /**
         * Will subtract this vector from another vector
         * @method
         * @param {web2d.vec2} vector The vector to use as the difference of this
         * @return {web2d.vec2} The result of this vector subtracted by a supplied vector (in that order)
         */
        this.difference = function (vector) {
            let vec = new web2d.vec2();
            vec.set(this.x - vector.x, this.y - vector.y);
            return vec;
            //return new web2d.vec2(this.x - vector.x, this.y - vector.y);
        };

        /**
         * Will add this vector from another vector
         * @method
         * @param {web2d.vec2} vector The vector to add with this vector
         * @return {web2d.vec2} The result of this vector added by a supplied vector
         */
        this.sum = function (vector) {
            return new web2d.vec2(this.x + vector.x, this.y + vector.y);
        };

        /**
         * Will check if this vector's components are equal to the supplied vectors
         * @method
         * @param {web2d.vec2} vector The vector to compare against
         * @return {boolean} <c>true</c> if the x and y of both vectors are the same value otherwise <c>false</c>
         */
        this.equals = function (vector) {
            if (!(vector instanceof web2d.vec2)) {
                return false;
            }

            return this.x === vector.x && this.y === vector.y;
        };

        /**
         * Will check if this vector's components are equal to the supplied x and y
         * @method
         * @param {number} x The x to compare against
         * @param {number} y The y to compare against
         * @return {boolean} <c>true</c> if the x and y of the vector is the supplied x and y otherwise <c>false</c>
         */
        this.is = function (x, y) {
            return this.x === x && this.y === y;
        };

        /**
         * Will check if this vector's components are equal to the supplied vectors
         * @method
         * @param {web2d.vec2} vector The vector to compare against
         * @param {number} length The magnitude to check against
         * @return {boolean} True if the x and y of both vectors are within the length otherwise false
         */
        this.closeTo = function (vector, length) {
            if (!length) {
                length = 0.01;
            }

            return this.distance(vector) <= length;
        };

        /**
         * Will check if this vector's components are equal to the supplied x and y
         * @method
         * @param {number} x The x to compare against
         * @param {number} y The y to compare against
         * @param {number} length The magnitude to check against
         * @return {boolean} True if the x and y are within the length otherwise false
         */
        this.near = function (x, y, length) {
            if (!length) {
                length = 0.01;
            }

            return this.distance(new web2d.vec2(x, y)) <= length;
        };
    },
    /**
     * Used to check if an object exists or not
     * @method
     * @param {Object} obj The object to check for validity
     */
    undefined: function (obj) {
        return obj === null || obj === undefined
    },
    getOrientation: function (file) {
        return new Promise((resolve, reject) => {
            var reader = new FileReader();
            reader.onload = function (e) {
                var view = new DataView(e.target.result);
                if (view.getUint16(0, false) != 0xFFD8) {
                    return resolve(-2);
                }
                var length = view.byteLength, offset = 2;
                while (offset < length) {
                    if (view.getUint16(offset + 2, false) <= 8) return resolve(-1);
                    var marker = view.getUint16(offset, false);
                    offset += 2;
                    if (marker == 0xFFE1) {
                        if (view.getUint32(offset += 2, false) != 0x45786966) {
                            return resolve(-1);
                        }

                        var little = view.getUint16(offset += 6, false) == 0x4949;
                        offset += view.getUint32(offset + 4, little);
                        var tags = view.getUint16(offset, little);
                        offset += 2;
                        for (var i = 0; i < tags; i++) {
                            if (view.getUint16(offset + (i * 12), little) == 0x0112) {
                                return resolve(view.getUint16(offset + (i * 12) + 8, little));
                            }
                        }
                    }
                    else if ((marker & 0xFF00) != 0xFF00) {
                        break;
                    }
                    else {
                        offset += view.getUint16(offset, false);
                    }
                }

                return resolve(-1);
            };

            reader.readAsArrayBuffer(file);
        });
    },
    toDataURL: function (img, maxWidth, maxHeight, orientation, blobCallback) {
        ratio = img.naturalHeight / img.naturalWidth;
        var height = img.naturalHeight;
        var width = img.naturalWidth;

        if (maxWidth || maxHeight) {
            if (img.naturalHeight > img.naturalWidth && img.naturalHeight > maxHeight) {
                height = maxHeight;
                width = height / ratio;
            } else if (img.naturalWidth > maxWidth) {
                width = maxWidth;
                height = width * ratio;
            }
        }

        var c = document.createElement('canvas');
        c.height = height;
        c.width = width;
        var ctx = c.getContext('2d');

        if (orientation) {
            switch (orientation) {
                case 2: ctx.transform(-1, 0, 0, 1, c.width, 0); break;
                case 3: ctx.transform(-1, 0, 0, -1, c.width, c.height); break;
                case 4: ctx.transform(1, 0, 0, -1, 0, c.height); break;
                case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
                case 6: ctx.transform(0, 1, -1, 0, c.height, 0); break;
                case 7: ctx.transform(0, -1, -1, 0, c.height, c.width); break;
                case 8: ctx.transform(0, -1, 1, 0, 0, c.width); break;
                default: break;
            }
        }

        ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, c.width, c.height);

        if (blobCallback) {
            c.toBlob(blobCallback, "image/jpeg", 0.95);
        }

        var base64String = c.toDataURL("image/jpeg");
        return base64String;
    },
    /**
    * An extension to the main window object
    * @namespace
    */
    window: {
        /**
         * Finds the left offset in pixels of an element on the page
         * @method
         * @param {Object} elm The object to find its offset relative to the page
         * @return {number} The left offset of an object on the page
         */
        getLeft: function (elm) {
            let left = elm.offsetLeft;
            while (elm = elm.offsetParent)
                left += elm.offsetLeft;

            left -= window.pageXOffset;

            return left;
        },
        /**
         * Finds the top offset in pixels of an element on the page
         * @method
         * @param {Object} elm The object to find its offset relative to the page
         * @return {number} The top offset of an object on the page
         */
        getTop: function (elm) {
            let top = elm.offsetTop;
            while (elm = elm.offsetParent)
                top += elm.offsetTop;

            top -= window.pageYOffset;

            return top;
        }
    }
};

(function () {
    let tmp = 65;

    for (let i = 0; i < web2d.input._keyString.length; i++) {
        web2d.input.keys[web2d.input._keyString.charAt(i)] = tmp++;
        web2d.input[web2d.input._keyString.charAt(i)] = false;
    }

    tmp = 48;
    for (let i = 0; i < web2d.input._keyNumberStrings.length; i++) {
        web2d.input.keys["Num" + web2d.input._keyNumberStrings.charAt(i)] = tmp++;
        web2d.input["Num" + web2d.input._keyNumberStrings.charAt(i)] = false;
    }

    tmp = 96;
    for (let i = 0; i < web2d.input._keyNumberStrings.length; i++) {
        web2d.input.keys["Numpad" + web2d.input._keyNumberStrings.charAt(i)] = tmp++;
        web2d.input["Numpad" + web2d.input._keyNumberStrings.charAt(i)] = false;
    }
})();

// Initialize input values
(function () {
    web2d.input.mousePosition = new web2d.vec2(0);
    web2d.input.offset = new web2d.vec2(0);
    web2d.input.clamp = new web2d.vec2(0);
    web2d.input.keyDown = new web2d.event();
    web2d.input.keyUp = new web2d.event();
    web2d.input.mouseDown = new web2d.event();
    web2d.input.mouseUp = new web2d.event();
    web2d.input.mouseMove = new web2d.event();
    web2d.input.wheelScroll = new web2d.event();

    document.onmousemove = web2d.input._inputMousePosition.bind(web2d.input);
    document.onmousedown = web2d.input._inputMouseDown.bind(web2d.input);
    document.onmouseup = web2d.input._inputMouseUp.bind(web2d.input);
    document.onkeydown = web2d.input._inputKeyDown.bind(web2d.input);
    document.onkeyup = web2d.input._inputKeyUp.bind(web2d.input);
    document.onwheel = web2d.input._wheelScroll.bind(web2d.input);

    // TODO:  Support game controllers
    window.addEventListener("gamepadconnected", function (e) {
        console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
            e.gamepad.index, e.gamepad.id, e.gamepad.buttons.length, e.gamepad.axes.length);
    });

    window.addEventListener("gamepaddisconnected", function (e) {
        console.log("Gamepad disconnected from index %d: %s", e.gamepad.index, e.gamepad.id);
    });
})();

// Default animation callbacks
//----------------------------------
// The following is automatic to register the HTML5 animation callback from the browser
//----------------------------------
(function () {
    let requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

    window.requestAnimationFrame = requestAnimationFrame;
})();

(function () {
    function tweenerUpdate() {
        web2d.tweener.update();
        web2d.tweener.requestAnimationFrameId = window.requestAnimationFrame(tweenerUpdate);
    }

    //canvas.animationRequestId = window.requestAnimationFrame(tweenerUpdate);
})();
