/**
 * This file handles forms in general. It adds the ability to read form values dynamically and
 * adds multi form functionality (i.e. being able to have arrays in form).
 *
 * When create a new element that can work with Irform, the following methods/events should be implemented 
 * and attached to the tag with the "name" attribute. 
 * - Methods:
 *   - val: Sets or get the value of/from the element
 * - Events
 *   - change: to enable validation on value changed and sub element dynamic creation
 */

/**
 * \brief Irform class, use to manipulate forms and create
 * \param [options] Options to be passed to the form, see \ref Irform.defaultOptions for more details.
 */
var Irform = function (container, formDescription, options) {
	this.container = container;
	this.formDescription = formDescription;
	this.options = $.extend(true, {}, Irform.defaultOptions, options);
	/* Empty the container first */
	$(this.container).empty();
	/* Create the form */
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
 * \brief Validates upper case charaters only
 */
Irform.CHAR_UPPERCASE_ONLY = 0x10;
/**
 * \brief Validates lower case characters only
 */
Irform.CHAR_LOWERCASE_ONLY = 0x20;
/**
 * \brief Validates emails
 */
Irform.EMAIL = "^[A-Za-z0-9\._%\+\-]+@[A-Za-z0-9\.\-]+\.[a-zA-Z]{2,}$";
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
			var input = document.createElement("input");
			$(input).prop("type", "text");
			$(input).prop("name", name);
			$(input).addClass("irform");
			if (typeof options.placeholder === "string") {
				$(input).prop("placeholder", options.placeholder);
			}
			return input;
		},
		password: function(name, options) {
			var input = document.createElement("input");
			$(input).prop("type", "password");
			$(input).prop("name", name);
			$(input).addClass("irform");
			if (typeof options.placeholder === "string") {
				$(input).prop("placeholder", options.placeholder);
			}
			return input;
		},
		textarea: function(name, options) {
			var textarea = document.createElement("textarea");
			$(textarea).prop("name", name);
			$(textarea).addClass("irform");
			if (typeof options.placeholder === "string") {
				$(textarea).prop("placeholder", options.placeholder);
			}
			return textarea;
		},
		submit: function(name, options) {
			var button = document.createElement("button");
			$(button).prop("type", "submit");
			$(button).prop("name", name);
			$(button).addClass("irform");
			$(button).text((typeof options.value === "string") ? options.value : "Submit");	
			var obj = this;
			$(button).click(function() {
				var values = obj.get();
				if (values !== false && typeof options.callback === "string") {
					options.callback.call(obj, values);
				}
			});
			return button;
		},
		select: function(name, options) {
			var select = document.createElement("select");
			$(select).prop("name", name);
			$(select).addClass("irform");
			for (var name in options["select"]) {
				var opt = document.createElement("option");
				$(opt).text(options["select"][name]);
				$(opt).prop("value", name);
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
	 */
	wrapper: function(elt, options, name) {
		var wrapper = document.createElement("div");
		var div = document.createElement("div");
		$(div).addClass("irform-caption");
		$(div).text(options.caption);
		var value = document.createElement("div");
		$(value).addClass("irform-elements");
		$(value).append(elt);
		$(wrapper).append(div);
		$(wrapper).append(value);
		return wrapper;
	},
	/**
	 * This function will be called in case of error (validation, missing value)
	 */
	callbackError: function(errorList) {
		var msg = "";
		// Clean previous error
		$(this.container).find(".irform-item.error").removeClass("error");
		for (var i in errorList) {
			// Set error
			$(errorList[i]["item"]).removeClass("success").addClass("error");
			switch (errorList[i]["type"]) {
			case "required":
				msg += "'" + errorList[i]["name"] + "' is required\n";
				break;
			case "validation":
				msg += "'" + errorList[i]["name"] + "' does not validate\n";
				break;
			}
		}
		alert(msg);
	},
	/**
	 * Called once an item has been validated successfully
	 */
	callbackSuccess: function(item, name) {
		$(item).removeClass("error").addClass("success");
	},
	/**
	 * Called once an item needs to be disabled
	 */
	disable: function(isDisabled, elt) {
		var item = Irform.findNameHolder(elt);
		$(item).find("input,textarea,select,button").add(item).prop("disabled", isDisabled);
		$(elt).find("input,textarea,select,button").filter(".irform").prop("disabled", isDisabled);
		if (isDisabled) {
			$(elt).addClass("disable");
		}
		else {
			$(elt).removeClass("disable");
		}
		Irform.queue(item, function() {
			$(item).trigger((isDisabled) ? "disable" : "enable");
		});
	}
};

Irform.validate = function (presets, value) {
	if (typeof value === "string") {
		/* Check if the upper case condition is set */
		if (presets & Irform.CHAR_UPPERCASE_ONLY && value.test(/[a-z]/g)) {
			return false;
		}
		/* Check if the lower case condition is set */
		if (presets & Irform.CHAR_LOWERCASE_ONLY && value.test(/[A-Z]/g)) {
			return false;
		}
		/* Replace all a-z characters regardless of the case */
		if (presets & Irform.CHAR_A_Z) {
			value = value.replace(/[a-z]/ig, "");
		}
		/* Replace all numbers */
		if (presets & Irform.CHAR_0_9) {
			value = value.replace(/[0-9]/g, "");
		}
		/* Replace all spaces */
		if (presets & Irform.CHAR_SPACE) {
			value = value.replace(/[ ]/g, "");
		}
		/* Replace all special characters */
		if (presets & Irform.CHAR_SPECIAL) {
			value = value.replace(/[!"#\$%&'\(\)\*\+,\-\.\/:;<=>\?@\[\\\]^_`\{\|\}~]/g, "");
		}
		return (value === "") ? true : false;
	}
	return true;
}

/**
 * This function find the name holder element from a parent element
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
		/* Save as local to pass it through callbacks */
		var obj = this;
		var itemOptions = $.extend({
			name: "irform" + (Irform.unique++),
			type: this.options.defaultType,
			required: false,
			validate: null,
			disabled: false,
			// By default set item with a name set automatically as ignored
			ignore: (typeof formDescription[i].name === "undefined") ? true : false,
			options: {}
		}, formDescription[i]);
		// Read the name
		var itemName = itemOptions.name;
		// Assign everything back, this must be done due to the automatically generated name
		formDescription[i] = itemOptions;
		/* Generate the element */
		var type = itemOptions["type"];
		if (typeof this.options.fields[type] !== "function") {
			console.log("'" + type + "' is not supported");
			continue;
		}
		var containerItem = this.options.fields[type].call(this, itemName, itemOptions, function() {
			/* Remove the pending tag and execute all the pending items in the queue */
			$(this).removeClass("irform-pending");
			Irform.queue(this);
		});
		var nameHolder = Irform.findNameHolder(containerItem, itemName);
		/* Define the on-change function */
		$(nameHolder).on("change", function() {
			var value = $(this).val();
			var item = $(this).parents(".irform-item:first");
			var itemOptions = $(item).data("irform");
			var name = $(this).prop("name");
			/* If there is a validate condition */
			if (value && itemOptions.validate) {
				if (obj.validate(item, value)) {
					obj.options.callbackSuccess.call(obj, item, name);
				}
				else {
					obj.options.callbackError.call(obj, [{type: "validation", item: item, name: name, options: itemOptions}]);
				}
			}
			/* Validate also if the item is required and the value is non-empty */
			else if (value && $(item).hasClass("required")) {
				obj.options.callbackSuccess.call(obj, item, name);
			}
			/* If there is no onchange, mean there is no extra form */
			if (typeof itemOptions.onchange !== "object") {
				return;
			}
			/* Delete all the sub entry from this */
			if ($(this).data("nextElement")) {
				$(item).nextUntil($(this).data("nextElement")).remove();
			}
			/* Save the value of the next element */
			$(this).data("nextElement", $(item).next());
			/* Then add a new element */
			if (typeof itemOptions.onchange[value] === "object") {
				obj.create(item, itemOptions.onchange[value]);
			}
			else if (typeof itemOptions.onchange["__default__"] === "object") {
				obj.create(item, itemOptions.onchange["__default__"]);
			}
		});
		/* Insert the wrapper */
		var item = this.options.wrapper.call(this, containerItem, itemOptions, itemName);
		$(item).addClass("irform-item");
		/* Associate the name of the element with the element */
		$(item).attr("data-irform", itemName);
		/* Check if it has to be set has required */
		if (itemOptions.required) {
			$(item).addClass("required");
		}
		/* Set flags if needed */
		if (itemOptions.disabled) {
			Irform.queue(nameHolder, function() {
				obj.options.disable.call(obj, true, $(this).parents(".irform-item:first"));
			});
		}
		/* Save data to this element */
		$(item).data("irform", itemOptions);
		/* Paste it on the DOM */
		($(container).hasClass("irform-item")) ? $(container).after(item) : $(container).append(item);
	}

	/* Trigger change to all items */
	for (var i in formDescription) {
		var itemName = formDescription[i].name;
		/* Check the element */
		var nameHolder = Irform.findNameHolder(container, itemName);
		/* Trigger a value change to add new items if needed */
		Irform.queue(nameHolder, function() {
			$(this).trigger("change");
		});
	}
};

/**
 * Disable all elements of the form
 */
Irform.prototype.disable = function () {
	var obj = this;
	var disable_fct = this.options.disable;
	this.each(function(item) {
		disable_fct.call(this, true, item);
	});
};

/**
 * Enable all elements of the form
 */
Irform.prototype.enable = function () {
	var obj = this;
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
	$(this.container).empty();
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
	/* Called the function to test the validation */
	if (typeof data.validate === "number") {
		return Irform.validate(data.validate, value);
	}
	else if (typeof data.validate === "string") {
		var re = new RegExp(data.validate, "g");
		return re.test(value);
	}
	else if (typeof data.validate === "function") {
		return data.validate.call(this, value, item);
	}
	/* By default the validation passed */
	return true;
};

/**
 * Loop through all items displayed on the current form
 */
Irform.prototype.each = function (callback) {
	var obj = this;
	$(this.container).find(".irform-item").each(function() {
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
	/* This option will force the reading of values */
	if (typeof force === "undefined") {
		force = false;
	}
	/* Generate the selection */
	var selector = $();
	this.each(function(item) {
		selector = selector.add($("[name=" + $(item).attr("data-irform") + "]"));
	});
	var result = Irform.get(selector, function (key, value) {
		var item = $(this).parents(".irform-item:first");
		var data = item.data("irform");
		if (force) {
			return;
		}
		/* If this attribute needs to be ignored */
		if (data.ignore) {
			return null;
		}
		/* If this is a required element with an empty value */
		if (!value && data.required) {
			errorList.push({type: "required", item: item, name: key, options: data});
			isError = true;
		}
		/* If this element needs to be validated */
		if (data.validate && !obj.validate(item, value)) {
			errorList.push({type: "validation", item: item, name: key, options: data});
			isError = true;
		}
		/* If there is a callback */
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
		Irform.set(this.container, values, function(key, value) {
			/* This value has already been set, continue */
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
	/* Add an item to the queue or execute it */
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
	/* Execute the items from the queue */
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

	/* Find direct elements only */
	var list = $(selector).find("[name]").addBack("[name]").not("a").filter(function() {
		var nearestMatch = $(this).parent().closest("[name]");
		return nearestMatch.length == 0 || ($(selector).find(nearestMatch).length == 0 && $(selector).filter(nearestMatch).length == 0);
	});

	/* Set their values */
	$(list).each(function() {
		var key = $(this).prop("name") || $(this).attr("name");
		if (typeof values[key] !== "undefined") {
			var value = values[key];
			if (typeof callback === "function") {
				var result = callback.call(this, key, value);
				/* Update the value or quit the function depending on the result */
				if (typeof result !== "undefined") {
					/* If result === null (special value) ignore the value */
					if (result === null) {
						return;
					}
					value = result;
				}
			}
			/* Support pending state */
			Irform.queue(this, function() {
				$(this).val(value);
				$(this).trigger("change");
			});
		}
	});
}

/**
 * Get the data from a form. This is a static function.
 */
Irform.get = function (selector, callback) {
	var data = {};

	/* Find direct elements only and remove anchors */
	var list = $(selector).find("[name]").addBack("[name]").not("a").filter(function() {
		var nearestMatch = $(this).parent().closest("[name]");
		return nearestMatch.length == 0 || ($(selector).find(nearestMatch).length == 0 && $(selector).filter(nearestMatch).length == 0);
	});

	/* Read their values */
	$(list).each(function() {
		/* Support the pending attribute */
		if ($(this).hasClass("irform-pending")) {
			return;
		}
		var key = $(this).prop("name") || $(this).attr("name");
		/* Set the new value */
		if (key) {
			var value = $(this).val();
			if (typeof callback === "function") {
				var result = callback.call(this, key, value);
				if (typeof result !== "undefined") {
					/* If result === null (special value) ignore the value */
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
 * Clear the form. This is a static function.
 */
Irform.clear = function (selector) {
	/* Handle the irform array if any */
	$(selector).find(".irform-array").trigger("array-empty");
	$(selector).find("[name]").val("").trigger("change");
};
