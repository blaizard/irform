tinymce.PluginManager.add('inlinecode', function(editor, url) {

	function insertCodeSample(editor, language, code) {
		editor.undoManager.transact(function() {
			var node = getSelectedCodeSample(editor);

			if (node) {
				editor.dom.setAttrib(node, 'class', 'language-' + language);
				node.innerHTML = code;
				editor.selection.select(node);
			} else {
				editor.insertContent('<pre id="__new" class="language-' + language + '">' + code + '</pre>');
				editor.selection.select(editor.$('#__new').removeAttr('id')[0]);
			}
		});
	}

	function getLanguages(editor) {
		var defaultLanguages = [
			{text: 'HTML/XML', value: 'markup'},
			{text: 'JavaScript', value: 'javascript'},
			{text: 'CSS', value: 'css'},
			{text: 'PHP', value: 'php'},
			{text: 'Ruby', value: 'ruby'},
			{text: 'Python', value: 'python'},
			{text: 'Java', value: 'java'},
			{text: 'C', value: 'c'},
			{text: 'C#', value: 'csharp'},
			{text: 'C++', value: 'cpp'}
		];

		var customLanguages = editor.settings.codesample_languages;
		return customLanguages ? customLanguages : defaultLanguages;
	}

	function getSelectedCodeSample(editor) {
		var node = editor.selection.getNode();


		if (1) {
			return node;
		}

		return null;
	}

	editor.addButton('inlinecode', {
		text: 'Code',
		icon: false,
		onclick: function() {

			editor.windowManager.open({
				title: "Insert/Edit inline code",
				minWidth: Math.min($(document).width(), editor.getParam('inlinecode_dialog_width', 800)),
				minHeight: Math.min($(document).height(), editor.getParam('inlinecode_dialog_height', 650)),
				layout: 'flex',
				direction: 'column',
				align: 'stretch',
				body: [
					{
						type: 'listbox',
						name: 'language',
						label: 'Language',
						maxWidth: 200,
					//	value: getCurrentLanguage(editor),
						values: getLanguages(editor)
					},

					{
						type: 'textbox',
						name: 'code',
						multiline: true,
						spellcheck: false,
						ariaLabel: 'Code view',
						flex: 1,
						style: 'direction: ltr; text-align: left',
						classes: 'monospace',
				//		value: getCurrentCode(editor),
						autofocus: true
					}
				],
				onSubmit: function(e) {
					insertCodeSample(editor, e.data.language, e.data.code);
				}
			});

			editor.focus();
			var em = "<a data-discover>" + editor.selection.getContent() + "</a>";
			editor.insertContent(em);
		}
	});

	editor.on('PreProcess', function(e) {
	});

});

// Add the plugin to irformTinymce
$().irformTinymce.defaults.tinymce.toolbar += " | inlinecode";
$().irformTinymce.defaults.tinymce.plugins.push("inlinecode");
