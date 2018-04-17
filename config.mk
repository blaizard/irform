BASE_SRCS := \
	srcs/irrequire.min.js \
	srcs/irform.js \
	srcs/irform.notify.js \
	srcs/jquery.irform-array.js \
	srcs/jquery.irform-array.tags.js \
	srcs/jquery.irform-array.images.js \
	srcs/jquery.irform-dropdown.js \
	srcs/jquery.irform-custom.js \
	srcs/jquery.irform-tinymce.js \
	srcs/jquery.irform-file.js \
	srcs/jquery.irform-modal.js

# Irform ----------------------------------------------------------------------

# irform.min.js
process-stamp_mainjs: OUTPUT := js/irform.min.js
process-stamp_mainjs: INPUT := $(BASE_SRCS)

# Include sources
concat-stamp_mainjs: OUTPUT := js/irform.js
concat-stamp_mainjs: INPUT := $(BASE_SRCS)

# Style -----------------------------------------------------------------------

# Copy the icons
copy_maincss: INPUT := theme/default/icon
copy_maincss: OUTPUT := css/

# irform.min.css
process-stamp_maincss: OUTPUT := css/irform.min.css
process-stamp_maincss: INPUT := \
	theme/default/icon.css \
	theme/default/main.scss

# irform.black.min.css
process-stamp_mainblackcss: OUTPUT := css/irform.black.min.css
process-stamp_mainblackcss: INPUT := \
	theme/default/icon.css \
	theme/black/main.scss

# irform.aube.min.css
process-stamp_maintouchcss: OUTPUT := css/irform.touch.min.css
process-stamp_maintouchcss: INPUT := \
	theme/default/icon.css \
	theme/touch/main.scss

# Bootstrap -------------------------------------------------------------------

# irform.bootstrap.min.js
process-stamp_bootstrapjs: OUTPUT := js/irform.bootstrap.min.js
process-stamp_bootstrapjs: INPUT := $(BASE_SRCS) \
	srcs/irform.bootstrap.js

# Include sources
concat-stamp_bootstrapjs: OUTPUT := js/irform.bootstrap.js
concat-stamp_bootstrapjs: INPUT := $(BASE_SRCS) \
	srcs/irform.bootstrap.js

# irexplorer -------------------------------------------------------------------

# irform.irexplorer.min.js
process-stamp_irexplorerjs: OUTPUT := js/irform.irexplorer.min.js
process-stamp_irexplorerjs: INPUT := $(BASE_SRCS) \
	srcs/irform.irexplorer.js

# Include sources
concat-stamp_irexplorerjs: OUTPUT := js/irform.irexplorer.js
concat-stamp_irexplorerjs: INPUT := $(BASE_SRCS) \
	srcs/irform.irexplorer.js

# Stamp text to apply to each files
STAMP_TXT = $(notdir $(OUTPUT)) (`date +'%Y.%m.%d'`) by Blaise Lengrand\n

# Package name
PACKAGE := irform.zip