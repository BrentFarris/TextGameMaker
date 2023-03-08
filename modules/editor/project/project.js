import { Application } from "../../application.js";
import { Optional, StringHelpers } from "../../engine/std.js";

/**
 * @typedef {object} ProjectFileObj
 * @property {string} name
 * @property {object} content
 */

/**
 * @typedef {object} ProjectFolderObj
 * @property {string} name
 * @property {ProjectFileObj[]} files
 * @property {ProjectFolderObj[]} folders
 */

export class ProjectFile {
	/** @type {object} */
	fileData = {};

	/** @type {KnockoutObservable<string>} */
	nameView = ko.observable("");

	/** @type {ProjectFolder} */
	parent;

	/**
	 * @param {string} name 
	 * @param {ProjectFolder} parent
	 */
	constructor(name, parent) {
		this.nameView(name);
		this.parent = parent;
	}

	/** @return {string} */
	get Name() { return this.nameView(); }

	/** @param {string} name */
	set Name(name) { this.nameView(name); }

	/** @param {object} fileData */
	setContent(fileData) {
		this.fileData = fileData;
	}

	/**
	 * @param {ProjectFolder} folder 
	 */
	moveTo(folder) {
		if (folder != this.parent) {
			folder.fileView.push(this);
			this.parent.fileView.remove(this);
			this.parent = folder;
		}
	}
}

export class ProjectFolder {
	/** @type {KnockoutObservable<string>} */
	nameView = ko.observable("");

	/** @type {KnockoutObservableArray<ProjectFile>} */
	fileView = ko.observableArray();

	/** @type {KnockoutObservableArray<ProjectFolder>} */
	folderView = ko.observableArray();

	/** @type {KnockoutObservable<boolean>} */
	collapsed = ko.observable(false);

	/** @type {ProjectFolder} */
	parent;

	/**
	 * @param {string} name 
	 * @param {ProjectFolder} parent
	 */
	constructor(name, parent) {
		this.nameView(name);
		this.parent = parent;
	}

	/** @return {string} */
	get Name() { return this.nameView(); }

	/** @param {string} name */
	set Name(name) { this.nameView(name); }

	/** @return {ProjectFile[]} */
	get Files() { return this.fileView(); }

	/** @return {ProjectFolder[]} */
	get Folders() { return this.folderView(); }

	/**
	 * @param {string} name
	 * @return {ProjectFile}
	 */
	createFile(name) {
		let file = new ProjectFile(name, this);
		this.fileView.push(file);
		return file;
	}

	/**
	 * @param {string} name 
	 * @returns {ProjectFolder}
	 */
	 createFolder(name) {
		let folder = new ProjectFolder(name, this);
		this.folderView.push(folder);
		return folder;
	}

	/**
	 * @param {string} name 
	 * @return {Optional<ProjectFile>}
	 */
	file(name) {
		let file = new Optional();
		let files = this.Files;
		for (let i = 0; i < files.length; ++i) {
			if (files[i].Name == name)
				file.Value = files[i];
		}
		return file;
	}

	/**
	 * @param {string} name 
	 * @return {Optional<ProjectFolder>}
	 */
	folder(name) {
		let folder = new Optional();
		let folders = this.Folders;
		for (let i = 0; i < folders.length; ++i) {
			if (folders[i].Name == name)
				folder.Value = folders[i];
		}
		return folder;
	}

	/**
	 * @param {string} name 
	 * @return {boolean}
	 */
	fileExists(name) {
		return this.file(name).HasValue;
	}

	/**
	 * @param {string} name 
	 * @return {boolean}
	 */
	folderExists(name) {
		return this.folder(name).HasValue;
	}

	/**
	 * @param {ProjectFolder} folder 
	 */
	moveTo(folder) {
		let check = folder;
		let valid = check != this.parent;
		while (check != null && valid) {
			valid = check != this;
			check = check.parent;
		}
		if (valid) {
			folder.folderView.push(this);
			this.parent.folderView.remove(this);
			this.parent = folder;
		}
	}
}

export class Project {
	/** @type {KnockoutObservable<string>} */
	nameView = ko.observable("Text Adventure");

