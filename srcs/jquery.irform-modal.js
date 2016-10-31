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
	 */
	$.fn.irformModal.x = function(arg, data) {
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
		};
	};

	/**
	 * \brief Default options, can be overwritten.
	 */
	$.fn.irformModal.defaults = {
		zIndex: 99999
	};

	$.fn.irformModal.create = function() {
		// Options of the current irformModal
		var options = $(this).data("irformModal");

		var modal = document.createElement("div");
		$(modal).addClass("irform-modal-content");
		$(modal).append(this);
		$(modal).click(function(e) {
			e.stopPropagation();
		});

		var container = document.createElement("div");
		$(container).addClass("irform-modal");
		$(container).append(modal);
		$(container).css({
			top: 0,
			left: 0,
			width: "100%",
			height: "100%",
			position: "fixed",
			zIndex: options.zIndex
		});

		// Save the container instance
		options.container = container;
		options.overflow = $("body").css("overflow");
		$(this).data("irformModal", options);

		// Remove the element on click
		var obj = this;
		$(container).click(function(e) {
			$.fn.irformModal.close.call(obj);
		});

		// Append the modal
		$("body").append(container);
		$("body").css("overflow", "hidden");
	};

	/**
	 * This function closes the dialog
	 */
	$.fn.irformModal.close = function () {
		// Options of the current irformModal
		var options = $(this).data("irformModal");
		$(options.container).remove();
		$("body").css("overflow", options.overflow);
	}

})(jQuery);
