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

	/* Override the val function to handle this element */
	var originalVal = $.fn.val;
	$.fn.val = function(value) {
		if (arguments.length) {
			$(this).each(function() {
				if ($(this).hasClass("irform-tinymce")) {
					return tinyMCE.get($(this).prop("id")).setContent(value);
				}
				return originalVal.call(this, value);
			});
			return $(this);
		}
		if ($(this).hasClass("irform-tinymce")) {
			return tinyMCE.get($(this).prop("id")).getContent();
		}
		return originalVal.apply(this, arguments);
	};
})(jQuery);

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
