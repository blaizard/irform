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
		template: "<span>" +
						"<span class=\"irform-array-tags-edit\">" +
							"<input type=\"text\" class=\"irform inline\" name=\"keyword\"/>" +
						"</span>" +
						"<span class=\"irform-array-tags-tag irform border inline clickable\" style=\"display: none;\">" +
							"<span></span>" +
							"<span class=\"irform-array-item-del\" style=\"margin-left: 10px;\"><span class=\"icon-cross\"></span></span>" +
						"</span>" +
					"</span>",
		isMove: false,
		isDelete: false,
		isDrag: true,
		dragHandleSelector: ".irform-array-item .irform-array-tags-tag > span:not(.irform-array-item-del)",
		inline: true,
		hookAdd: function(item) {
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
					$(tag).find("span:first").text(value);
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
			return value.split(",").map(function(v) {
				return {keyword: v.trim()};
			});
		},
		/**
		 * Hook called once the element value is read.
		 */
		hookValRead: function(value) {
			return value.map(function(v) { return v.keyword; }).join(", ");
		}
	};
})(jQuery);

/* Add the module to Irform */
Irform.defaultOptions.fields.tags = function(name) {
	var div = $("<div>");
	div.irformArrayTags({name: name});
	return div;
};
