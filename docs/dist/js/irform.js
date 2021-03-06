/* irform.js (2018.05.14) by Blaise Lengrand\n */
!function(n){n.irRequire||(n.irRequire=function(t,i){return new Promise(function(e,r){n.irRequire.a(t,e,r,i||3e4)})},n.irRequire.a=function(functionName,resolve,reject,timeout){"string"==typeof functionName&&(functionName=[functionName]);var ready=1,poll=1;if(functionName.forEach(function(name){try{if(void 0===eval(name))throw 1;n.irRequire.h(name)}catch(e){ready=0;var m=irRequire.map;for(m[name]instanceof Array||(m[name]=m[name]?[m[name]]:[]);m[name].length;){var url=m[name].shift();if(m[url])return poll=0,irRequire(url,timeout).then(function(){irRequire.a(functionName,resolve,reject,timeout)});n.irRequire.h(name,url);var desc=0<=url.search(/\.css$/i)?["link","href",{rel:"stylesheet",type:"text/css"}]:["script","src",{type:"text/javascript",async:!0}],d=document;if(!d.querySelector(desc[0]+"["+desc[1]+'="'+url+'"]')){var elt=d.createElement(desc[0]);elt[desc[1]]=url,Object.assign(elt,desc[2]),elt.onerror=function(){reject(new Error("cannot load "+(elt.src||elt.href)))},d.getElementsByTagName("head")[0].appendChild(elt)}}}}),ready){var r=functionName.map(function(name){return eval(name)});resolve(1==r.length?r[0]:r)}else poll&&(0<timeout?setTimeout(function(){irRequire.a(functionName,resolve,reject,timeout-100)},100):reject(new Error(functionName.join()+" timed-out")))},n.irRequire.map={},n.irRequire.h=function(){})}(window);/**
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
	// Add the events
	this.events = {};
	// Call the hook
	this.options.hookInit.call(this);
	// Create the form
	this.create(container, formDescription);
	// Add event to the container
	var obj = this;
	this.container.on("focus", ".irform", function() {
		obj.trigger("focus", this);
	});
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
				class: "irform irform-switch",
				tabIndex: "0"
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
 * \brief Register an event
 *
 * \param id The identifier of the event
 * \param callback The function to be called when the event is triggered
 */
Irform.prototype.on = function (id, callback) {
	this.events.hasOwnProperty(id) || (this.events[id] = []);
	this.events[id].push(callback);
}

/**
 * \brief Trigger all events associated with a specific id
 *
 * \param id The identifier of the events to be triggered
 * \param ... Arguments to be passed to the event callbacks
 */
Irform.prototype.trigger = function (id) {
	var args = Array.prototype.slice.call(arguments, 1);
	for (var i in this.events[id]) {
		this.events[id][i].apply(this, args);
	}
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
};/**
 * \brief Notification module
 */
var Irnotify = function (message, options) {
	// Merge the options
	options = $.extend(true, {}, Irnotify.defaults, options);
	// Check if the notification container exists, if not create it
	var container = options.container;
	// Check if the id exists, if so delete it
	if (options.id) {
		Irnotify.delete(options.id, container);
	}
	var containerNotify = $(container).children(".irnotify");
	if (!containerNotify.length) {
		containerNotify = $("<div/>", {
			class: "irnotify"
		});
		$(container).prepend(containerNotify);
	}
	// Check if the sub container (for the type) is created
	if (options.group) {
		var containerGroup = $(containerNotify).children(".irnotify-group." + options.type);
		if (!containerGroup.length) {
			containerGroup = $("<div/>", {
				class: "irnotify-group " + options.type
			});
			$(containerNotify).prepend(containerGroup);
		}
		containerNotify = containerGroup;
	}
	// Create and add the entry
	var entry = $("<div/>", {
		class: "irnotify-entry " + options.type + ((options.id) ? " irnotify-id-" + options.id : "")
	});
	var msg = $("<div/>", {
		class: "message"
	});
	$(msg).html(message);
	$(entry).append(msg);
	if (options.delete) {
		var del = $("<div/>", {
			class: "delete"
		});
		$(del).html(options.delete);
		$(del).click(function() {
			Irnotify.delete(this);
		});
		$(entry).append(del);
	}
	$(containerNotify).append(entry);
	this.entry = entry;
};

/**
 * Delete the current notification
 */
Irnotify.prototype.delete = function() {
	Irnotify.delete(this.entry);
};

/**
 * Deletes an item previously created
 */
Irnotify.delete = function(item, container) {
	if (typeof item == "string") {
		item = $(container || "body").find((item == "*") ? "[class*=irnotify-id-]" : (".irnotify-id-" + item));
	}
	$(item).closest(".irnotify-entry").each(function() {
		var item = $(this);
		var parent = item.parent();
		item.remove();
		// Check if the group is empty
		if (parent.hasClass("irnotify-group") && !parent.children().length) {
			item = parent;
			parent = item.parent();
			item.remove();
		}
		if (parent.hasClass("irnotify") && !parent.children().length) {
			parent.remove();
		}
	});
};

/**
 * Default options for the notify module
 */
Irnotify.defaults = {
	/**
	 * Group all entries of the same type together
	 */
	group: false,
	/**
	 * An ID to identify the entry in the notification.
	 * An entry with the same ID can be displayed only once.
	 */
	id: null,
	/**
	 * If the delete button should be added
	 */
	delete: "<span class=\"icon-cross\"></span>",
	/**
	 * The type of notification to display. Can be:
	 * - info
	 * - error
	 * - success
	 * - warning
	 */
	type: "info",
	/**
	 * The container for this entry
	 */
	container: "body"
};
/**
 * Convert an element into an array that can be used in a form
 */
