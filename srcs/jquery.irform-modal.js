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
