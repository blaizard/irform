/* Update the form layout */
Irform.defaultOptions.wrapper = function(elt, options, name) {
	//var fieldset = document.createElement("fieldset");
	var wrapper = document.createElement("div");
	$(wrapper).addClass("form-group");
	$(wrapper).css("clear", "both");
	var a = document.createElement("a");
	$(a).prop("name", "irform-anchor-" + name);
	var label = document.createElement("label");
	$(label).addClass("col-sm-2 control-label");
	$(label).text((typeof options.caption === "string") ? options.caption : name);
	var col = document.createElement("fieldset");
	$(col).addClass("col-sm-10");
	if ($(elt).is("input,textarea,select")) {
		$(elt).addClass("form-control");
	}
	$(col).append(elt);
	if (typeof options.description !== "undefined") {
		var description = document.createElement("small");
		$(description).addClass("form-text text-muted");
		$(description).text(options.description);
		$(col).append(description);
	}
	$(wrapper).append(a);
	$(wrapper).append(label);
	$(wrapper).append(col);
	//$(fieldset).append(wrapper);
	return wrapper;
};
Irform.defaultOptions.callbackError = function(errorList) {
	var msg = "";
	for (var i in errorList) {
		switch (errorList[i]["type"]) {
		case "required":
			msg += "<div class=\"irform-id-" + errorList[i]["name"] + "\"><a class=\"alert-link\" href=\"#" + errorList[i]["name"] + "\">" + errorList[i]["options"].caption + "</a> is required</div>";
			break;
		case "validation":
			msg += "<div class=\"irform-id-" + errorList[i]["name"] + "\"><a class=\"alert-link\" href=\"#" + errorList[i]["name"] + "\">" + errorList[i]["options"].caption + "</a> does not validate</div>";
			break;
		}
		$(errorList[i]["item"]).removeClass("has-success").addClass("has-error");
	}
	$(this.container).find(".irform-error").remove();
	$(this.container).prepend("<div class=\"bs-component irform-error\"><div class=\"alert alert-danger alert-dismissible\" role=\"alert\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\">x</button><div class=\"irform-message\">" + msg + "</div></div></div>");
};
Irform.defaultOptions.callbackSuccess = function(item, name) {
	$(item).removeClass("has-error").addClass("has-success");
	/* Update main message */
	var error = $(this.container).find(".irform-error");
	$(error).find(".irform-message .irform-id-" + name).remove();
	if (!$(error).find(".irform-message").text()) {
		$(error).remove();
	}
};
/**
 * Called once an item needs to be disabled
 */
var IrformBootstrapSave = Irform.defaultOptions.disable;
Irform.defaultOptions.disable = function(isDisabled, elt) {
	IrformBootstrapSave.call(this, isDisabled, elt);
	$(elt).find("fieldset").prop("disabled", isDisabled);
};

/* Update the plugins */
(function($) {
	$.fn.irformArray.defaults.template = "<input type=\"text\" class=\"form-control\" />";
	$.fn.irformArray.defaults.add = "<button type=\"button\" class=\"btn btn-info\"><span class=\"glyphicon glyphicon-plus\" aria-hidden=\"true\"></span> Add</button>";	
	$.fn.irformArrayKeywords.defaults.template = "<span style=\"margin-right: 10px;\">" +
						"<span class=\"irform-array-keywords-edit\">" +
							"<span class=\"irform-array-item-left glyphicon glyphicon-triangle-left\" aria-hidden=\"true\"></span>" +
							"<form class=\"form-inline\" style=\"display: inline-block;\"><input type=\"text\" class=\"form-control\" name=\"keyword\"/></form>" +
							"<span class=\"irform-array-item-right glyphicon glyphicon-triangle-right\" aria-hidden=\"true\"></span>" +
						"</span>" +
						"<button type=\"button\" class=\"irform-array-keywords-tag btn btn-default\" style=\"display: none;\">" +
							"<span></span>" +
							"<span class=\"irform-array-item-del glyphicon glyphicon-remove\" style=\"margin-left: 10px;\" aria-hidden=\"true\"></span>" +
						"</button>" +
					"</span>";
	$.fn.irformFile.create = function() {
		/* Read the options */
		var options = $(this).data("irformFile");
		/* Reference to the main object */
		var obj = this;
		/* Create the container */
		var container = document.createElement("div");
		$(container).addClass("input-group");
		/* Create the input field */
		var input = document.createElement("input");
		$(input).attr("name", options.name);
		$(input).attr("type", "text");
		$(input).addClass("form-control");
		$(container).append(input);
		/* Create the button addon */
		var addon = document.createElement("div");
		$(addon).addClass("input-group-btn");
		/* Add the button */
		var button = document.createElement("button");
		$(button).attr("type", "button");
		$(button).addClass("btn btn-default dropdown-toggle");
		$(button).attr("data-toggle", "dropdown");
		if (options.buttonList.length > 1) {
			$(button).html("<span class=\"glyphicon glyphicon-folder-open\" aria-hidden=\"true\"></span>&nbsp;&nbsp;<span class=\"caret\"></span>");
		}
		else {
			var preset = options.presets[options.buttonList[0]];
			$(button).text(preset.caption);
			$(button).click(function() {
				preset.action.call(obj, function(value) {
					$(input).val(value);
				}, preset.options);
			});
		}
		$(addon).append(button);
		if (options.buttonList.length > 1) {
			/* Add the list */
			var ul = document.createElement("ul");
			$(ul).addClass("dropdown-menu");
			/* Add the button(s) */
			for (var i in options.buttonList) {
				var preset = options.presets[options.buttonList[i]];
				var li = document.createElement("li");
				var a = document.createElement("a");
				$(a).text(preset.caption);
				$(a).click(function() {
					preset.action.call(obj, function(value) {
						$(input).val(value);
					}, preset.options);
				});
				$(li).append(a);
				$(ul).append(li);
			}
			$(addon).append(ul);
		}
		$(container).append(addon);
		$(this).html(container);
	};
})(jQuery);
