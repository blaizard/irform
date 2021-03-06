## A lightweight HTML form handler

Irform is a Javascript library to create and manage HTML forms. It is based on jQuery library and has been developped with flexibility and simplicity in mind, making this module a perfect asset to handle any form and fields. This module will auto-generate the form described by the configuration and dynamically add/remove fields based on user inputs.

All the basic fields are already supported (input, textarea, select...), more advanced ones are also supported (file browser, tinyMCE...) and a simple interface is available to support any other custom fields.

This library can also be easily adapted to support any UI. Bootstrap is currently supported but any other can be easily implemented.

&#128279; [https://blaizard.github.io/irform](https://blaizard.github.io/irform)


## Features

* Lightweight
* Extensible [(1)](#extensible)
* Support nested types
* Validation
* Input Masking
* Modals
* Notifications
* Field supported:
  * All basics elements (input, password, textarea...)
  * Tags
  * Switches
  * WYSIWYG (HTML Editor)
  * Arrays [(2)](#arrays)

<a name="extensible">(1)</a> Can add new fields.<br/>
<a name="arrays">(2)</a> Arrays are modular elements that can contain multiple occurence of similar sub-elements (configurable through templates). See the documentation for more information.<br/>