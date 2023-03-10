import { Application } from "../../application.js";
import { Optional } from "../../engine/std.js";
import { AudioDatabase, ImageDatabase } from "../../media.js";
import { ProjectData, ProjectDatabase, ProjectDataFile, ProjectDataFolder } from "./project_database.js";

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

	/** @return {string} */
	get Path() {
		let parts = [this.Name];
		let parent = this.parent;
		// Doing parent.parent because we don't want the root folder
		while (parent.parent != null) {
			parts.push(parent.Name);
			parent = parent.parent;
		}
		parts.reverse();
		return parts.join("/");
	}

	/** @param {object} fileData */
	setContent(fileData) {
		this.fileData = fileData;
	}

	/**
	 * @param {ProjectFolder} folder 
	 */
	moveTo(folder) {
		let valid = folder != this.parent;
		if (folder.fileExists(this.Name)) {
			valid = false;
			alert("A file with that name already exists in the destination folder.");
		}
		if (valid) {
			folder.fileView.push(this);
			this.parent.fileView.remove(this);
			this.parent = folder;
		}
		return valid;
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

	/**
	 * @param {string} name
	 * @throws {Error}
	 */
	set Name(name) {
		if (!name || name.trim().length == 0)
			throw new Error("New name is empty, this is not allowed");
		else if (name.indexOf("/") != -1)
			throw new Error("The name can not contain a '/' character");
		if ((/[^a-zA-Z0-9_\-\s\.]/).test(name)) {
			throw new Error("Name contains invalid symbols, please name it a name that would be accepted by your local computer if it were a file.");
		}
		this.nameView(name);
	}

	/** @return {string} */
	get Path() {
		let parts = [this.Name];
		let parent = this.parent;
		// Doing parent.parent because we don't want the root folder
		while (parent.parent != null) {
			parts.push(parent.Name);
			parent = parent.parent;
		}
		parts.reverse();
		return parts.join("/");
	}

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
	 * @return {boolean}
	 */
	moveTo(folder) {
		let check = folder;
		let valid = check != this.parent;
		if (folder.fileExists(this.Name)) {
			valid = false;
			alert("A folder with that name already exists in the destination folder.");
		}
		while (check != null && valid) {
			valid = check != this;
			check = check.parent;
		}
		if (valid) {
			folder.folderView.push(this);
			this.parent.folderView.remove(this);
			this.parent = folder;
		}
		return valid;
	}

	/**
	 * @param {ProjectFile} file
	 */
	deleteFile(file) {
		this.fileView.remove(file);
	}

	/**
	 * @param {ProjectFolder} folder 
	 */
	deleteFolder(folder) {
		this.folderView.remove(folder);
	}

	/**
	 * 
	 */
	clear() {
		this.fileView.removeAll();
		this.folderView.removeAll();
	}
}

export class Project {
	static get META_FILE_NAME() { return "meta.json" };

	/** @type {KnockoutObservable<string>} */
	nameView = ko.observable("Text Adventure");

	/** @type {ProjectFile} */
	openFile;

	/** @type {ProjectFolder} */
	root = new ProjectFolder("/", null);

	/** @type {ProjectDatabase} */
	#db;

	/** @return {string} */
	get Name() { return this.nameView(); }

	/** @param {string} name */
	set Name(name) {
		this.root.Name = name;
		this.nameView(this.root.Name);
	}

	/**
	 * @param {string} name
	 * @param {ProjectDatabase} database
	 */
	constructor(name, database) {
		this.Name = name;
		this.#db = database;
	}

	/**
	 * @param {string} path 
	 * @return {Optional<ProjectFile>}
	 */
	findFile(path) {
		let parts = path.split("/");
		/** @type {Optional<ProjectFile>} */
		let target = new Optional();
		/** @type {Optional<ProjectFolder>} */
		let folder = new Optional(this.root);
		for (let i = 0; i < parts.length - 1 && folder.HasValue; ++i)
			folder = folder.Value.folder(parts[i]);
		if (folder.HasValue)
			target = folder.Value.file(parts[parts.length - 1]);
		return target;
	}

	/**
	 * @param {Application} app
	 */
	async setupNew(app) {
		const untitledName = "Untitled Project";
		let found = true;
		let name = untitledName;
		let i = 0;
		const existing = await this.#db.listProjects();
		do {
			found = existing.includes(name);
			if (found)
				name = `${untitledName} ${++i}`;
		} while(found);
		this.Name = name;
		this.root.clear();
	}

	/**
	 * @param {string} name 
	 * @param {Application} app 
	 */
	async open(name, app) {
		let proj = await this.#db.readProject(name);
		if (proj) {
			this.Name = name;
			this.root.clear();
			await this.deserialize();
		}
	}