(function($) {
	/**
	 * \brief Here goes the brief of irformArray.
	 *
	 * \alias jQuery.irformArray
	 *
	 * \param {String|Array} [action] The action to be passed to the function. If the instance is not created,
	 * \a action can be an \see Array that will be considered as the \a options.
	 * Otherwise \a action must be a \see String with the following value:
	 * \li \b create - Creates the object and associate it to a selector. \code $("#test").irformArray("create"); \endcode
	 *
	 * \param {Array} [options] The options to be passed to the object during its creation.
	 * See \see $.fn.irformArray.defaults a the complete list.
	 *
	 * \return {jQuery}
	 */
	$.fn.irformArray = function(arg, data) {
		// This is the returned value
		var retval;
		// Go through each objects
		$(this).each(function() {
			retval = $().irformArray.x.call(this, arg, data);
		});
		// Make it chainable, or return the value if any
		return (typeof retval === "undefined") ? $(this) : retval;
	};

	/**
	 * This function handles a single object.
	 * \private
	 */
	$.fn.irformArray.x = function(arg/*, data*/) {
		// Load the default options
		var options = $.fn.irformArray.defaults;

		// --- Deal with the actions / options ---
		// Set the default action
		var action = "create";
		// Deal with the action argument if it has been set
		if (typeof arg === "string") {
			action = arg;
		}
		// If the module is already created and the action is not create, load its options
		if (action != "create" && $(this).data("irformArray")) {
			options = $(this).data("irformArray");
		}
		// If the first argument is an object, this means options have
		// been passed to the function. Merge them recursively with the
		// default options.
		if (typeof arg === "object") {
			options = $.extend(true, {}, options, arg);
		}
		// Store the options to the module
		$(this).data("irformArray", options);

		// Handle the different actions
		switch (action) {
		// Create action
		case "create":
			$.fn.irformArray.create.call(this);
			break;
		};
	};

	/**
	 * Delete an item from the array
	 */
	$.fn.irformArray.deleteItem = function(item) {
		// Do nothing if this element is disabled
		if ($(this).prop("disabled") === true) {
			return;
		}
		$(item).remove();
	}

	/**
	 * Move Up/Previous an item from the array
	 */
	$.fn.irformArray.moveItemUp = function(item) {
		// Do nothing if this element is disabled
		if ($(this).prop("disabled") === true) {
			return;
		}
		var prev = $(item).prev(".irform-array-item");
		if (prev.length) {
			$(item).detach();
			prev.before(item);
		}
	}

	/**
	 * Move Down/Next an item from the array
	 */
	$.fn.irformArray.moveItemDown = function(item) {
		// Do nothing if this element is disabled
		if ($(this).prop("disabled") === true) {
			return;
		}
		var next = $(item).next(".irform-array-item");
		if (next.length) {
			$(item).detach();
			next.after(item);
		}
	}

	// Drag specific
	var dragObject = null;

	// Attach event when element is dropped
	$(document).on("mouseup touchend", function(e) {
		if (dragObject) {
			e.stopPropagation();

			// Remove decoration classes
			$(dragObject.item).removeClass("irform-array-item-drag");
			$(dragObject.obj).addClass("irform-array-drag");

			// Move the element
			if ($(dragObject.placeholder).parents('html').length) {
				$(dragObject.item).detach();
				$(dragObject.placeholder).before(dragObject.item);
			}
			$(dragObject.placeholder).remove();

			// Disable dragging
			dragObject = false;
		}
	});

	// Helpers
	var getCoordinates = function(e) {
		if (e.originalEvent.touches && e.originalEvent.touches.length) {
			return {x: e.originalEvent.touches[0].pageX, y: e.originalEvent.touches[0].pageY};
		}
		return {x: e.pageX, y: e.pageY};
	};

	/**
	 * Add a new item
	 */
	$.fn.irformArray.add = function() {
		// The instance of the current object
		var obj = this;
		// Read the options
		var options = $(this).data("irformArray");

		var template = options.template;
		var item = $("<div>", {
			class: "irform-array-item"
		});
		if (options.inline) {
			$(item).addClass("inline");
			$(item).css("display", "inline-block");
		}

		// Delete button
		if (options.isDelete) {
			var del = $("<div>", {
				class: "irform-array-item-del"
			});
			$(del).html(options.delete)
			$(del).click(function() {
				$.fn.irformArray.deleteItem.call(obj, item);
			});
			$(item).append(del);
		}

		// Move (Up/Down) button
		if (options.isMove) {
			// Button Up
			var up = $("<div>", {
				class: "irform-array-item-up"
			});
			$(up).html(options.up);
			$(up).click(function() {
				$.fn.irformArray.moveItemUp.call(obj, item);
			});
			$(item).append(up);
			// Button Down
			var down = $("<div>", {
				class: "irform-array-item-down"
			});
			$(down).html(options.down);
			$(down).click(function() {
				$.fn.irformArray.moveItemDown.call(obj, item);
			});
			$(item).append(down);
		}

		var content = $("<div>", {
			class: "irform-array-item-content"
		});
		if (typeof template === "function") {
			$(content).html(template.call(obj, item));
		}
		else if (typeof template === "object") {
			new Irform(content, template);
		}
		else {
			$(content).html($(template).clone(true, true));
		}
		$(item).append(content);

		$(this).find(".irform-array-content:first").append(item);

		// Trigger the hook
		options.hookAdd.call(obj, item);
	}

	/**
	 * Add a new item
	 */
	$.fn.irformArray.clear = function() {
		$(this).find(".irform-array-content:first").empty();
	}

	$.fn.irformArray.create = function() {

		// The instanc eof the current object
		var obj = this;
		// Read the options
		var options = $(this).data("irformArray");

		// Container of the array
		$(obj).empty();
		$(obj).addClass("irform-array");
		$(obj).attr("name", options.name);

		// Create the content array
		var content = $("<div>", {
			class: "irform-array-content",
			style: (options.inline) ? "display:inline-block;" : ""
		});
		$(obj).append(content);

		// Enable dragging onliny within the boundaries of the array
		if (options.isDrag) {

			// Helpers
			var getCoordinates = function(e) {
				if (e.originalEvent.touches && e.originalEvent.touches.length) {
					return {x: e.originalEvent.touches[0].pageX, y: e.originalEvent.touches[0].pageY};
				}
				return {x: e.pageX, y: e.pageY};
			};

			$(content).on("mousemove touchmove", function(e) {
				if (dragObject) {
					var cursor = getCoordinates(e);

					if (dragObject.init) {

						// Create a placeholder element
						$(dragObject.placeholder).html("&nbsp;");
						$(dragObject.item).before(dragObject.placeholder);
						$(dragObject.item).addClass("irform-array-item-drag");
						$(obj).addClass("irform-array-drag");

						// Stop init
						dragObject.init = false;
					}

					// Move the item
					$(dragObject.item).css({
						left: cursor.x + dragObject.offsetX,
						top: cursor.y + dragObject.offsetY
					});

					// Change the placeholder
					{
						var eltList = document.elementsFromPoint(cursor.x - $(document).scrollLeft(), cursor.y - $(document).scrollTop());
						var i = eltList.indexOf(content.get(0));
						// The following element in the list must be the item
						if (i > 0 && eltList[i - 1].classList.contains("irform-array-item")) {
							// If this is not the placeholder
							if (!eltList[i - 1].classList.contains("irform-array-placeholder")) {
								// Detach the element from the DOM to reajust the DOM
								$(dragObject.placeholder).detach();

								// Look for the element where to insert the next placeholder
								var curItem = eltList[i - 1];
								do {
									if ($(curItem).offset().left <= cursor.x && $(curItem).offset().top <= cursor.y
											&& $(curItem).offset().left + $(curItem).outerWidth(true) >= cursor.x
											&& $(curItem).offset().top + $(curItem).outerHeight(true) >= cursor.y) {
										$(curItem).before(dragObject.placeholder);
										break;
									}
									curItem = $(curItem).next();
								} while ($(curItem).length);

								// Insert at the end if no position was identified
								if (!$(curItem).length) {
									$(obj).find(".irform-array-item:last").after(dragObject.placeholder);
								}

							}
						}
					}
				}
			});

			$(content).on("mousedown touchstart", options.dragHandleSelector, function(e) {
				e.stopPropagation();
				e.preventDefault();

				var cursor = getCoordinates(e);
				var item = $(this).closest(".irform-array-item");

				dragObject = {
					init: true,
					obj: obj,
					item: item,
					offsetX: $(item).offset().left - cursor.x - $(document).scrollLeft(),
					offsetY: $(item).offset().top - cursor.y - $(document).scrollTop(),
					placeholder: $("<div/>", {
						class: "irform-array-placeholder "  + $(item).attr("class"),
						style: "width: " + $(item).width() + "px; height: " + $(item).height() + "px; " + $(item).attr("style")
					})
				};
			});
		}

		// Set an event to add new items
		$(obj).on("array-add", function(e) {
			e.stopPropagation();
			$.fn.irformArray.add.call(obj);
		});

		// Set an event to clear all items
		$(obj).on("array-empty", function(e) {
			e.stopPropagation();
			$.fn.irformArray.clear.call(obj);
		});

		// Set the add button
		if (options.isAdd) {
			var add = $("<div>", {
				class: "irform-array-add",
				style: "display:inline-block;"
			});
			$(add).html(options.add);
			$(add).click(function() {
				// Do nothing if this element is disabled
				if ($(obj).prop("disabled") === true) {
					return;
				}
				$(obj).trigger("array-add");
			});
			$(obj).append(add);
		}

		// Set the custom element
		if (options.custom) {
			var custom = $("<div>", {
				style: "display:inline-block;"
			});
			$(custom).html(options.custom);
			$(obj).append(custom);
		}
	}

	/**
	 * \brief Default options, can be overwritten. These options are used to customize the object.
	 * Change default values:
	 * \code $().irformArray.defaults.theme = "aqua"; \endcode
	 * \type Array
	 */
	$.fn.irformArray.defaults = {
		/**
		 * The name of the element, this must be set
		 */
		name: null,
		/**
		 * The template to be used for the item
		 */
		template: "<input class=\"irform\" type=\"text\" name=\"text\" />",
		/**
		 * Display the element items inline
		 */
		inline: false,
		/**
		 * If the delete button should be implemented
		 */
		isDelete: true,
		/**
		 * If the add button should be implemented
		 */
		isAdd: true,
		/**
		 * If the Up and Down buttons should be implemented
		 */
		isMove: true,
		/**
		 * If the drag functionality to move items should be implemented
		 */
		isDrag: false,
		/**
		 * Select used to select the drag handle
		 */
		dragHandleSelector: ".irform-array-item",
		/**
		 * HTML to be used for the delete button
		 */
		delete: "<button class=\"irform dock-left\" type=\"button\"><span class=\"icon-cross\"></span></button>",
		/**
		 * HTML to be used for the add button
		 */
		add: "<button class=\"irform\" type=\"button\"><span class=\"icon-plus\"></span> Add</button>",
		/**
		 * HTML to be used for the up button
		 */
		up: "<button class=\"irform dock-right\" type=\"button\"><span class=\"icon-arrow-up\"></span></button>",
		/**
		 * HTML to be used for the down button
		 */
		down: "<button class=\"irform dock-left dock-right\" type=\"button\"><span class=\"icon-arrow-down\"></span></button>",
		/**
		 * HTML to be used for the custom element (no action is binded to it)
		 */
		custom: null,
		/**
		 * Hook called once an item has been added
		 * \param item
		 */
		hookAdd: function(/*item*/) {},
		/**
		 * Hook called once the element value is writen to it.
		 */
		hookValWrite: function(value) {
			return value;
		},
		/**
		 * Hook called once the element value is read.
		 */
		hookValRead: function(value) {
			return value;
		}
	};

})(jQuery);

