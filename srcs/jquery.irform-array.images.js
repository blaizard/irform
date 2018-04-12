(function($) {
	/**
	 * \brief Preset for keyword module
	 *
	 * \alias jQuery.irformArrayImages
	 */
	$.fn.irformArrayImages = function(options) {
		var add = $("<div/>");
		new Irform(add, [{name: "upload", type: "file", options: {showInput: false}}]);
		$(this).irformArray($.extend(true, $.fn.irformArrayImages.defaults, {
			add: add
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
						"<img />" +
					//	"<span class=\"irform-array-images-del\"><span class=\"icon-cross\"></span></span>" +
						"<input name=\"img\" style=\"display: none;\" />" +
					"</span>",
		isMove: false,
		isDelete: true,
		delete: "<span class=\"irform-array-images-del\"><span class=\"icon-cross\">X</span></span>",
		isDrag: true,
		dragHandleSelector: ".irform-array-item img",
		inline: true,
		hookAdd: function(item) {
			var obj = this;

			var tag = $(item).find(".irform-array-tags-tag");
			$(item).find("input").on("blur", function() {
				var value = $(this).val();
				// Show and update the tag
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
