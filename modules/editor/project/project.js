import { Application } from "../../application.js";
import { StorageFolder } from "../../engine/local_storage.js";
import { each, eachAsync, Optional, StringHelpers } from "../../engine/std.js";

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

	/** @type {object} */
	meta = {};

	/** @return {string} */
	get Name() { return this.nameView(); }

	/** @param {string} name */
	set Name(name) {
		this.root.Name = name;
		this.nameView(this.root.Name);
	}

	/**
	 * @param {string} name
	 */
	constructor(name) {
		this.Name = name;
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
			target = folder.Value.file(path[path.length - 1]);
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
		do {
			let folder = await app.storage.getFolder(name);
			found = folder.HasValue;
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
		let folder = await app.storage.getFolder(name);
		if (folder.HasValue) {
			this.Name = name;
			this.root.clear();
			await this.deserialize(app);
		}
	}

	/**
	 * @param {string} newName 
	 * @param {Application} app
	 */
	async rename(newName, app) {
		let oldName = this.Name;
		let newFolder = await app.storage.getFolder(newName);
		if (newFolder.HasValue)
			throw new Error("A project with that name already exists");
		this.Name = newName;
		let oldFolder = await app.storage.getFolder(oldName);
		if (oldFolder.HasValue)
			await app.storage.deleteFolder(oldFolder.Value);
		await this.serialize(app);
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
		await this.serialize(app);
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
	 * @param {ProjectFile[]} files 
	 */
	async #addFiles(zipFolder, files) {
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
	 * @param {ProjectFolder[]} folders 
	 */
	async #addFolder(zipFolder, folders) {
		for (let i = 0; i < folders.length; ++i) {
			let folder = zipFolder.folder(folders[i].Name);
			await this.#addFiles(folder, folders[i].Files);
		}
	}

	/**
	 * @param {Application} app
	 * @param {StorageFolder} parentFolder
	 * @param {ProjectFolder} projectFolder 
	 * @throws {Error}
	 */
	async serializeFolder(app, parentFolder, projectFolder) {
		let files = projectFolder.Files;
		for (let i = 0; i < files.length; ++i) {
			let f = files[i];
			await app.storage.writeFile(parentFolder, f.Name, f.fileData);
		}
		let folders = projectFolder.Folders;
		for (let i = 0; i < folders.length; ++i) {
			let childFolder = await app.storage.createSubFolder(parentFolder, folders[i].Name);
			if (!childFolder.HasValue)
				throw new Error(`Failed to create folder ${folders[i].Name}`);
			this.serializeFolder(app, childFolder.Value, folders[i]);
		}
	}

	/**
	 * @param {Application} app
	 * @param {StorageFolder} parentFolder
	 * @param {ProjectFolder} projectFolder
	 */
	async #deleteMissMatchesRecursively(app, parentFolder, projectFolder) {
		for (let i = 0; i < parentFolder.files.length; ++i) {
			let file = parentFolder.files[i];
			if (!projectFolder.fileExists(file))
				await app.storage.deleteFile(parentFolder, file);
		}
		eachAsync(parentFolder.children, async (name, folder) => {
			let childFolder = projectFolder.folder(folder.Name);
			if (childFolder.HasValue)
				await this.#deleteMissMatchesRecursively(app, folder, childFolder.Value);
			else
				await app.storage.deleteFolder(folder);
		});
	}

	/**
	 * @param {Application} app
	 * @throws {Error}
	 */
	async serialize(app) {
		let projectFolder = await app.storage.getFolder(this.Name);
		if (projectFolder.HasValue)
			await this.#deleteMissMatchesRecursively(app, projectFolder.Value, this.root);
		projectFolder = await app.storage.createFolder(this.Name);
		if (!projectFolder.HasValue)
			throw new Error("Failed to create project folder");
		let folder = projectFolder.Value;
		await this.serializeFolder(app, folder, this.root)
	}

	/**
	 * @param {Application} app
	 * @param {StorageFolder} parentFolder
	 * @param {ProjectFolder} projectFolder
	 */
	async deserializeFolder(app, parentFolder, projectFolder) {
		for (let i = 0; i < parentFolder.files.length; ++i) {
			let file = parentFolder.files[i];
			let data = await app.storage.readFile(parentFolder, file);
			let fileObj = projectFolder.createFile(file);
			fileObj.setContent(data);
		}
		each(parentFolder.children, (key, val) => {
			let folderObj = projectFolder.createFolder(/** @type {string} */ (key));
			this.deserializeFolder(app, val, folderObj);
		});
	}

	/**
	 * @param {Application} app
	 * @return {Promise<boolean>}
	 */
	async deserialize(app) {
		let tempFolder = await app.storage.getFolder(this.Name);
		if (!tempFolder.HasValue)
			return false;
		let folder = tempFolder.Value;
		await this.deserializeFolder(app, folder, this.root);
		return true;
	}

	/**
	 * @param {Application} app
	 */
	async export(app) {
		let zip = new JSZip();
		await this.#addFolder(zip, this.root.Folders);
		await this.#addFiles(zip, this.root.Files);
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
				if (relativePath.endsWith("/"))
					this.root.createFolder(relativePath.substring(0, -1));
				else if (file.name.endsWith(".json")) {
					let f = this.root.createFile(relativePath.substring(0, -".json".length));
					let txt = await file.async("string");
					f.setContent(JSON.parse(txt));
				}
			});
		};
		reader.readAsArrayBuffer(fileBlob);
	}
}
