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
process-stamp_mainjs: OUTPUT := ../docs/dist/js/irform.min.js
process-stamp_mainjs: INPUT := $(BASE_SRCS)

# Include sources
concat-stamp_mainjs: OUTPUT := ../docs/dist/js/irform.js
concat-stamp_mainjs: INPUT := $(BASE_SRCS)

# Style -----------------------------------------------------------------------

# Copy the icons
copy_maincss: INPUT := theme/default/icon
copy_maincss: OUTPUT := ../docs/dist/css/

# irform.min.css
process-stamp_maincss: OUTPUT := ../docs/dist/css/irform.min.css
process-stamp_maincss: INPUT := \
	theme/default/icon.css \
	theme/default/main.scss

# irform.pure.min.css
process-stamp_purecss: OUTPUT := ../docs/dist/css/irform.pure.min.css
process-stamp_purecss: INPUT := \
	theme/default/icon.css \
	theme/pure/main.scss

# Stamp text to apply to each files
STAMP_TXT = $(notdir $(OUTPUT)) (`date +'%Y.%m.%d'`) by Blaise Lengrand\n

# Package name
PACKAGE := irform.zip