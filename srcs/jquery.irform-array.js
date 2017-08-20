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

	/**
	 * Add a new item
	 */
	$.fn.irformArray.add = function() {
		// The instanc eof the current object
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