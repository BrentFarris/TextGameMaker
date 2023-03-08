import { GameAudio } from "./engine/game_audio.js";
import { eachAsync } from "./engine/std.js";

/**
 * @typedef {Object} AudioResource
 * @property {HTMLAudioElement} elm
 * @property {string} url
 */

/**
 * @typedef {Object} ImageResource
 * @property {HTMLImageElement} elm
 * @property {string} url
 */

export class AudioDatabase {
	/** @type Object<string,AudioResource> */
	#resources = {};

	/**
	 * @param {File|string} file 
	 * @param {string} src 
	 * @return {Promise<string>}
	 */
	async add(file, src) {
		let path = "";
		if (typeof file === "string")
			path = file;
		else if (file.webkitRelativePath)
			path = file.webkitRelativePath.substring(file.webkitRelativePath.indexOf('/') + 1);
		else
			path = file.name;
		return new Promise((res, rej) => {
			let audio = new Audio();
			audio.src = src;
			audio.load();
			this.#resources[path] = { elm: audio, url: src };
			res(path);
		});
	}

	/**
	 * @param {string} path 
	 * @returns {HTMLAudioElement}
	 */
	elm(path) {
		return this.#resources[path].elm;
	}

	/**
	 * @param {string} path 
	 * @returns {string}
	 */
	url(path) {
		return this.#resources[path].url;
	}

	/**
	 * @param {string} path 
	 * @returns {Promise<Blob>}
	 */
	async blob(path) {
		let res = await fetch(this.url(path));
		let blob = await res.blob();
		return blob;
	}

	/**
	 * @param {JSZip} zipFolder 
	 */
	async serialize(zipFolder) {
		eachAsync(this.#resources, async (key, val) => {
			let name = /** @type {string} */ (key);
			let audio = /** @type {AudioResource} */ (val);
			let res = await fetch(audio.url);
			let blob = await res.blob();
			zipFolder.file(name, blob, { binary: true });
		});
	}
}

export class ImageDatabase {
	/** @type Object<string,ImageResource> */
	#resources = {};

	/**
	 * @param {File|string} file 
	 * @param {string} src 
	 * @return {Promise<string>}
	 */
	async add(file, src) {
		let path = "";
		if (typeof file === "string")
			path = file;
		else if (file.webkitRelativePath)
			path = file.webkitRelativePath.substring(file.webkitRelativePath.indexOf('/') + 1);
		else
			path = file.name;
		return new Promise((res, rej) => {
			let img = new Image();
			img.onload = () => {
				this.#resources[path] = { elm: img, url: src };
				res(path);
			};
			img.src = src;
		});
	}

	/**
	 * @param {string} path 
	 * @returns {HTMLImageElement}
	 */
	elm(path) {
		return this.#resources[path].elm;
	}

	/**
	 * @param {string} path 
	 * @returns {string}
	 */
	url(path) {
		return this.#resources[path].url;
	}

	/**
	 * @param {string} path 
	 * @returns {Promise<Blob>}
	 */
	async blob(path) {
		let res = await fetch(this.url(path));
		let blob = await res.blob();
		return blob;
	}

	/**
	 * @param {JSZip} zipFolder 
	 */
	 async serialize(zipFolder) {
		eachAsync(this.#resources, async (key, val) => {
			let name = /** @type {string} */ (key);
			let img = /** @type {ImageResource} */ (val);
			let res = await fetch(img.url);
			let blob = await res.blob();
			zipFolder.file(name, blob, { binary: true });
		});
	}
}

export class Media {
	/** @type {GameAudio|null} */
	bgm = null;

	/** @type {KnockoutObservable<string>} */
	backgroundImage = ko.observable("");

	/** @type {KnockoutObservable<string>} */
	backgroundImageBuffer = ko.observable("");

	/** @type {KnockoutObservable<number>} */
	backgroundImageBufferOpacity = ko.observable(0.0);

	/** @type {KnockoutObservable<number>} */
	backgroundImageOpacity = ko.observable(1.0);

	/** @type {AudioDatabase} */
	audioDatabase = new AudioDatabase();

	/** @type {ImageDatabase} */
	imageDatabase = new ImageDatabase();

	constructor() {
		this.backgroundImage.subscribe(() => {
			this.backgroundImageBufferOpacity(1.0);
			this.backgroundImageOpacity(1.0);
			let changeBgmInterval = setInterval(() => {
				this.backgroundImageBufferOpacity(this.backgroundImageBufferOpacity() - 0.01);
	
				if (this.backgroundImageBufferOpacity() <= 0.0) {
					this.backgroundImageBufferOpacity(0.0);
					this.backgroundImageOpacity(1.0);
					clearInterval(changeBgmInterval);
				}
			}, 10);
		});
	}
}