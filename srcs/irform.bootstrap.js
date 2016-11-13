// Update the form layout
Irform.defaultOptions.hookInit = function() {
	// Make sure the container is a form, if not create one and update the container
	if (!$(this.container).is("form")) {
		var form = $("<form>");
		$(this.container).append(form);
		this.container = form;
	}
	$(this.container).addClass("form-horizontal");
}
Irform.defaultOptions.wrapper = function(elt, options, name) {
	var wrapper = $("<div>", {
		class: "form-group",
		style: "clear:both;"
	});
	var a = $("<a>", {
		name: "irform-anchor-" + name
	});
	var label = $("<label>", {
		class: "col-sm-2 control-label"
	});
	$(label).text(options.caption);
	var col = $("<fieldset>", {
		class: "col-sm-10"
	});
	if ($(elt).is("input,textarea,select")) {
		$(elt).addClass("form-control");
	}
	if ($(elt).is("button")) {
		$(elt).addClass("btn btn-default");
	}
	$(col).append(elt);
	if (typeof options.description !== "undefined") {
		var description = $("<small>", {
			class: "form-text text-muted"
		});
		$(description).text(options.description);
		$(col).append(description);
	}
	$(wrapper).append(a);
	$(wrapper).append(label);
	$(wrapper).append(col);

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
	// Update main message
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
	$.fn.irformArray.defaults.template = "<input type=\"text\" name=\"text\" class=\"form-control\" />";
	$.fn.irformArray.defaults.add = "<button type=\"button\" class=\"btn btn-info\"><span class=\"glyphicon glyphicon-plus\" aria-hidden=\"true\"></span> Add</button>";	
	$.fn.irformArray.defaults.delete = "<button type=\"button\" class=\"btn btn-default \"><span class=\"glyphicon glyphicon-remove\" aria-hidden=\"true\"></span>&nbsp;</button>";	
	$.fn.irformArray.defaults.up = "<button type=\"button\" class=\"btn btn-default \"><span class=\"glyphicon glyphicon-arrow-up\" aria-hidden=\"true\"></span>&nbsp;</button>";	
	$.fn.irformArray.defaults.down = "<button type=\"button\" class=\"btn btn-default \"><span class=\"glyphicon glyphicon-arrow-down\" aria-hidden=\"true\"></span>&nbsp;</button>";	
	$.fn.irformArray.defaults.hookAdd = function(item) {
		$(item).css({
			display: "flex",
			flexFlow: "row nowrap",
			marginBottom: "5px"
		});
		$(item).find(".irform-array-item-content").css({
			width: "100%",
			flexShrink: 1,
			order: 1,
			marginRight: "5px"
		});
		$(item).find(".irform-array-item-up").css({
			flexShrink: 0,
			order: 2
		});
		$(item).find(".irform-array-item-down").css({
			flexShrink: 0,
			order: 3
		});
		$(item).find(".irform-array-item-del").css({
			flexShrink: 0,
			order: 4
		});
	};
	$.fn.irformArrayTags.defaults.template = "<span style=\"margin-right: 10px;\">" +
						"<span class=\"irform-array-tags-edit\">" +
							"<span class=\"irform-array-item-left glyphicon glyphicon-triangle-left\" aria-hidden=\"true\"></span>" +
							"<form class=\"form-inline\" style=\"display: inline-block;\"><input type=\"text\" class=\"form-control\" name=\"keyword\"/></form>" +
							"<span class=\"irform-array-item-right glyphicon glyphicon-triangle-right\" aria-hidden=\"true\"></span>" +
						"</span>" +
						"<button type=\"button\" class=\"irform-array-tags-tag btn btn-default\" style=\"display: none;\">" +
							"<span></span>" +
							"<span class=\"irform-array-item-del glyphicon glyphicon-remove\" style=\"margin-left: 10px;\" aria-hidden=\"true\"></span>" +
						"</button>" +
					"</span>";
	$.fn.irformFile.create = function() {
		// Read the options
		var options = $(this).data("irformFile");
		// Reference to the main object
		var obj = this;
		// Create the container
		var container = $("<div>", {
			class: "input-group"
		});
		// Create the input field
		var input = $("<input>", {
			name: options.name,
			type: "text",
			class: "form-control"
		});
		$(container).append(input);
		// Create the button addon
		var addon = $("<div>", {
			class: "input-group-btn"
		});
		// Add the button
		var button = $("<button>", {
			type: "button",
			class: "btn btn-default dropdown-toggle"
		});
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
			// Add the list
			var ul = $("<ul>", {
				class: "dropdown-menu"
			});
			// Add the button(s)
			for (var i in options.buttonList) {
				var preset = options.presets[options.buttonList[i]];
				var li = $("<li>");
				var a = $("<a>");
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
