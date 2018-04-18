/**
 * \brief Manipulate and create dynamic forms.
 *
 * This class handles forms in general. It adds the ability to read form values dynamically and
 * adds multi form functionality (i.e. being able to have arrays in form).
 *
 * \param container The container where the form will be created
 * \param formDescription The description of the form
 * \param [options] Options to be passed to the form, see \see Irform.defaultOptions for more details
 */
var Irform = function (container, formDescription, options) {
	// Trigger require, to make sure that any pending modules are loaded
	//irRequire.trigger();
	this.container = $(container);
	this.formDescription = formDescription;
	this.options = $.extend(true, {}, Irform.defaultOptions, options);
	// Empty the container first
	this.container.empty();
	// Set the class
	this.container.addClass("irform-layout");
	// Call the hook
	this.options.hookInit.call(this);
	// Create the form
	this.create(container, formDescription);
};

/**
 * Preset used for validation
 */
//! \{
/**
 * \brief Validates a to z characters
 */
Irform.CHAR_A_Z = 0x01;
/**
 * \brief Validates numeric characters
 */
Irform.CHAR_0_9 = 0x02;
/**
 * \brief Validates spaces, including newlines and tabs
 */
Irform.CHAR_SPACE = 0x04;
/**
 * \brief Validates special characters: \code !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~ \endcode
 */
Irform.CHAR_SPECIAL = 0x08;
/**
 * \brief Validates with dashes and underscores
 */
Irform.CHAR_DASH = 0x10;
/**
 * \brief Validates upper case charaters only
 */
Irform.CHAR_UPPERCASE_ONLY = 0x20;
/**
 * \brief Validates lower case characters only
 */
Irform.CHAR_LOWERCASE_ONLY = 0x40;
/**
 * \brief Validates emails
 */
Irform.EMAIL = {rule: "^[A-Za-z0-9\._%\+\-]+@[A-Za-z0-9\.\-]+\.[a-zA-Z]{2,}$", msg: "Please enter a valid email"};
//! \}

/**
 * Default options of the form make. It can be overwritten or updated by modules.
 */
