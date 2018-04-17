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
			class: ((options.selectMode) ? "irform-dropdown-select" : "irform-dropdown-input")
		});
		$(container).append(input);

		$(input).on("blur keyup paste copy cut mouseup change", function() {
			$(inputValue).val($(this).text());
		});

		var menu = $("<div>", {
			class: "irform-dropdown-menu"
		});
		// Add onclick event
		$(menu).on("click", ".irform-dropdown-item", function() {
			$(input).text($(this).text()).trigger("change");
			$(menu).hide();
		});
		$(container).append(menu);

		// Add input onclick event to show the menu
		if (options.selectMode) {
			$(input).on("click", function() {
				$(menu).empty().show();
				$(obj).data("irformDropdown-list").forEach(function(data) {
					var item = $("<div>", {
						class: "irform-dropdown-item"
					});
					item.text(data[0]);
					$(menu).append(item);
				});
			});
		}

		// Add events
		$(input).on("input", function() {

			var value = $(this).text();
			var ret = options.updateList.call(this, value);
			var action = function(list) {

				if (list && list instanceof Array) {
					$.fn.irformDropdown.setList.call(obj, list);
				}

				// Filter the data
				var matchList = [];
				var filter = value.toLowerCase();
				$(obj).data("irformDropdown-list").forEach(function(data) {
					var weight = $.fn.irformDropdown.search(filter, data[1], options.minWeight);
					if (weight > 0) {
						matchList.push([weight, data[0]]);
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
					item.text(data[1]);
					$(menu).append(item);
				});
			};

			// Either process the promise or directly the result
			(ret instanceof Promise) ? ret.then(action) : action(ret);
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
		var updatedList = [];
		list.forEach(function(item) {
			updatedList.push([item, item.toLowerCase()]);
		});
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
		editable: true,
		minWeight: 0.6,
		maxResults: 10,
		selectMode: true,
		updateList: function(value) {},
		list: [
			"Hello",
			"World",
			"Orange",
			"Apple",
			"Pear",
			"Datatatata"
		]
	};

})(jQuery);

/* Add the module to Irform */
Irform.defaultOptions.fields.dropdown = function(name, options) {
	var div = $("<div>");
	var o = {name: name};
	if (typeof options["options"] === "object") {
		o = $.extend(true, o, options["options"]);
	}
	$(div).irformDropdown(o);
	return div;
};