// Hook to the jQuery.fn.val function
Irform.jQueryHookVal(".irform-array",
	/*readFct*/function() {
		var value = [];
		$(this).children(".irform-array-content:first").children(".irform-array-item").each(function(i) {
			value[i] = Irform.get(this);
		});
		var options = $(this).data("irformArray");
		return options.hookValRead.call(this, value);
	},
	/*writeFct*/function(value) {
		var options = $(this).data("irformArray");
		// Callback used to update the value if needed
		value = options.hookValWrite.call(this, value);
		$(this).trigger("array-empty");
		for (var i in value) {
			$(this).trigger("array-add");
			var selector = $(this).children(".irform-array-content:first").children(".irform-array-item:last");
			Irform.set(selector, value[i]);
		}
	}
);

// Add the module to Irform
Irform.defaultOptions.fields.array = function(name, options) {
	var div = $("<div>");
	$(div).irformArray({
		name: name,
		template: options.template
	});
	return div;
};
(function($) {
	/**
	 * \brief Preset for keyword module
	 *
	 * \alias jQuery.irformArrayTags
	 */
	$.fn.irformArrayTags = function(options) {
		$(this).irformArray($.extend(true, $.fn.irformArrayTags.defaults, options));
	};

	/**
	 * \brief Default options, can be overwritten. These options are used to customize the object.
	 * Change default values:
	 * \code $().irformArrayTags.defaults.theme = "aqua"; \endcode
	 * \type Array
	 */
	$.fn.irformArrayTags.defaults = {
		template: "<div>" +
						"<div class=\"irform-array-tags-edit irform inline\"></div>" +
						"<div class=\"irform-array-tags-tag irform border inline clickable\" style=\"display: none;\">" +
							"<div class=\"irform-array-item-text\"></div>" +
							"<div class=\"irform-array-item-del\" style=\"margin-left: 10px;\"><div class=\"icon-cross\"></div></div>" +
						"</div>" +
					"</div>",
		templateInput: "<input type=\"text\" class=\"irform inline\" name=\"keyword\"/>",
		isMove: false,
		isDelete: false,
		isDrag: true,
		isArray: false,
		dragHandleSelector: ".irform-array-item .irform-array-tags-tag > div:not(.irform-array-item-del)",
		inline: true,
		hookAdd: function(item) {

			var options = $(this).data("irformArray");

			// Set the edit tag
			var content = $(item).find(".irform-array-tags-edit:first");
			if (typeof options.templateInput === "object") {
				new Irform(content, options.templateInput);
			}
			else {
				content.html($(options.templateInput).clone(true, true));
			}

			var obj = this;
			var edit = $(item).find(".irform-array-tags-edit");
			var tag = $(item).find(".irform-array-tags-tag");
			$(item).find("input").on("blur", function() {
				var value = $(this).val();
				// If the value is empty, then delete the item
				if (!value) {
					$().irformArray.deleteItem.call(obj, item);
				}
				// Else hide the input and show the tag
				else {
					$(edit).hide();
					// Show and update the tag
					$(tag).find("div.irform-array-item-text").text(value);
					$(tag).show();
				}
			}).on("change", function() {
				$(this).trigger("blur");
			});

			$(tag).click(function() {
				// Do nothing if this element is disabled
				if ($(obj).prop("disabled") === true) {
					return;
				}
				// Once a new element is added, make sure all the others are in non-edit mode
				$(obj).find(".irform-array-item").not(item).find("input").trigger("blur");
				$(this).hide();
				// Show and update the tag
				$(edit).show();
			});

			// Allocate the various events
			$(item).find(".irform-array-item-del").click(function() {
				$().irformArray.deleteItem.call(obj, item);
			});

			// Once a new element is added, make sure all the others are in non-edit mode
			$(this).find(".irform-array-item").not(item).find("input").trigger("blur");
		},
		/**
		 * Hook called once the element value is writen to it.
		 */
		hookValWrite: function(value) {
			var options = $(this).data("irformArray");
			if (options.isArray) {
				return value.map(function(v) {
					return {keyword: (v || "").trim()};
				});
			}
			return value.split(",").map(function(v) {
				return {keyword: (v || "").trim()};
			});
		},
		/**
		 * Hook called once the element value is read.
		 */
		hookValRead: function(value) {
			var options = $(this).data("irformArray");
			if (options.isArray) {
				return value.map(function(v) { return v.keyword; });
			}
			return value.map(function(v) { return v.keyword; }).join(", ");
		}
	};
})(jQuery);

