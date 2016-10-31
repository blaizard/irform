/**
 * This file is use to map the irform with the use of irexplorer
 */
var IrformFileIrexplorer = function(callback, presetOptions) {
	if (typeof options === "undefined") {
		options = {};
	}
	/* Update the file type if set i the global options */
	var options = $(this).data("irformFile");
	if (options && options.fileType) {
		presetOptions = $.extend(true, presetOptions, {irexplorer: {showType: ["folder", options.fileType]}});
	}

	/* Launch the explorer */
	new IrexplorerDialog($.extend(true, {}, {
			relative: true,
			onValidate: function(path) {
				callback(path);
			}
		}, presetOptions));
};

/* Override default options */
$().irformTinymce.defaults.callbackBrowser = function(type, callback) {
	/* Change the mode */
	var mode = "file";
	switch (type) {
	case "image":
		mode = "image";
		break;
	}
	IrformFileIrexplorer(callback, {mode: mode});
};
/* Add support for the irform file */
$().irformFile.defaults.buttonList.push("browse");
$().irformFile.defaults.presets["browse"] = {
	caption: "Browse",
	action: IrformFileIrexplorer
};
$().irformFile.defaults.presets["image"] = {
	caption: "Select Image",
	options: {mode: "image"},
	action: IrformFileIrexplorer
};
$().irformFile.defaults.presets["directory"] = {
	caption: "Select Directory",
	options: {mode: "directory"},
	action: IrformFileIrexplorer
};
