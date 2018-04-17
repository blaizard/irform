/**
 * Convert an element into a file uploader, selector or anything to select a file or a link
 */
(function($) {
	/**
	 * \brief .\n
	 * 
	 * \alias jQuery.irformFile
	 *
	 * \param {String|Array} [action] The action to be passed to the function. If the instance is not created,
	 * \a action can be an \see Array that will be considered as the \a options.
	 * Otherwise \a action must be a \see String with the following value:
	 * \li \b create - Creates the object and associate it to a selector. \code $("#test").irformFile("create"); \endcode
	 *
	 * \param {Array} [options] The options to be passed to the object during its creation.
	 * See \see $.fn.irformFile.defaults a the complete list.
	 *
	 * \return {jQuery}
	 */
	$.fn.irformFile = function(arg, data) {
		/* This is the returned value */
		var retval;
		/* Go through each objects */
		$(this).each(function() {
			retval = $().irformFile.x.call(this, arg, data);
		});
		/* Make it chainable, or return the value if any  */
		return (typeof retval === "undefined") ? $(this) : retval;
	};

	/**
	 * This function handles a single object.
	 * \private
	 * \param arg
	 * \param data
	 */
	$.fn.irformFile.x = function(arg) {
		/* Load the default options */
		var options = $.fn.irformFile.defaults;

		/* --- Deal with the actions / options --- */
		/* Set the default action */
		var action = "create";
		/* Deal with the action argument if it has been set */
		if (typeof arg === "string") {
			action = arg;
		}
		/* If the module is already created and the action is not create, load its options */
		if (action != "create" && $(this).data("irformFile")) {
			options = $(this).data("irformFile");
		}
		/* If the first argument is an object, this means options have
		 * been passed to the function. Merge them recursively with the
		 * default options.
		 */
		if (typeof arg === "object") {
			options = $.extend(true, {}, options, arg);
		}
		/* Store the options to the module */
		$(this).data("irformFile", options);

		/* Handle the different actions */
		switch (action) {
		/* Create action */
		case "create":
			$.fn.irformFile.create.call(this);
			break;
		};
	};

	$.fn.irformFile.create = function() {
		/* Read the options */
		var options = $(this).data("irformFile");
		/* Reference to the main object */
		var obj = this;
		/* Create the container */
		var container = $("<div>", {
			class: "irform-group"
		});
		/* Create the input field */
		var input = $("<input>", {
			name: options.name,
			class: "irform",
			style: (options.showInput) ? "" : "display: none;"
		});
		$(container).append(input);
		if (!options.showInput) {
			$(container).append($("<span/>"));
		}
		/* Add the button(s) */
		for (var i in options.buttonList) {
			var presetName = options.buttonList[i];
			var preset = options.presets[presetName];
			var button = $("<button>", {
				class: "irform",
				type: "button"
			});
			$(button).text(preset.caption);
			$(button).data("irformFile", preset);
			$(button).click(function() {
				var callback = function(value) {
					if (value) {
						options.hookSelect.call(obj, presetName, value);
					}
					$(input).val(value);
				};
				var options = $(obj).data("irformFile");
				var preset = $(this).data("irformFile");
				// Cleanup the previous action if any
				if (options.clean) {
					options.clean.call(obj, callback);
				}
				// Save the new clean function if any
				options.clean = (preset.clean) ? preset.clean : null;
				$(obj).data("irformFile", options);

				// Call the action
				preset.action.call(obj, callback, preset.options);
			});
			$(container).append(button);
		}
		$(this).append(container);
	}

	/**
	 * \brief Default options, can be overwritten. These options are used to customize the object.
	 * Change default values:
	 * \code $().irformFile.defaults.theme = "aqua"; \endcode
	 * \type Array
	 */
	$.fn.irformFile.defaults = {
		/**
		 * The name of the element, this must be set
		 */
		name: "file",
		/**
		 * Button types
		 */
		buttonList: ["upload"],
		/**
		 * Overwrite the type of file supported, a string supporting regexpr format.
		 */
		fileType: null,
		/**
		 * If the input field should be displayed or not
		 */
		showInput: true,
		/**
		 * Callback once a value has been selected
		 */
		hookSelect: function(preset, value) {},
		/**
		 * List of presets
		 */
		presets: {
			"upload": {
				caption: "Upload",
				action: function(callback, presetOptions) {
					var options = $(this).data("irformFile");
					var file = $("<input>", {
						type: "file",
						class: "irform-file-upload",
						name: options.name + ((presetOptions.mode == "multi") ? "[]" : ""),
						multiple: (presetOptions.mode == "multi") ? true : false
					});
					$(file).on("change", function() {
						var name = "";
						if (typeof this.files === "object") {
							for (var i = 0; i<this.files.length; i++) {
								name += ((name) ? " " : "") + "\"" + this.files.item(i).name + "\"";
							}
						}
						callback(name);
					});
					$(file).on("click", function(e) {
						e.stopPropagation();
					});
					$(file).hide();
					$(this).append(file);
					$(file).trigger("click");
				},
				options: {mode: "multi"}, // or single
				clean: function(callback) {
					// Reset the value and destroy the previous upload if any
					callback("");
					$(this).find(".irform-file-upload").remove();
				}
			}
		}
	};
})(jQuery);

/* Add the module to Irform */
Irform.defaultOptions.fields.file = function(name, options) {
	var div = $("<div>");
	var o = {name: name};
	if (typeof options["options"] === "object") {
		o = $.extend(true, o, options["options"]);
	}
	$(div).irformFile(o);
	return div;
};