Irform.defaultOptions = {
	/**
	 * Describes the fields that can be used with this form
	 */
	fields: {
		input: function(name, options) {
			return $("<input>", {
				type: "text",
				name: name,
				class: "irform",
				placeholder: options.placeholder
			});
		},
		/**
		 * \brief Create one or multiple checkbox field(s).
		 */
		checkbox: function(name, options) {
			var createCheckbox = function(name, label, inline) {
				var container = $("<div>", {
					class: (inline) ? "irform-inline" : ""
				});
				var input = $("<input>", {
					type: "checkbox",
					name: name,
					class: "irform",
					id: "irform-checkbox-" + (++Irform.unique)
				});
				$(container).append(input);
				$(container).append("<label for=\"" + $(input).prop("id") + "\">" + label + "</label>");
				return container;
			};

			if (!options.list) {
				return createCheckbox(name, "", false);
			}
			if (options.list.length == 1) {
				return createCheckbox(name, options.list[0], false);
			}

			var container = $("<div>", {
				class: "irform-container",
				name: name
			});
			var list = options.list;
			for (var i in list) {
				var checkbox = createCheckbox(((typeof i == "string") ? i : list[i]), list[i], options.inline);
				$(container).append(checkbox);
			}

			return container;
		},
		switch: function(name/*, options*/) {
			var container = $("<div>", {
				class: "irform irform-switch"
			});
			var input = $("<input>", {
				type: "checkbox",
				name: name,
				id: "irform-switch-" + (++Irform.unique)
			});
			$(container).append(input);
			$(container).append("<label for=\"" + $(input).prop("id") + "\"></label>");
			return container;
		},
		password: function(name, options) {
			return $("<input>", {
				type: "password",
				name: name,
				class: "irform",
				placeholder: options.placeholder
			});
		},
		textarea: function(name, options) {
			return $("<textarea>", {
				name: name,
				class: "irform",
				placeholder: options.placeholder
			});
		},
		submit: function(name, options) {
			var button = $("<button>", {
				type: "button",
				name: name,
				class: "irform",
			});
			$(button).html(options.value || "Submit");	
			var obj = this;
			$(button).click(function() {
				obj.submit(options.callback);
			});
			return button;
		},
		select: function(name, options) {
			var select = $("<select>", {
				name: name,
				class: "irform"
			});
			var list = options["list"];
			for (var name in list) {
				var opt = $("<option>", {
					value: (list instanceof Array) ? list[name] : name
				});
				$(opt).html(list[name]);
				$(select).append(opt);
			}
			return select;
		}
	},
	/**
	 * This describes the default field type when none is specified
	 */
	defaultType: "input",
	/**
	 * The wrapper to go around the field and keep a common consistency
	 * \param elt
	 * \param options
	 * \param name
	 */
	wrapper: function(elt, options/*, name*/) {
		var wrapper = $("<div>");
		if (typeof options.caption === "string") {
			var div = $("<div>", {
				class: "irform-caption"
			});
			$(div).text(options.caption);
			$(wrapper).append(div);
		}
		var value = $("<div>", {
			class: "irform-elements"
		});
		$(value).append(elt);
		$(wrapper).append(value);
		return wrapper;
	},
	/**
	 * This function will be called in case of error (validation, missing value)
	 */
	callbackError: function(errorList) {
		// Clean previous error
		this.container.find(".irform-item.error").removeClass("error");
		for (var i in errorList) {
			var msg = "";
			var id = null;
			var e = errorList[i];
			// Set error
			$(e["item"]).removeClass("success").addClass("error");
			switch (e["type"]) {
			case "required":
				msg = "This field is required";
				id = "required-" + e["name"];
				break;
			case "validation":
				msg = (e["msg"]) ? e["msg"] : "This field does not validate";
				id = "validation-" + e["name"];
				break;
			}
			if (msg) {
				Irnotify(msg, {container: $(e["item"]).find(".irform-elements"), type: "error", id: id});
			}
		}
	},
	/**
	 * Called once an item has been validated successfully
	 * \param item
	 * \param name
	 */
	callbackSuccess: function(item, name) {
		$(item).removeClass("error").addClass("success");
		Irnotify.delete("*", item);
	},
	/**
	 * This function is called to clean-up remaining notifications
	 * if needed.
	 */
	callbackClean: function() {
		Irnotify.delete("*", this.container);
	},
	/**
	 * Called once an item needs to be disabled
	 */
	disable: function(isDisabled, elt) {
		var nameHolder = Irform.findNameHolder(elt);
		$(nameHolder).find("input,textarea,select,button").add(nameHolder).prop("disabled", isDisabled);
		$(elt).find("input,textarea,select,button").filter(".irform").prop("disabled", isDisabled);
		if (isDisabled) {
			$(elt).addClass("disable");
		}
		else {
			$(elt).removeClass("disable");
		}
		Irform.queue(nameHolder, function() {
			$(nameHolder).trigger((isDisabled) ? "disable" : "enable");
		});
	},
	/**
	 * Hook called during the initialization phase
	 */
	hookInit: function() {}
};

/**
 * \brief Validate a value from a preset.
 *
 * \param presets One of the validation presets defined, such as \see Irform.CHAR_A_Z or \see Irform.CHAR_DASH for example
 * \param value The value to validate
 *
 * \return true in case of success or a string with a message describing the issue otherwise.
 */
