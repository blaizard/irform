tinymce.PluginManager.add('keyword', function(editor, url) {
	editor.addButton('keyword', {
		text: 'Keyword',
		icon: false,
		onclick: function() {
			editor.focus();
			var em = "<a data-discover>" + editor.selection.getContent() + "</a>";
			editor.insertContent(em);
		}
	});
});

// Add the plugin to irformTinymce
$().irformTinymce.defaults.tinymce.toolbar += " | keyword";
$().irformTinymce.defaults.tinymce.plugins.push("keyword");
