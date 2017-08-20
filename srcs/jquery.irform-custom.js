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
