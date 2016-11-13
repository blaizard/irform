/**
 * \brief Notification module
 */
var Irnotify = function (message, options) {
	// Merge the options
	options = $.extend(true, {}, Irnotify.defaults, options);
	// Check if the notification container exists, if not create it
	var container = options.container;
	// Check if the id exists, if so do nothing
	if (options.id && $(container).find(".irnotify-id-" + options.id).length) {
		return;
	}
	var containerNotify = $(container).children(".irnotify");
	if (!containerNotify.length) {
		containerNotify = $("<div/>", {
			class: "irnotify"
		});
		$(container).prepend(containerNotify);
	}
	// Check if the sub container (for the type) is created
	if (options.group) {
		var containerGroup = $(containerNotify).children(".irnotify-group." + options.type);
		if (!containerGroup.length) {
			containerGroup = $("<div/>", {
				class: "irnotify-group " + options.type
			});
			$(containerNotify).prepend(containerGroup);
		}
		containerNotify = containerGroup;
	}
	// Create and add the entry
	var entry = $("<div/>", {
		class: "irnotify-entry " + options.type + ((options.id) ? " irnotify-id-" + options.id : "")
	});
	var msg = $("<div/>", {
		class: "message"
	});
	$(msg).html(message);
	$(entry).append(msg);
	if (options.delete) {
		var del = $("<div/>", {
			class: "delete"
		});
		$(del).html(options.delete);
		$(del).click(function() {
			Irnotify.delete(this);
		});
		$(entry).append(del);
	}
	$(containerNotify).append(entry);
};

/**
 * Deletes an item previously created
 */
Irnotify.delete = function(item) {
	if (typeof item == "string") {
		item = $("body").find(".irnotify-id-" + item);
	}
	item = $(item).closest(".irnotify-entry");
	var parent = item.parent();
	item.remove();
	// Check if the group is empty
	if (parent.hasClass("irnotify-group") && !parent.children().length) {
		item = parent;
		parent = item.parent();
		item.remove();
	}
	if (parent.hasClass("irnotify") && !parent.children().length) {
		parent.remove();
	}
};

/**
 * Default options for the notify module
 */
Irnotify.defaults = {
	/**
	 * Group all entries of the same type together
	 */
	group: false,
	/**
	 * An ID to identify the entry in the notification.
	 * An entry with the same ID can be displayed only once.
	 */
	id: null,
	/**
	 * If the delete button should be added
	 */
	delete: "<span class=\"icon-cross\"></span>",
	/**
	 * The type of notification to display. Can be:
	 * - info
	 * - error
	 * - success
	 * - warning
	 */
	type: "info",
	/**
	 * The container for this entry
	 */
	container: "body"
};
