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
