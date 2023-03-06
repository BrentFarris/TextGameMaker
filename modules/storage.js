import { each, eachAsync, ArrayHelpers, Optional } from "./std.js";

/**
 * @param {ArrayBuffer} buffer The array buffer to be turned into a string
 * @returns {string} The array buffer as a string
 */
export function ab2str(buffer) {
	let str = "";
	let uint8 = new Uint8Array(buffer);
	for (let i = 0; i < uint8.length; i++)
		str += String.fromCharCode(uint8[i]);
	return str;
}

/**
 * @param {string} str The string that is to be turned into an array buffer
 * @returns {ArrayBuffer} The string as an array buffer
 */
export function str2ab(str) {
	let buffer = new ArrayBuffer(str.length);
	let bufferView = new Uint8Array(buffer);
	for (let i = 0; i < str.length; i++)
		bufferView[i] = str.charCodeAt(i);
	return buffer;
}

export class Folder {
	/** @type {string} */
	path = "";

	/** @type {string} */
	name = "";

	/** @type {Object<string, Folder>} */
	children = {};

	/** @type {Array<string>} */
	files = [];

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
	}

	/**
	 * @param {Object} json 
	 * @returns {Folder}
	 */
	static fromJSON(json) {
		let folder = new Folder();
		folder.path = json.path;
		folder.name = json.name;
		folder.children = json.children;
		folder.files = json.files;
		return folder;
	}
}

export class Storage {
	/** @type {Optional<Folder>} */
	fs = new Optional();

	/**
	 * @returns {Promise<Folder>} The base file system
	 * @async
	 */
	async getFileSystem() {
		if (!this.fs.HasValue) {
			let json = await this.get("/", true);
			if (json !== null) {
				if (typeof json === "string")
					throw "Invalid JSON specified for file system";
				this.fs = new Optional(Folder.fromJSON(json));
			}
			if (!this.fs.HasValue) {
				this.fs.Value = new Folder();
				await this.updateFileSystem();
			}
		}
		return this.fs.Value;
	}

	/**
	 * @async
	 */
	async updateFileSystem() {
		await this.set("/", this.fs.Value);
	}

