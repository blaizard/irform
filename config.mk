BASE_SRCS := \
	srcs/irform.js \
	srcs/jquery.irform-array.js \
	srcs/jquery.irform-array.keywords.js \
	srcs/jquery.irform-tinymce.js \
	srcs/jquery.irform-file.js \
	srcs/jquery.irform-modal.js \
	srcs/irform.irexplorer.js

# irform.min.js
minify_mainjs: OUTPUT := irform.min.js
minify_mainjs: SRCS := $(BASE_SRCS)

# irform.min.css
minify_maincss: OUTPUT := irform.min.css
minify_maincss: SRCS := \
	theme/default/icon.css \
	theme/default/irform.css

# theme/default/fonts
dist_mainfont: SRCS := theme/default/fonts

# irform.bootstrap.min.js
minify_bootstrapjs: OUTPUT := irform.bootstrap.min.js
minify_bootstrapjs: SRCS := $(BASE_SRCS) \
	srcs/irform.bootstrap.js

# Stamp text to apply to each files
STAMP_TXT = $(OUTPUT) (`date +'%Y.%m.%d'`) by Blaise Lengrand