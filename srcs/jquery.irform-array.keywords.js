(function($) {
	/**
	 * \brief Preset for keyword module
	 *
	 * \alias jQuery.irformArrayKeywords
	 */
	$.fn.irformArrayKeywords = function(options) {
		$(this).irformArray($.extend(true, $.fn.irformArrayKeywords.defaults, options));
	};

	/**
	 * \brief Default options, can be overwritten. These options are used to customize the object.
	 * Change default values:
	 * \code $().irformArrayKeywords.defaults.theme = "aqua"; \endcode
	 * \type Array
	 */
	$.fn.irformArrayKeywords.defaults = {
		template: "<span>" +
						"<span class=\"irform-array-keywords-edit\">" +
							"<button class=\"irform-array-item-left irform dock-right\" type=\"button\"><span class=\"icon-arrow-left\"></span></button>" +
							"<input type=\"text\" class=\"irform inline dock-left dock-right\" name=\"keyword\"/>" +
							"<button class=\"irform-array-item-right irform dock-left\" type=\"button\"><span class=\"icon-arrow-right\"></span></button>" +
						"</span>" +
						"<span class=\"irform-array-keywords-tag irform border inline clickable\" style=\"display: none;\">" +
							"<span></span>" +
							"<span class=\"irform-array-item-del\" style=\"margin-left: 10px;\"><span class=\"icon-cross\"></span></span>" +
						"</span>" +
					"</span>",
		isMove: false,
		isDelete: false,
		inline: true,
		hookAdd: function(item) {
			var obj = this;
			var edit = $(item).find(".irform-array-keywords-edit");
			var tag = $(item).find(".irform-array-keywords-tag");
			$(item).find("input").on("blur", function() {
				var value = $(this).val();
				/* If the value is empty, then delete the item */
				if (!value) {
					$(obj).irformArray("itemDelete", item);
				}
				/* Else hide the input and show the tag */
				else {
					$(edit).hide();
					/* Show and update the tag */
					$(tag).find("span:first").text(value);
					$(tag).show();
				}
			}).on("change", function() {
				$(this).trigger("blur");
			});

			$(tag).click(function() {
				/* Do nothing if this element is disabled */
				if ($(obj).prop("disabled") === true) {
					return;
				}
				/* Once a new element is added, make sure all the others are in non-edit mode */
				$(obj).find(".irform-array-item").not(item).find("input").trigger("blur");
				$(this).hide();
				/* Show and update the tag */
				$(edit).show();
			});

			/* Allocate the various events */
			$(item).find(".irform-array-item-left").click(function() {
				$(obj).irformArray("itemUp", item);
			});
			$(item).find(".irform-array-item-right").click(function() {
				$(obj).irformArray("itemDown", item);
			});
			$(item).find(".irform-array-item-del").click(function() {
				$(obj).irformArray("itemDelete", item);
			});

			/* Once a new element is added, make sure all the others are in non-edit mode */
			$(this).find(".irform-array-item").not(item).find("input").trigger("blur");
		},
		/**
		 * Hook called once the element value is writen to it.
		 */
		hookValWrite: function(value) {
			value = value.split(",");
			var newVal = [];
			for (var i in value) {
				/* Clean the value */
				var v = value[i].trim();
				if (v) {
					newVal.push({
						keyword: v
					});
				}
			}
			return newVal;
		},
		/**
		 * Hook called once the element value is read.
		 */
		hookValRead: function(value) {
			for (var i in value) {
				value[i] = value[i]["keyword"];
			}
			return value.join(", ");
		}
	};
})(jQuery);

/* Add the module to Irform */
Irform.defaultOptions.fields.keywords = function(name) {
	var div = document.createElement("div");
	$(div).irformArrayKeywords({name: name});
	return div;
};
