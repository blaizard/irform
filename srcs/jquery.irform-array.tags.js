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