	/**
	 * @param {string} path 
	 * @returns {string}
	 */
	#fixPath(path) {
		if (path[0] === '/')
			path = path.substring(1);
		if (path.endsWith('/'))
			path = path.substring(0, path.length - 1);
		return path;
	}

	/**
	 * @param {string} path The path the the folder to get
	 * @returns {Promise<Optional<Folder>>} The folder that was found otherwise false
	 * @async
	 */
	async getFolder(path) {
		path = this.#fixPath(path);
		let fs = await this.getFileSystem();
		if (path.length === 0)
			return new Optional(fs);
		let pathParts = path.split('/');
		let folder = fs;
		for (let i = 0; i < pathParts.length; i++) {
			if (!folder.children[pathParts[i]])
				return new Optional();
			folder = folder.children[pathParts[i]];
		}
		return new Optional(folder);
	}

	/**
	 * @param {string} path The path the the folder to create
	 * @returns {Promise<Optional<Folder>>} The folder that was created otherwise false
	 * @async
	 */
	async createFolder(path) {
		path = this.#fixPath(path);
		let fs = await this.getFileSystem();
		if (path.length === 0)
			return new Optional();
		let pathParts = path.split('/');
		let folder = fs;
		let last = 0, i;
		for (i = 0; i < pathParts.length; ++i, last = i) {
			if (!folder.children[pathParts[i]])
				break;
			folder = folder.children[pathParts[i]];
		}
		for (i = last; i < pathParts.length; i++) {
			let newFolder = new Folder(folder, pathParts[i]);
			folder.children[pathParts[i]] = newFolder;
			folder = newFolder;
		}
		await this.updateFileSystem();
		return new Optional(folder);
	}

	/**
	 * @param {string} path 
	 * @returns {string}
	 */
	getPath(path) {
		return path.substring(0, path.lastIndexOf('/'));
	}

	/**
	 * @param {string} path 
	 * @returns {string}
	 */
	getParentPath(path) {
		if (path === "/")
			return path;
		return this.getPath(this.getPath(path));
	}

	/**
	 * @param {string} path 
	 * @returns {string}
	 */
	getName(path) {
		return path.substring(path.lastIndexOf('/', path.length - 2) + 1);
	}

	/**
	 * @param {Folder|string} source 
	 * @async
	 */
	async deleteFolder(source) {
		/** @type {Optional<Folder>} */
		let folder = new Optional();
		if (typeof source === "string")
			folder = await this.getFolder(source);
		else
			folder.Value = source;
		if (!folder.HasValue)
			throw "Folder does not exist";
		let f = folder.Value;
		let parent = await this.getFolder(this.getParentPath(f.path));
		for (let i = 0; i < f.files.length; i++)
			await this.deleteFile(f, f.files[i]);
		each(f.children, async (key, val) => {
			await this.deleteFolder(val);
		});
		if (parent.HasValue)
			delete parent.Value.children[f.name];
		await this.updateFileSystem();
	}

	/**
	 * @param {Folder} folder The folder that the file is found within
	 * @param {string} fileName The name of the file to read
	 * @returns {Promise<null|ArrayBuffer|object|string>} The file data that was read
	 * @async
	 */
	async readFile(folder, fileName) {
		let storageData = await this.get(folder.path + fileName);
		if (typeof storageData !== "string")
			throw "Invalid file data";
		let type = storageData[0];
		storageData = storageData.substring(1);
		let data = null;
		if (type === "a")
			data = str2ab(storageData);
		else if (type === "t")
			data = storageData;
		else if (type === "j")
			data = JSON.parse(storageData);
		return data;
	}

	/**
	 * @param {Folder} folder The folder that the file is found within
	 * @param {string} fileName The name of the file that is to be written to
	 * @param {ArrayBuffer|string|Object} data The data that is to be written to the file
	 * @async
	 */
	async writeFile(folder, fileName, data) {
		let storageData = "";
		if (data instanceof ArrayBuffer)
			storageData = "a" + ab2str(data);
		else if (typeof data === "string")
			storageData = "t" + data;
		else
			storageData = "j" + JSON.stringify(data);
		await this.set(folder.path + fileName, storageData);
		if (folder.files.indexOf(fileName) < 0) {
			folder.files.push(fileName);
			await this.updateFileSystem();
		}
	}

	/**
	 * @param {Folder} folder The folder that the file is found within
	 * @param {string} fileName The name of the file that is to be deleted
	 * @async
	 */
	async deleteFile(folder, fileName) {
		if (folder.files.indexOf(fileName) >= 0) {
			await this.delete(folder.path + fileName);
			ArrayHelpers.remove(folder.files, fileName);
			await this.updateFileSystem();
		}
	}

	/**
	 * @param {Folder} folder 
	 * @param {Folder} newFolder 
	 * @param {string} fileName 
	 * @param {string} newFileName 
	 * @returns {Promise<boolean>} True if the file was moved otherwise false
	 * @async
	 */
	async moveFile(folder, newFolder, fileName, newFileName) {
		if (ArrayHelpers.contains(newFolder.files, newFileName)) {
			return false;
		} else if (ArrayHelpers.contains(folder.files, fileName)) {
			let contents = await this.readFile(folder, fileName);
			await this.writeFile(newFolder, newFileName, contents);
			await this.deleteFile(folder, fileName);
			return true;
		}
		throw "Specified file could not be found";
	}

	/**
	 * @param {Folder} folder 
	 * @param {string} fileName 
	 * @returns {boolean}
	 */
	fileExists(folder, fileName) {
		if (!folder.files || !folder.files.length)
			return false;
		return ArrayHelpers.contains(folder.files, fileName);
	}

	/**
	 * @param {Folder} folder 
	 * @param {Function} expression 
	 * @returns {Promise<boolean>}
	 * @async
	 */
	async export(folder, expression) {
		if (!folder)
			throw "Invalid folder supplied";
		let readChildren = async (parent) => {
			let pathName = this.getPath(parent.path);
			await eachAsync(parent.files, async (idx, fileName) => {
				let data = await this.readFile(parent, fileName);
				if (typeof data === "string")
					await expression(pathName, fileName, data);
				else
					await expression(pathName, fileName, JSON.stringify(data));
			});
			await eachAsync(parent.children, async (idx, folder) => {
				await readChildren(folder);
			});
		};
		await readChildren(folder);
		return false;
	}

	/**
	 * @param {string} path
	 * @param {File} file
	 * @async
	 */
	async import(path, file) {
		let folder = new Optional(await this.getFileSystem());
		if (path && path.length > 0)
			folder = await this.getFolder(path);
		if (file.type !== "application/zip"
			&& file.type !== "application/x-zip-compressed"
			&& file.type !== "application/octet-stream")
		{
			throw "The specified file is not a zip file";
		}
		let zip = await JSZip.loadAsync(file);
		await eachAsync(zip.files, async (idx, zipFile) => {
			let targetFolder = await this.getFolder(this.getPath(zipFile.name));
			let fileName = this.getName(zipFile.name);
			if (!targetFolder.HasValue)
				targetFolder = await this.createFolder(this.getPath(zipFile.name));
			let str = await zipFile.async("string");
			try {
				await this.writeFile(targetFolder.Value, fileName, JSON.parse(str));
			} catch (e) {
				await this.writeFile(targetFolder.Value, fileName, str);
			}
		});
		return zip;
	}

	/**
	 * Clears out the local storage
	 */
	clear() {
		return localforage.clear();
		//localStorage.clear();
	}

	/**
	 * Assigns a key/value in the local storage
	 * @param {string} key The key that is to be used for this entry
	 * @param {object|string} data The data for this entry
	 */
	set(key, data) {
		if (typeof data !== "string")
			data = JSON.stringify(data);
		return localforage.setItem(key, data);
		//localStorage.setItem(key, data);
	}

	/**
	 * Get's the value at the supplied key in local storage
	 * @param {string} key The key that is to be used for this entry
	 * @param {boolean} [asJson] Returns the result as json
	 * @returns {Promise<string|JSON>} The data that was found at the localStorage key
	 * @async
	 */
	async get(key, asJson) {
		let data = await localforage.getItem(key);
		if (data && asJson)
			return JSON.parse(data);
		return data;
	}
	/**
	 * Remove the data at the supplied key from local storage
	 * @param {string} key The key to delete from in localStorage
	 */
	delete(key) {
		return localforage.removeItem(key);
		//localStorage.removeItem(key);
	}
}