/* Add the module to Irform */
Irform.defaultOptions.fields.tags = function(name, options) {
	var div = $("<div>");
	div.irformArrayTags({
		name: name,
		templateInput: options.template,
		isArray: options.isArray,
		isDrag: options.isDrag
	});
	return div;
};
(function($) {
	/**
	 * \brief Preset for keyword module
	 *
	 * \alias jQuery.irformArrayImages
	 */
	$.fn.irformArrayImages = function(options) {
		var obj = this;
		$(this).irformArray($.extend(true, $.fn.irformArrayImages.defaults, {
			custom: $("<div/>").irformFile({
				showInput: false,
				hookSelect: function(preset, value) {
					$(obj).trigger("array-add");
					console.log(preset, value);
				}
			})
		}, options));
	};

	/**
	 * \brief Default options, can be overwritten. These options are used to customize the object.
	 * Change default values:
	 * \code $().irformArrayImages.defaults.theme = "aqua"; \endcode
	 * \type Array
	 */
	$.fn.irformArrayImages.defaults = {
		template: "<span class=\"irform-array-images irform\">" +
					"<span class=\"irform-array-images-del\"><span class=\"icon-cross\"></span></span>" +
					"<img />" +
					"<input name=\"img\" style=\"display: none;\" />" +
				"</span>",
		isMove: false,
		isDelete: false,
		isAdd: false,
		isDrag: true,
		dragHandleSelector: ".irform-array-item img",
		inline: true,
		hookAdd: function(item) {
			var obj = this;

			$(item).find("input").on("blur", function() {
				var value = $(this).val();
				// Update the source of the image
				$(item).find("img").attr("src", value);
			}).on("change", function() {
				$(this).trigger("blur");
			});

			// Allocate the various events
			$(item).find(".irform-array-images-del").click(function() {
				$().irformArray.deleteItem.call(obj, item);
			});
		},
		/**
		 * Hook called once the element value is writen to it.
		 */
		hookValWrite: function(value) {
			return value.map(function(v) {
				return {img: v.trim()};
			});
		},
		/**
		 * Hook called once the element value is read.
		 */
		hookValRead: function(value) {
			return value.map(function(v) {
				return v.img;
			});
		}
	};
})(jQuery);