	/**
	 * @param {string} newName 
	 */
	async rename(newName) {
		await this.#db.renameProject(this.Name, newName);
		this.Name = newName;
	}

	/**
	 * @return string
	 */
	#tempName() {
		const untitled = "Untitled";
		let name = `${untitled}.json`;
		let i = 0;
		while (this.root.fileExists(name))
			name = `${untitled} (${++i}).json`
		return name;
	}

	/**
	 * @param {object} defaultData
	 */
	newTempFile(defaultData) {
		let name = this.#tempName();
		this.openFile = this.root.createFile(name);
		this.openFile.setContent(defaultData);
	}

	/**
	 * @returns {Optional<ProjectFile>}
	 */
	#findAnyProjectFileButMetaRecursively(folder) {
		let target = new Optional();
		let files = folder.Files;
		for (let i = 0; i < files.length && !target.HasValue; ++i) {
			if (files[i].Name != Project.META_FILE_NAME && files[i].Name.endsWith(".json"))
				target.Value = files[i];
		}
		let folders = folder.Folders;
		for (let i = 0; i < folders.length && !target.HasValue; ++i) {
			target = this.#findAnyProjectFileButMetaRecursively(folders[i]);
		}
		return target;
	}

	/**
	 * @returns {Optional<ProjectFile>}
	 */
	#findAnyProjectFileButMeta() {
		return this.#findAnyProjectFileButMetaRecursively(this.root);
	}

	/**
	 * @param {object} defaultData
	 */
	deleteOpenFile(defaultData) {
		this.openFile.parent.deleteFile(this.openFile);
		let target = this.#findAnyProjectFileButMeta();
		if (target.HasValue)
			this.openFile = target.Value;
		else
			this.newTempFile(defaultData);
	}

	/**
	 * @param {Application} app
	 * @param {object} defaultData
	 */
	async initialize(app, defaultData) {
		this.root.createFile(Project.META_FILE_NAME);
		const defaultName = "Untitled.json";
		if (this.root.fileExists(defaultName))
			this.openFile = this.root.file(defaultName).Value;
		else {
			this.openFile = this.root.createFile(defaultName);
			this.openFile.setContent(defaultData);
		}
		await this.serialize();
	}

	/**
	 * @param {object} defaultData
	 */
	async pickRandomFile(defaultData) {
		if (this.root.fileExists("Untitled.json"))
			this.openFile = this.root.file("Untitled.json").Value;
		else {
			let file = this.#findAnyProjectFileButMeta();
			if (file.HasValue)
				this.openFile = file.Value;
			else {
				this.openFile = this.root.createFile("Untitled.json");
				this.openFile.setContent(defaultData);
			}
		}
	}

	/**
	 * @param {JSZip} zipFolder 
	 * @param {ProjectFolder} folder
	 */
	async #addFiles(zipFolder, folder) {
		let files = folder.Files;
		for (let i = 0; i < files.length; ++i) {
			let blob = null;
			if (files[i].Name.endsWith(".json"))
				blob = new Blob([JSON.stringify(files[i].fileData)], {type: "application/json"});
			else if (files[i].Name.endsWith(".png"))
				blob = new Blob([files[i].fileData], {type: "image/png"});
			else if (files[i].Name.endsWith(".jpg"))
				blob = new Blob([files[i].fileData], {type: "image/jpg"});
			else if (files[i].Name.endsWith(".jpeg"))
				blob = new Blob([files[i].fileData], {type: "image/jpeg"});
			else if (files[i].Name.endsWith(".gif"))
				blob = new Blob([files[i].fileData], {type: "image/gif"});
			else if (files[i].Name.endsWith(".svg"))
				blob = new Blob([files[i].fileData], {type: "image/svg+xml"});
			else if (files[i].Name.endsWith(".mp3"))
				blob = new Blob([files[i].fileData], {type: "audio/mpeg"});
			else if (files[i].Name.endsWith(".wav"))
				blob = new Blob([files[i].fileData], {type: "audio/wav"});
			else if (files[i].Name.endsWith(".ogg"))
				blob = new Blob([files[i].fileData], {type: "audio/ogg"});
			if (blob != null)
				zipFolder.file(files[i].Name, blob);
		}
	}

	/**
	 * @param {JSZip} zipFolder 
	 * @param {ProjectFolder} folder 
	 */
	async #addFolder(zipFolder, folder) {
		let subFolder =  zipFolder.folder(folder.Name);
		await this.#addFiles(subFolder, folder);
		let folders = folder.Folders;
		for (let i = 0; i < folders.length; ++i)
			await this.#addFolder(subFolder, folders[i]);
	}

	/**
	 * @param {ProjectFolder} projectFolder 
	 * @param {ProjectDataFolder} dataFolder
	 */
	serializeFolder(projectFolder, dataFolder) {
		let files = projectFolder.Files;
		for (let i = 0; i < files.length; ++i) {
			let f = files[i];
			dataFolder.files.push(new ProjectDataFile(f.Name, f.fileData));
		}
		let folders = projectFolder.Folders;
		for (let i = 0; i < folders.length; ++i) {
			let f = folders[i];
			let df = new ProjectDataFolder(f.Name);
			dataFolder.folders.push(df);
			this.serializeFolder(f, df);
		}
	}

	/**
	 * 
	 */
	async serialize() {
		let data = new ProjectData(this.Name);
		this.serializeFolder(this.root, data.root);
		await this.#db.saveProject(data);
	}

	/**
	 * @param {ProjectFolder} projectFolder
	 * @param {ProjectDataFolder} dataFolder
	 */
	deserializeFolder(projectFolder, dataFolder) {
		for (let i = 0; i < dataFolder.files.length; ++i) {
			let f = dataFolder.files[i];
			let fileObj = projectFolder.createFile(f.name);
			fileObj.setContent(f.content);
		}
		for (let i = 0; i < dataFolder.folders.length; ++i) {
			let f = dataFolder.folders[i];
			let folderObj = projectFolder.createFolder(f.name);
			this.deserializeFolder(folderObj, f);
		}
	}

	/**
	 * @return {Promise<boolean>}
	 */
	async deserialize() {
		let projectData = await this.#db.readProject(this.Name);
		if (projectData != null) {
			await this.deserializeFolder(this.root, projectData.root);
			return true;
		} else
			return false;
	}

	/**
	 * 
	 */
	async export() {
		let zip = new JSZip();
		let folders = this.root.Folders;
		for (let i = 0; i < folders.length; ++i)
			await this.#addFolder(zip, folders[i]);
		await this.#addFiles(zip, this.root);
		// I've done something wrong here, but I don't know what
		let size = 0;
		let content = await zip.generateAsync({type:"blob"});
		while (size != content.size) {
			size = content.size;
			content = await zip.generateAsync({type:"blob"});
		} while(size != content.size);
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
			zip.forEach((relativePath, file) => {
				if (AudioDatabase.isFileAudio(file.name)) {
					count++;
					file.async("blob").then((blob) => {
						app.media.audioDatabase.add(file, URL.createObjectURL(blob));
						if (--count === 0)
							res(null);
					});
				}
			});
			zip.forEach((relativePath, file) => {
				if (ImageDatabase.isFileImage(file.name)) {
					count++;
					file.async("blob").then((blob) => {
						app.media.imageDatabase.add(file, URL.createObjectURL(blob));
						if (--count === 0)
							res(null);
					});
				}
			});
			if (--count == 0)
				return res(null);
		});
	}

	/**
	 * @param {Application} app
	 * @param {File} fileBlob 
	 * @param {Function} callback
	 */
	async import(app, fileBlob, callback) {
		let reader = new FileReader();
		this.Name = fileBlob.name.substring(0, fileBlob.name.length-".zip".length);
		this.root.clear();
		reader.onload = async (e) => {
			let content = e.target?.result;
			let new_zip = new JSZip();
			let zip = await new_zip.loadAsync(content);
			// TODO:  Import this in the same foreach below
			//await this.importMedia(app, zip)
			zip.folder().forEach(async (relativePath, file) => {
				if (relativePath.endsWith("/")) {
					debugger;
					let parts = relativePath.substring(0, relativePath.length-1).split("/");
					let folder = this.root;
					if (parts.length > 1)
						folder = this.root.folder(parts[0]).Value;
					for (let i = 1; i < parts.length - 1; ++i)
						folder = folder.folder(parts[i]).Value;
					folder.createFolder(parts[parts.length - 1]);
				} else if (file.name.endsWith(".json")) {
					let parts = relativePath.split("/");
					let folder = this.root;
					for (let i = 0; i < parts.length - 1; ++i)
						folder = folder.folder(parts[i]).Value;
					// substring the relative path to remove the .json extension
					let f = folder.createFile(parts[parts.length - 1]);
					let txt = await file.async("string");
					f.setContent(JSON.parse(txt));
					// Select first file that isn't meta.json
					if (callback && file.name != Project.META_FILE_NAME) {
						this.openFile = f;
						callback();
						callback = null;
					}
				}
			});
		};
		reader.readAsArrayBuffer(fileBlob);
	}
}