Irform.validate = function (presets, value) {
	if (typeof value === "string") {
		var msg = [];
		// Check if the upper case condition is set
		if ((presets & Irform.CHAR_UPPERCASE_ONLY) && /[a-z]/g.test(value)) {
			return "This field must be upper case only";
		}
		// Check if the lower case condition is set
		if ((presets & Irform.CHAR_LOWERCASE_ONLY) && /[A-Z]/g.test(value)) {
			return "This field must be lower case only";
		}
		// Replace all a-z characters regardless of the case
		if (presets & Irform.CHAR_A_Z) {
			value = value.replace(/[a-z]/ig, "");
			msg.push("alphanumeric characters"); 
		}
		// Replace all numbers
		if (presets & Irform.CHAR_0_9) {
			value = value.replace(/[0-9]/g, "");
			msg.push("numbers"); 
		}
		// Replace all numbers
		if (presets & Irform.CHAR_DASH) {
			value = value.replace(/-_/g, "");
			msg.push("underscores (_), dashes (-)"); 
		}
		// Replace all spaces
		if (presets & Irform.CHAR_SPACE) {
			value = value.replace(/[ ]/g, "");
			msg.push("spaces"); 
		}
		// Replace all special characters
		if (presets & Irform.CHAR_SPECIAL) {
			value = value.replace(/[!"#\$%&'\(\)\*\+,\-\.\/:;<=>\?@\[\\\]^_`\{\|\}~]/g, "");
			msg.push("special characters"); 
		}
		return (value === "" || !msg.length) ? true : "This field only accepts " + msg.join(", ");
	}
	return true;
}

/**
 * \brief This function find the name holder element from a parent element
 * \param elt The parent element
 * \param [name] The optional name attribute
 */
Irform.findNameHolder = function (elt, name) {
	if (typeof name === "undefined") {
		name = ($(elt).hasClass("irform-item")) ? $(elt).attr("data-irform") : null;
	}
	return $(elt).find("[name" + ((name) ? ("=" + name) : "") + "]").addBack("[name" + ((name) ? ("=" + name) : "") + "]").first();
}

/**
 * Creates a form
 */
Irform.prototype.create = function (container, formDescription) {
	// To generate unique Ids
	if (typeof Irform.unique === "undefined") {
		Irform.unique = 0;
	}
	for (var i in formDescription) {
		// Save as local to pass it through callbacks
		var obj = this;
		var itemOptions = $.extend({
			name: "irform" + (++Irform.unique),
			type: this.options.defaultType,
			required: false,
			validate: null,
			mask: null,
			disabled: false,
			// By default set item with a name set automatically as ignored
			ignore: (typeof formDescription[i].name === "undefined") ? true : false,
			options: {}
		}, formDescription[i]);
		// Read the name
		var itemName = itemOptions.name;
		// Assign everything back, this must be done due to the automatically generated name
		formDescription[i] = itemOptions;
		// Generate the element
		var type = itemOptions["type"];
		if (typeof this.options.fields[type] !== "function") {
			console.log("'" + type + "' is not supported");
			continue;
		}
		var containerItem = this.options.fields[type].call(this, itemName, itemOptions, function() {
			// Remove the pending tag and execute all the pending items in the queue
			$(this).removeClass("irform-pending");
			Irform.queue(this);
		});
		var nameHolder = Irform.findNameHolder(containerItem, itemName);
		// Define the on-change function
		$(nameHolder).on("change", function() {
			var name = $(this).prop("name") || $(this).attr("name");
			var value = Irform.get(this)[name];
			var item = $(this).closest(".irform-item");
			var itemOptions = $(item).data("irform");
			// If there is a validate condition
			if (!Irform.isEmpty(value) && itemOptions.validate) {
				var msg = obj.validate(item, value);
				if (msg === true) {
					obj.options.callbackSuccess.call(obj, item, name);
				}
				else {
					obj.options.callbackError.call(obj, [{type: "validation", msg: msg, item: item, name: name, options: itemOptions}]);
				}
			}
			// Validate also if the item is required and the value is non-empty
			else if (!Irform.isEmpty(value) && $(item).hasClass("required")) {
				obj.options.callbackSuccess.call(obj, item, name);
			}
			// Support the onchange callback
			if (typeof itemOptions.onchange == "function") {
				itemOptions.onchange.call(obj, item, value);
			}
			else if (typeof itemOptions.onchange == "object") {
				// Delete all the sub entry from this
				if ($(this).data("nextElement")) {
					$(item).nextUntil($(this).data("nextElement")).remove();
				}
				// Save the value of the next element
				$(this).data("nextElement", $(item).next());
				// Then add a new element
				if (typeof itemOptions.onchange[value] === "object") {
					obj.create(item, itemOptions.onchange[value]);
				}
				else if (typeof itemOptions.onchange["__default__"] === "object") {
					obj.create(item, itemOptions.onchange["__default__"]);
				}
			}
		});
		// Insert the wrapper
		var item = this.options.wrapper.call(this, containerItem, itemOptions, itemName);
		$(item).addClass("irform-item");
		// Set the width
		if (itemOptions.width) {
			$(item).css("width", itemOptions.width);
		}
		// Set the alignment, it can be "left", "bottom", "top" and/or "right"
		if (itemOptions.align) {
			itemOptions.align.replace(/\s\s+/g, " ").toLowerCase().split(" ").map(function (name) {
				$(item).addClass("irform-align-" + name.trim());
			});
		}
		// Associate the name of the element with the element
		$(item).attr("data-irform", itemName);
		// Check if it has to be set has required
		if (itemOptions.required) {
			$(item).addClass("required");
		}
		// Set flags if needed
		if (itemOptions.disabled) {
			Irform.queue(nameHolder, function() {
				obj.options.disable.call(obj, true, $(this).closest(".irform-item"));
			});
		}
		// If it has input masking, set the filter
		if (itemOptions.mask) {
			$(nameHolder).on("input", function() {
				var itemOptions = $(this).closest(".irform-item").data("irform");
				Irform.mask(this, itemOptions.mask);
			});
		}
		// Save data to this element
		$(item).data("irform", itemOptions);
		// Paste it on the DOM
		($(container).hasClass("irform-item")) ? $(container).after(item) : $(container).append(item);
	}

	// Trigger change to all items
	for (var i in formDescription) {
		var itemName = formDescription[i].name;
		// Check the element
		var nameHolder = Irform.findNameHolder(this.container, itemName);
		// Trigger a value change to add new items if needed
		Irform.queue(nameHolder, function() {
			$(this).trigger("change");
		});
	}
};

/**
 * Mask an item with the specific filter
 */
Irform.mask = function (obj, mask) {
	var value = $(obj).val();
	var newValue = "";
	for (var i = 0; i<mask.length && value; i++) {
		// Pop the first character
		var c = value[0];
		// Handle numbers
		if (mask[i] == "9") {
			if (/[^0-9]/.test(c)) {
				break;
			}
		}
		// Handle characters
		else if (mask[i] == "z") {
			if (/[^a-z]/i.test(c)) {
				break;
			}
		}
		// Handle characters & numbers
		else if (mask[i] == "*") {
			if (/[^a-z0-9]/i.test(c)) {
				break;
			}
		}
		// Handle hard-coded characters
		else if (mask[i] != c) {
			newValue += mask[i];
			continue;
		}
		newValue += c;
		value = value.substr(1);
	}
	$(obj).val(newValue);
};

/**
 * Submit the form
 */
Irform.prototype.submit = function (callback) {
	// Read teh values, and make sure everything is validated
	var values = this.get();
	if (values === false) {
		return;
	}
	// If a callback is passsed into argument, simply call it
	if (typeof callback === "function") {
		callback.call(this, values);
	}
	// If this is part of a form, submit the form
	else if (this.container.is("form")) {
		var form = $("<form>", {
			action: this.container.prop("action"),
			method: this.container.prop("method") || "POST",
			enctype: "multipart/form-data",
			style: "display: none;"
		});
		// Re-create the data
		var createDataRec = function(values, prefix) {
			var data = "";
			for (var name in values) {
				if (typeof values[name] === "object") {
					// Cannot send an emty array via post, then if the array is empty, simply do not send it
					data += createDataRec(values[name],
							((prefix) ? prefix + "[" + name + "]" : name));
				}
				else {
					// POST converts all types to string, so no need to make special cases
					data += "<input name=\""
							+ ((prefix) ? prefix + "[" + name + "]" : name)
							+ "\" value=\"" + (values[name] + "").replace(/"/g, '&quot;') + "\"/>";
				}
			}
			return data;
		};
		var data = createDataRec(values, "");
		$(form).html(data);
		// Note: file upload works only with POST and enctype="multipart/form-data"
		this.container.find("input[type=file]").each(function() {
			$(this).appendTo(form);
		});
		// Need to append to the DOM the form before submitting it (at least for IE & FF)
		$("body").append(form);
		form.submit();
	}
}

/**
 * Find the name holder
 */
Irform.prototype.findNameHolder = function (name) {
	return Irform.findNameHolder(this.container, name);
};

/**
 * Disable all elements of the form
 */
Irform.prototype.disable = function () {
	var disable_fct = this.options.disable;
	this.each(function(item) {
		disable_fct.call(this, true, item);
	});
};

/**
 * Enable all elements of the form
 */
Irform.prototype.enable = function () {
	var disable_fct = this.options.disable;
	this.each(function(item) {
		disable_fct.call(this, false, item);
	});
};

/**
 * Update the form description
 */
Irform.prototype.update = function (formDescription) {
	var values = this.get(function() {}, true);
	this.container.empty();
	this.formDescription = formDescription;
	this.create(this.container, formDescription);
	this.set(values);
};

/**
 * This function ignore a value or not
 */
Irform.prototype.ignore = function (item, isIgnore) {
	var itemOptions = $(item).data("irform");
	itemOptions.ignore = isIgnore;
	$(item).data("irform", itemOptions);
};

/**
 * Validate an element denoted by its item and its value
 */
Irform.prototype.validate = function (item, value) {
	var data = $(item).data("irform");
	var validateFct = function selfRec(item, value, validate, msg) {
		// Helper function
		var returnResult = function(res) {
			return (res === true) ? true : (msg) ? msg : res;
		};

		// Make validate an if not already, to support multiples validation
		if ($.isArray(validate)) {
			for (var i in validate) {
				var result = selfRec.call(this, item, value, validate[i], msg);
				if (result !== true) {
					return result;
				}
			}
		}
		// Process the validation
		else if (typeof validate === "object") {
			return selfRec.call(this, item, value, validate.rule, validate.msg);
		}
		// Called the function to test the validation
		else if (typeof validate === "number") {
			return returnResult(Irform.validate(validate, value));
		}
		// If string it can a mirror to another field or a regular expression
		else if (typeof validate === "string") {
			// Check if the string has non special characters && a field with this name exists
			var nameHolderMirror;
			if (Irform.validate(Irform.CHAR_A_Z | Irform.CHAR_0_9 | Irform.CHAR_DASH, validate) === true) {
				var nameHolderMirror = this.findNameHolder(validate);
				if (nameHolderMirror.length) {
					return returnResult((value == nameHolderMirror.val()) ? true : "This field does not match '" + validate + "'");
				}
			}
			var re = new RegExp(validate, "g");
			return returnResult((re.test(value)) ? true : null);
		}
		else if (typeof validate === "function") {
			return returnResult(validate.call(this, value, item));
		}

		// By default the validation passed
		return true;
	};

	// Call the validation function
	return validateFct.call(this, item, value, data.validate, null);
};

/**
 * Loop through all items displayed on the current form
 */
Irform.prototype.each = function (callback) {
	var obj = this;
	this.container.find(".irform-item").each(function() {
		callback.call(obj, this);
	});
};

/**
 * Get the data from the form. It will in addition make sure that
 * all the required items are correctly filled.
 * In case of error, false will be returned.
 */
Irform.prototype.get = function (callback, force) {
	var isError = false;
	var errorList = [];
	var obj = this;
	// This option will force the reading of values
	if (typeof force === "undefined") {
		force = false;
	}
	// Generate the selection
	var selector = $();
	this.each(function(item) {
		selector = selector.add($("[name=" + $(item).attr("data-irform") + "]"));
	});
	// Cleanup all the elements
	this.options.callbackClean.call(this);
	// Get the data
	var result = Irform.get(selector, function (key, value) {
		var item = $(this).closest(".irform-item");
		var data = item.data("irform");
		if (force) {
			return;
		}
		// If this attribute needs to be ignored
		if (data.ignore) {
			return null;
		}
		// If this is a required element with an empty value
		if (Irform.isEmpty(value) && item.hasClass("required")) {
			errorList.push({type: "required", item: item, name: key, options: data});
			isError = true;
		}
		// If this element needs to be validated
		if (data.validate) {
			var result = obj.validate(item, value);
			if (result !== true) {
				errorList.push({type: "validation", msg: result, item: item, name: key, options: data});
				isError = true;
			}
		}
		// If there is a callback
		if (typeof callback === "function") {
			var result = callback.call(obj, item, key, value);
			if (typeof result !== "undefined") {
				return result;
			}
		}
	});
	if (isError) {
		this.options.callbackError.call(this, errorList);
		return false;
	}
	return result;
};

/**
 * Set the data of the form.
 */
Irform.prototype.set = function (values) {
	var nameUsed = {};
	do {
		var isValueSet = false;
		Irform.set(this.container, values, function(key) {
			// This value has already been set, continue
			if (typeof nameUsed[key] !== "undefined") {
				return null;
			}
			nameUsed[key] = true;
			isValueSet = true;
		});
	} while (isValueSet);
};

/**
 * Update the form description
 */
Irform.queue = function (item, action) {
	// Add an item to the queue or execute it
	if (typeof action === "function") {
		if ($(item).hasClass("irform-pending")) {
			var queue = $(item).data("irform-queue") || [];
			queue.push(action);
			$(item).data("irform-queue", queue);
		}
		else {
			action.call(item);
		}
	}
	// Execute the items from the queue
	else {
		var queue = $(item).data("irform-queue") || [];
		while (queue.length) {
			var action = queue.shift();
			action.call(item);
		}
		$(item).data("irform-queue", []);
	}
};

/**
 * Set the data to a form. This is a static function.
 */
Irform.set = function (selector, values, callback) {

	// Find direct elements only
	var list = $(selector).find("[name]").addBack("[name]").not("a").filter(function() {
		var nearestMatch = $(this).parent().closest("[name]");
		return nearestMatch.length == 0 || ($(selector).find(nearestMatch).length == 0 && $(selector).filter(nearestMatch).length == 0);
	});

	var elementProcessed = 0;
	// Set their values
	$(list).each(function() {
		var key = $(this).prop("name") || $(this).attr("name");
		if (typeof values[key] !== "undefined") {
			var value = values[key];
			if (typeof callback === "function") {
				var result = callback.call(this, key, value);
				// Update the value or quit the function depending on the result
				if (typeof result !== "undefined") {
					// If result === null (special value) ignore the value
					if (result === null) {
						return;
					}
					value = result;
				}
			}
			// Support pending state
			Irform.queue(this, function() {
				if ($(this).hasClass("irform-container")) {
					Irform.set($(this).children(), value);
				}
				else if ($(this).is("input[type=checkbox]")) {
					$(this).prop("checked", value);
				}
				else {
					$(this).val(value);
				}
				$(this).trigger("change");
			});

			// Mark this element as proceed by removing it
			delete values[key];
			elementProcessed++;
		}
	});

	// If the value is not empty, it might mean that some of the values have not been proceed
	// in this case, re-iterate with the remaing values
	if (!jQuery.isEmptyObject(values) && elementProcessed)
	{
		Irform.set(selector, values, callback);
	}
}

/**
 * Get the data from a form. This is a static function.
 */
Irform.get = function (selector, callback) {
	var data = {};

	// Find direct elements only and remove anchors
	var list = $(selector).find("[name]").addBack("[name]").not("a").filter(function() {
		var nearestMatch = $(this).parent().closest("[name]");
		return nearestMatch.length == 0 || ($(selector).find(nearestMatch).length == 0 && $(selector).filter(nearestMatch).length == 0);
	});

	// Read their values
	$(list).each(function() {
		// Support the pending attribute
		if ($(this).hasClass("irform-pending")) {
			return;
		}
		var key = $(this).prop("name") || $(this).attr("name");
		// Set the new value
		if (key) {
			// Support containers and checkboxes
			var value = ($(this).hasClass("irform-container")) ?
					Irform.get($(this).children()) :
					($(this).is("input[type=checkbox]")) ?
					(($(this).is(":checked")) ? "selected" : "") : $(this).val();
			// Call the callback if any
			if (typeof callback === "function") {
				var result = callback.call(this, key, value);
				if (typeof result !== "undefined") {
					// If result === null (special value) ignore the value
					if (result === null) {
						return;
					}
					value = result;
				}
			}
			data[key] = value;
		}
	});

	return data;
}

/**
 * Update the jQuery val attribute
 */
Irform.jQueryHookVal = function (selector, readFct, writeFct) {
	// Override the val function to handle this element
	var originalVal = jQuery.fn.val;
	jQuery.fn.val = function(value) {
		// Read
		if (!arguments.length) {
			if ($(this).is(selector)) {
				return readFct.call(this);
			}
			// Callback the original function
			return originalVal.apply(this, arguments);
		}
		// Write
		// Make this variable local to pas it through the each function, seems to work only this way
		var v = value;
		$(this).each(function() {
			// Hack to make the variable visiable in this scope
			var value = v;
			if ($(this).is(selector)) {
				writeFct.call(this, value);
			}
			else {
				// Callback the original function
				originalVal.call($(this), value);
			}
		});
		return this;
	};
};

/**
 * Clear the form. This is a static function.
 */
Irform.clear = function (selector) {
	// Handle the irform array if any
	$(selector).find(".irform-array").trigger("array-empty");
	$(selector).find("[name]").val("").trigger("change");
};

/**
 * Check if a value is empty.
 * Objects or arrays are considered empty of all their members evaluates to empty.
 */
Irform.isEmpty = function (value) {
	if (typeof value == "object") {
		var empty = true;
		for (var i in value) {
			empty &= Irform.isEmpty(value[i]);
		}
		return empty;
	}
	return (value) ? false : true;
};