	/** @type {ProjectFolder} */
	root = new ProjectFolder("/", null);

	/** @type {object} */
	meta = {};

	/** @return {string} */
	get Name() { return this.nameView(); }

	/** @param {string} name */
	set Name(name) { this.nameView(name); }

	/**
	 * @param {JSZip} zipFolder 
	 * @param {ProjectFile[]} files 
	 */
	async #addFiles(zipFolder, files) {
		for (let i = 0; i < files.length; ++i) {
			let json = JSON.stringify(files[i].fileData);
			var blob = new Blob([json], {type: "application/json"});
			zipFolder.file(files[i].Name, blob);
		}
	}

	/**
	 * @param {JSZip} zipFolder 
	 * @param {ProjectFolder[]} folders 
	 */
	async #addFolder(zipFolder, folders) {
		for (let i = 0; i < folders.length; ++i) {
			let folder = zipFolder.folder(folders[i].Name);
			await this.#addFiles(folder, folders[i].Files);
		}
	}

	/**
	 * @param {ProjectFolder} folder 
	 * @param {ProjectFolderObj} obj 
	 */
	serializeFolder(folder, obj) {
		obj.name = folder.Name;
		let files = folder.Files;
		obj.files = [];
		obj.folders = [];
		for (let i = 0; i < files.length; ++i) {
			let f = files[i];
			obj.files.push({ name: f.Name, content: f.fileData });
		}
		let folders = folder.Folders;
		for (let i = 0; i < folders.length; ++i) {
			obj.folders.push(/** @type {ProjectFolderObj} */ ({}));
			this.serializeFolder(folders[i], obj.folders[i]);
		}
	}

	/**
	 * @param {Application} app
	 * @return {ProjectFolderObj}
	 */
	serialize(app) {
		// TODO:  Make temp folder in storage
		let obj = /** @type {ProjectFolderObj} */ ({});
		this.serializeFolder(this.root, obj)
		return obj;
	}

	/**
	 * @param {Application} app
	 * @param {ProjectFolderObj} projectJSON
	 */
	deserialize(app) {

	}

	/**
	 * @param {Application} app
	 */
	async export(app) {
		let zip = new JSZip();
		let audio = zip.folder("audio");
		await app.media.audioDatabase.serialize(audio);
		let images = zip.folder("images");
		await app.media.imageDatabase.serialize(images);
		await this.#addFolder(zip, this.root.Folders);
		await this.#addFiles(zip, this.root.Files);
		let content = await zip.generateAsync({type:"blob"})
		saveAs(content, `${this.Name}.zip`);
	}

	/**
	 * @param {Application} app
	 * @param {JSZip} zip 
	 * @returns {Promise}
	 */
	async importMedia(app, zip) {
		return new Promise((res, rej) => {
			let count = 1;
			zip.folder("audio").forEach((relativePath, file) => {
				count++;
				file.async("blob").then((blob) => {
					app.media.audioDatabase.add(file, URL.createObjectURL(blob));
					if (--count === 0)
						res(null);
				});
			});
			zip.folder("images").forEach((relativePath, file) => {
				count++;
				file.async("blob").then((blob) => {
					app.media.imageDatabase.add(file, URL.createObjectURL(blob));
					if (--count === 0)
						res(null);
				});
			});
			if (--count == 0)
				return res(null);
		});
	}

	/**
	 * @param {Application} app
	 * @param {File|Blob} fileBlob 
	 */
	async import(app, fileBlob) {
		let reader = new FileReader();
		reader.onload = async (e) => {
			let content = e.target?.result;
			let new_zip = new JSZip();
			let zip = await new_zip.loadAsync(content);
			await this.importMedia(app, zip)
			zip.folder().forEach(async (relativePath, file) => {
				debugger;
				if (StringHelpers.endsWith(relativePath, "/"))
					this.root.createFolder(relativePath.substring(0, -1));
				else if (StringHelpers.endsWith(file.name, ".json")) {
					let f = this.root.createFile(relativePath.substring(0, -".json".length));
					let txt = await file.async("string");
					f.setContent(JSON.parse(txt));
				}
			});
		};
		reader.readAsArrayBuffer(fileBlob);
	}
}