/* Add the module to Irform */
Irform.defaultOptions.fields.images = function(name) {
	var div = $("<div>");
	div.irformArrayImages({name: name});
	return div;
};
/**
 * Convert an element into a file uploader, selector or anything to select a file or a link
 */
(function($) {
	/**
	 * \brief .\n
	 * 
	 * \alias jQuery.irformDropdown
	 *
	 * \param {String|Array} [action] The action to be passed to the function. If the instance is not created,
	 * \a action can be an \see Array that will be considered as the \a options.
	 * Otherwise \a action must be a \see String with the following value:
	 * \li \b create - Creates the object and associate it to a selector. \code $("#test").irformDropdown("create"); \endcode
	 *
	 * \param {Array} [options] The options to be passed to the object during its creation.
	 * See \see $.fn.irformDropdown.defaults a the complete list.
	 *
	 * \return {jQuery}
	 */
	$.fn.irformDropdown = function(arg, data) {
		/* This is the returned value */
		var retval;
		/* Go through each objects */
		$(this).each(function() {
			retval = $().irformDropdown.x.call(this, arg, data);
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
	$.fn.irformDropdown.x = function(arg) {
		/* Load the default options */
		var options = $.fn.irformDropdown.defaults;

		/* --- Deal with the actions / options --- */
		/* Set the default action */
		var action = "create";
		/* Deal with the action argument if it has been set */
		if (typeof arg === "string") {
			action = arg;
		}
		/* If the module is already created and the action is not create, load its options */
		if (action != "create" && $(this).data("irformDropdown")) {
			options = $(this).data("irformDropdown");
		}
		/* If the first argument is an object, this means options have
		 * been passed to the function. Merge them recursively with the
		 * default options.
		 */
		if (typeof arg === "object") {
			options = $.extend(true, {}, options, arg);
		}
		/* Store the options to the module */
		$(this).data("irformDropdown", options);

		/* Handle the different actions */
		switch (action) {
		/* Create action */
		case "create":
			$.fn.irformDropdown.create.call(this);
			break;
		};
	};

	// Globally hide the menu when clicked somewhere
	$(document).on("mousedown touchstart", function() {
		$(".irform-dropdown-menu").hide();
	});

	$.fn.irformDropdown.create = function() {
		// Read the options
		var options = $(this).data("irformDropdown");
		// Reference to the main object
		var obj = this;

		// Initialize the list
		$.fn.irformDropdown.setList.call(this, options.list);

		// Create the container
		var container = $("<div>", {
			class: "irform-dropdown"
		});
		var inputValue = $("<input>", {
			name: options.name,
			style: "display: none;"
		});
		$(container).append(inputValue);

		// Create the input field
		var input = $("<div>", {
			contenteditable: options.editable,
			tabindex: "0", // This is compatible with HTML5 and is a must to enable tabs on this element
			class: "irform " + ((options.selectMode) ? "irform-dropdown-select" : "irform-dropdown-input")
		});
		$(container).append(input);

		// Create the menu itself
		var menu = $("<div>", {
			class: "irform-dropdown-menu"
		});
		// Add onclick event
		$(menu).on("click", ".irform-dropdown-item", function() {
			$(input).html($(this).html());
			$(inputValue).val($(this).attr("data-value"));
			$(menu).hide();
		});
		$(menu).on("mousedown touchstart", function(e) {
			e.stopPropagation();
		});
		$(container).append(menu);

		// Add input onclick event to show the menu
		if (options.selectMode) {
			$(input).on("click", function(e) {
				$(this).trigger("input", true);
			});
		}

		// Update the value when the input change
		$(input).on("keyup paste cut", function() {
			$(inputValue).val($(this).text());
		});

		// Update the input when value change
		$(inputValue).on("change", function() {
			$(input).text($(this).val());
		});

		// Add events
		$(input).on("input", function(e, isClick) {

			var value = $(this).text();
			var ret = options.updateList.call(this, value);
			var action = function(list) {

				if (list) {
					$.fn.irformDropdown.setList.call(obj, list);
				}

				// Filter the data
				var matchList = [];
				var filter = value.toLowerCase();
				$(obj).data("irformDropdown-list").forEach(function(data) {
					var weight = (isClick) ? 1 : $.fn.irformDropdown.search(filter, data[0], options.minWeight);
					if (weight > 0) {
						matchList.push([weight, data[1], data[2]]);
					}
				});

				// Clear the whole list
				$(menu).empty().show();

				// Print the data
				matchList.sort(function(a, b) {
					return b[0] - a[0];
				}).slice(0, options.maxResults).forEach(function(data) {
					var item = $("<div>", {
						class: "irform-dropdown-item"
					});
					$(item).attr("data-value", data[1]);
					if (options.acceptHTML) {
						item.html(data[2]);
					}
					else {
						item.text(data[2])
					}
					$(menu).append(item);
				});
			};

			// Either process the promise or directly the result
			(ret instanceof Promise) ? ret.then(action).catch(console.error) : action(ret);
		});

		$(this).append(container);
	}

	$.fn.irformDropdown.search = function (word, sentence, minMatch) {

		var firstChar = word.charAt(0);
		if (!firstChar) {
			return 0;
		}
		var start = -1;

		var weight = 0;
		while ((start = sentence.indexOf(firstChar, start + 1)) != -1) {
			// If this is the first character of a word, add a weight to prioritize this word
			var curWeight = (!start) ? 1 : 0.9;
			var iSentence = start;
			// Check if the word is +/- 1 character far away
			for (var i = 1; i < word.length; ++i) {
				var c = word.charAt(i);
				if (sentence.charAt(iSentence + 1) == c) {
					curWeight += 1;
					iSentence += 1;
				}
				else if (sentence.charAt(iSentence + 2) == c) {
					curWeight += 0.5;
					iSentence += 2;
				}
				else if (sentence.charAt(iSentence - 1) == c) {
					curWeight += 0.5;
				}
				else {
					++iSentence;
				}
			}

			weight = Math.max(weight, curWeight);
		}

		// Normalize the result and make the result exponential to add importance on full matches
		weight /= word.length;

		return (!minMatch || weight > minMatch) ? weight : 0;
	}

	/**
	 * \brief Set a filter on the list
	 */
	$.fn.irformDropdown.setList = function(list) {
		var options = $(this).data("irformDropdown");
		var toValue = (options.acceptHTML) ? function(a) { return $("<span/>").html(a).text() } : function(a) { return a };

		var updatedList = [];
		if (list instanceof Array) {
			list.forEach(function(item) {
				var value = toValue(item);
				// search value, value, display value
				updatedList.push([value.toLowerCase(), value, item]);
			});
		}
		else {
			for (var value in list) {
				updatedList.push([toValue(list[value]).toLowerCase(), value, list[value]]);
			}
		}
		$(this).data("irformDropdown-list", updatedList);
	};

	/**
	 * \brief Default options, can be overwritten. These options are used to customize the object.
	 * Change default values:
	 * \code $().irformDropdown.defaults.theme = "aqua"; \endcode
	 * \type Array
	 */
	$.fn.irformDropdown.defaults = {
		/**
		 * The name of the element, this must be set
		 */
		name: "dropdown",
		/**
		 * Make the field freely editable
		 */
		editable: true,
		/**
		 * For the fuzzy search, the minimum weight to which the items must match
		 */
		minWeight: 0.6,
		/**
		 * The maximum number of results to be shown
		 */
		maxResults: 10,
		/**
		 * Make it like a select box, hence when the user clicks on the field,
		 * it will show the dropdown list
		 */
		selectMode: true,
		/**
		 * Set to true, if the input should be considered as plain HTML. False if it
		 * should be considered as text.
		 */
		acceptHTML: false,
		/**
		 * Callback for loading data on the fly
		 */
		updateList: function(value) {},
		/**
		 * Set this value to set the initial content
		 */
		list: []
	};

})(jQuery);

/* Add the module to Irform */
Irform.defaultOptions.fields.dropdown = function(name, options) {
	var div = $("<div>");
	var o = {name: name, list: options.list};
	if (typeof options["options"] === "object") {
		o = $.extend(true, o, options["options"]);
	}
	$(div).irformDropdown(o);
	return div;
};
/**
 * jQuery Module Template
 *
 * This template is used for jQuery modules.
 *
 */

(function($) {
	/**
	 * \brief .\n
	 * Auto-load the irformCustom modules for the tags with a data-irformCustom field.\n
	 * 
	 * \alias jQuery.irformCustom
	 *
	 * \param {String|Array} [action] The action to be passed to the function. If the instance is not created,
	 * \a action can be an \see Array that will be considered as the \a options.
	 * Otherwise \a action must be a \see String with the following value:
	 * \li \b create - Creates the object and associate it to a selector. \code $("#test").irformCustom("create"); \endcode
	 *
	 * \param {Array} [options] The options to be passed to the object during its creation.
	 * See \see $.fn.irformCustom.defaults a the complete list.
	 *
	 * \return {jQuery}
	 */
	$.fn.irformCustom = function(arg, data) {
		var retval;
		// Go through each objects
		$(this).each(function() {
			retval = $().irformCustom.x.call(this, arg, data);
		});
		// Make it chainable, or return the value if any
		return (typeof retval === "undefined") ? $(this) : retval;
	};

	/**
	 * This function handles a single object.
	 * \private
	 */
	$.fn.irformCustom.x = function(arg, data) {
		// Load the default options
		var options = $.fn.irformCustom.defaults;

		// --- Deal with the actions / options ---
		// Set the default action
		var action = "create";
		// Deal with the action argument if it has been set
		if (typeof arg === "string") {
			action = arg;
		}
		// If the module is already created and the action is not create, load its options
		if (action != "create" && $(this).data("irformCustom")) {
			options = $(this).data("irformCustom");
		}
		// If the first argument is an object, this means options have
		// been passed to the function. Merge them recursively with the
		// default options.
		if (typeof arg === "object" || action == "create") {
			options = $.extend(true, {}, options, arg);
		}
		// Store the options to the module
		$(this).data("irformCustom", options);

		// Handle the different actions
		switch (action) {
		// Create action
		case "create":
			$.fn.irformCustom.create.call(this);
			break;
		};
	};

	$.fn.irformCustom.create = function() {
		$(this).addClass("irform irform-custom");
		$(this).html("&nbsp;");
	};

	/**
	 * \brief Default options, can be overwritten. These options are used to customize the object.
	 * Change default values:
	 * \code $().irformCustom.defaults.theme = "aqua"; \endcode
	 * \type Array
	 */
	$.fn.irformCustom.defaults = {
		value: null,
		/**
		 * Hook called once the element value is writen to it.
		 */
		hookValWrite: function(value) {
			return [value, value];
		},
		/**
		 * Hook called once the element value is read.
		 */
		hookValRead: function(value) {
			return value;
		}
	};

})(jQuery);

// Hook to the jQuery.fn.val function
Irform.jQueryHookVal(".irform-custom",
	/*readFct*/function() {
		var options = $(this).data("irformCustom");
		return options.hookValRead.call(this, options.value);
	},
	/*writeFct*/function(value) {
		var options = $(this).data("irformCustom");
		var values = options.hookValWrite.call(this, value);
		options.value = values[0];
		$(this).data("irformCustom", options);
		$(this).html(values[1]);
	}
);
/**
 * Convert an element into an array that can be used in a form
 */
(function($) {
	/**
	 * \brief Support tinymce API v4.3 and above\n
	 * 
	 * \alias jQuery.irformTinymce
	 *
	 * \param {String|Array} [action] The action to be passed to the function. If the instance is not created,
	 * \a action can be an \see Array that will be considered as the \a options.
	 * Otherwise \a action must be a \see String with the following value:
	 * \li \b create - Creates the object and associate it to a selector. \code $("#test").irformTinymce("create"); \endcode
	 *
	 * \param {Array} [options] The options to be passed to the object during its creation.
	 * See \see $.fn.irformTinymce.defaults a the complete list.
	 *
	 * \return {jQuery}
	 */
	$.fn.irformTinymce = function(arg, data) {
		/* This is the returned value */
		var retval;
		/* Go through each objects */
		$(this).each(function() {
			retval = $().irformTinymce.x.call(this, arg, data);
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
	$.fn.irformTinymce.x = function(arg/*, data*/) {
		/* Load the default options */
		var options = $.fn.irformTinymce.defaults;

		/* --- Deal with the actions / options --- */
		/* Set the default action */
		var action = "create";
		/* Deal with the action argument if it has been set */
		if (typeof arg === "string") {
			action = arg;
		}
		/* If the module is already created and the action is not create, load its options */
		if (action != "create" && $(this).data("irformTinymce")) {
			options = $(this).data("irformTinymce");
		}
		/* If the first argument is an object, this means options have
		 * been passed to the function. Merge them recursively with the
		 * default options.
		 */
		if (typeof arg === "object") {
			options = $.extend(true, {}, options, arg);
		}
		/* Store the options to the module */
		$(this).data("irformTinymce", options);

		/* Handle the different actions */
		switch (action) {
		/* Create action */
		case "create":
			$.fn.irformTinymce.create.call(this);
			break;
		};
	};

	$.fn.irformTinymce.create = function() {

		/* Id counter, need to be initialized as a static value */
		if (typeof $.fn.irformTinymce.create.id === "undefined") {
			$.fn.irformTinymce.create.id = 0;
		}

		/* The instance of the current object */
		var obj = this;
		/* Read the options */
		var options = $(this).data("irformTinymce");
		/* Add the class */
		$(this).addClass("irform-tinymce irform-pending");
		$(this).attr("name", options.name);

		/* Generate an id if it does not exists */
		if (!$(this).attr("id")) {
			$(this).attr("id", "irform-tinymce-id" + ($.fn.irformTinymce.create.id++));
		}

		// Update the options
		var tinymce_o = $.extend(true, {
			selector: "#" + $(this).attr("id"),
			// Do not convert URLs
			convert_urls: false,
			// To support the custom browser function (field_name, url, type, win)
			file_browser_callback: function (field_name, url, type) {
				/* Call the browser */
				options.callbackBrowser.call(obj, type, function(path) {
					$("#" + field_name).val(path);
				});
			},
			// Call this function once the editor is ready
			init_instance_callback: function() {
				// Call the callback to tell that the editor is ready
				options.callbackIsReady.call(obj);
			},
			setup : function(editor) {
				editor.on('change', function() {
					$(obj).trigger("change");
				});
			}
		}, options.tinymce);

		/* Set the disable and enable events */
		$(this).on("disable", function() {
			tinyMCE.get($(this).prop("id")).setMode("readonly");
		});
		$(this).on("enable", function() {
			tinyMCE.get($(this).prop("id")).setMode("design");
		});

		/* Add the CSS file and class if any */
		if (options.css) {
			tinymce_o["content_css"] = options.css;
		}
		if (options.cssClass) {
			tinymce_o["body_class"] = options.cssClass;
		}

		/* If the document has a base path */
		if (options.baseURL) {
			tinymce_o.document_base_url = options.baseURL;
		}
		/* Set the base URL */
		if (options.tinymceBase) {
			tinymce.baseURL = options.tinymceBase;
		}
		
		/* Hack to let tinymce look for the minimzed versions of the plugin */
		tinymce.suffix = ".min";
		/* creates the module */
		setTimeout(function() {
			tinymce.init(tinymce_o);
		}, 100);
	}

	/**
	 * \brief Default options, can be overwritten. These options are used to customize the object.
	 * Change default values:
	 * \code $().irformTinymce.defaults.theme = "aqua"; \endcode
	 * \type Array
	 */
	$.fn.irformTinymce.defaults = {
		/**
		 * The name of the element, this must be set
		 */
		name: null,
		/**
		 * Base directory where tinymce is located
		 */
		tinymceBase: null,
		/**
		 * Applies a base URL to the editor, so that ressources (images...) will be relative to this URL.
		 */
		baseURL: null,
		/**
		 * A path to a CSS file that will be used for the style sheet of the document
		 */
		css: null,
		/**
		 * The CSS class that will be used for the style sheet of the document
		 */
		cssClass: null,
		/**
		 * Callback to tell notfity once the editor is ready
		 */
		callbackIsReady: function() {},
		/**
		 * Callback browser.
		 * \param type can be file, image or flash
		 * \param callback the function to be called once the value is available. This function takes into argument
		 * the path
		 */
		callbackBrowser: function() {},
		/**
		 * Default options to be passed to tinymce
		 */
		tinymce: {
			/* Hide the menu bar */
			menubar: false,
			statusbar: false,
			autoresize_max_height: ($(window).innerHeight() - 100), //< For the toolbar
			toolbar: "undo redo | styleselect | bold italic | forecolor | removeformat | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media table | code | fullscreen",
			plugins: [ "advlist autolink autoresize link image lists charmap print preview hr anchor pagebreak spellchecker",
				"searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking",
				"save table contextmenu directionality emoticons template paste textcolor"
			]
		}
	};
})(jQuery);

// Hook to the jQuery.fn.val function
Irform.jQueryHookVal(".irform-tinymce",
	/*readFct*/function() {
		return tinyMCE.get($(this).prop("id")).getContent();
	},
	/*writeFct*/function(value) {
		return tinyMCE.get($(this).prop("id")).setContent(value);
	}
);

/* Add the module to Irform */
Irform.defaultOptions.fields.htmleditor = function(name, options, callback) {
	var div = $("<div>");
	$(div).irformTinymce($.extend(true, {}, {
		name: name,
		callbackIsReady: function() {
			callback.call(this);
		}
	}, options["options"]));
	return div;
};
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
(function($) {
	/**
	 * \brief .\n
	 * 
	 * \alias jQuery.irformModal
	 *
	 * \param {String|Array} [action] The action to be passed to the function. If the instance is not created,
	 * \a action can be an \see Array that will be considered as the \a options.
	 * Otherwise \a action must be a \see String with the following value:
	 * \li \b create - Creates the object and associate it to a selector. \code $("#test").irformModal("create"); \endcode
	 *
	 * \param {Array} [options] The options to be passed to the object during its creation.
	 * See \see $.fn.irformModal.defaults a the complete list.
	 *
	 * \return {jQuery}
	 */
	$.fn.irformModal = function(arg, data) {
		/* This is the returned value */
		var retval;
		/* Go through each objects */
		$(this).each(function() {
			retval = $().irformModal.x.call(this, arg, data);
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
	$.fn.irformModal.x = function(arg) {
		/* Load the default options */
		var options = $.fn.irformModal.defaults;

		/* --- Deal with the actions / options --- */
		/* Set the default action */
		var action = "create";
		/* Deal with the action argument if it has been set */
		if (typeof arg === "string") {
			action = arg;
		}
		/* If the module is already created and the action is not create, load its options */
		if (action != "create" && $(this).data("irformModal")) {
			options = $(this).data("irformModal");
		}
		/* If the first argument is an object, this means options have
		 * been passed to the function. Merge them recursively with the
		 * default options.
		 */
		if (typeof arg === "object") {
			options = $.extend(true, {}, options, arg);
		}
		/* Store the options to the module */
		$(this).data("irformModal", options);

		/* Handle the different actions */
		switch (action) {
		/* Create action */
		case "create":
			$.fn.irformModal.create.call(this);
			break;
		case "close":
			$.fn.irformModal.close.call(this);
			break;
		};
	};

	/**
	 * \brief Default options, can be overwritten.
	 */
	$.fn.irformModal.defaults = {
		/**
		 * \brief Default z-index
		 */
		zIndex: 99999,
		/**
		 * \brief Enable feature to close the window when click outise
		 */
		closeOnClickOutside: true,
		/**
		 * If the add button should be implemented
		 */
		isCancel: false,
		/**
		 * \brief Callback to be called once the user validates the modal
		 */
		onValidate: null,
		/**
		 * HTML to be used for the validate button
		 */
		validate: "<button class=\"irform\" type=\"button\"><span class=\"icon-check\"></span>&nbsp;Validate</button>",
		/**
		 * HTML to be used for the cancel button
		 */
		cancel: "<button class=\"irform\" type=\"button\"><span class=\"icon-cross\"></span>&nbsp;Cancel</button>",
	};

	$.fn.irformModal.create = function() {
		// Options of the current irformModal
		var obj = this;
		var options = $(this).data("irformModal");

		var modal = $("<div>", {
			class: "irform-modal-container"
		});

		var content = $("<div>", {
			class: "irform-modal-content"
		});
		$(content).append(this);
		$(modal).append(content);

		// Add controls
		var control = $("<div>", {
			class: "irform-modal-control"
		});

		// Cancel button
		if (options.isCancel) {
			var cancel = $("<span>");
			$(cancel).html(options.cancel);
			$(cancel).click(function() {
				$.fn.irformModal.close.call(obj);
			});
			$(control).append(cancel);
		}

		// Validate button
		if (options.onValidate) {
			var validate = $("<span>");
			$(validate).html(options.validate);
			$(validate).click(function() {
				var options = $(obj).data("irformModal");
				options.onValidate.call(obj);
				$.fn.irformModal.close.call(obj);
			});
			$(control).append(validate);
		}

		$(modal).append(control);

		var container = $("<div>", {
			class: "irform-modal"
		});
		$(container).css({
			top: 0,
			left: 0,
			width: "100%",
			height: "100%",
			position: "fixed",
			zIndex: options.zIndex
		});
		$(container).append(modal);

		// Save the container instance
		options.container = container;
		options.overflow = $("body").css("overflow");
		$(this).data("irformModal", options);

		// Remove the element on click
		if (options.closeOnClickOutside) {
			$(container).data("irformModal", 0);
			$(container).mousedown(function(e) {
				$(this).data("irformModal", e);
			}).mouseup(function(e) {
				var prevE = $(this).data("irformModal");
				if (prevE && Math.abs(prevE.pageX - e.pageX) < 5 && Math.abs(prevE.pageY - e.pageY) < 5) {
					e.preventDefault();
					$.fn.irformModal.close.call(obj);
				}
				$(this).data("irformModal", 0);
			});
			// To make sure the events are not considered on the modal
			$(modal).mousedown(function(e) {
				e.stopPropagation();
				return false;
			}).mouseup(function(e) {
				e.stopPropagation();
				return false;
			});
		}

		// Append the modal
		$("body").append(container);
		$("body").css("overflow", "hidden");
	};

	/**
	 * This function closes the dialog
	 */
	$.fn.irformModal.close = function() {
		// Options of the current irformModal
		var options = $(this).data("irformModal");
		$(options.container).remove();
		$("body").css("overflow", options.overflow);
	}

})(jQuery);
