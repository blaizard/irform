# Project specific configuration

# Javascript source files to be compressed
JS_SRCS = \
	srcs/irform.js \
	srcs/jquery.irform-array.js \
	srcs/jquery.irform-array.keywords.js \
	srcs/jquery.irform-tinymce.js \
	srcs/jquery.irform-file.js \
	srcs/irform.irexplorer.js \
	srcs/irform.bootstrap.js

# CSS source files to be compressed
CSS_SRCS = \
		theme/default/icon.css \
	theme/default/irform.css

# Other distribution files to be stored in the output directory
DIST_SRCS = \
	theme/default/fonts

# The module name
MODULE_NAME = irform

# Add the following header
STAMP = $(MODULE_NAME) (`date +'%y.%m.%d'`) by Blaise Lengrand

# *******************************************************************

# Generate the various file extension headers
JS_STAMP = /* $(STAMP) */
CSS_STAMP = /* $(STAMP) */
PHP_STAMP = /* $(STAMP) */

# The compressers (uglyfiers)
JS_COMPRESS = uglifyjs
CSS_COMPRESS = uglifycss
MKDIR = mkdir -p
CP = cp -R
RM = rm -rfd

# FLags
JS_FLAGS = -c -m
CSS_FLAGS =

# The name of the directory where all the output will be
DIST_DIR = dist

# Generate the file names
ifeq ($(JS_SRCS),)
JS_TARGET =
JS_COMPRESS_TARGET =
else
JS_TARGET = $(DIST_DIR)/$(MODULE_NAME:=.js)
JS_COMPRESS_TARGET = $(DIST_DIR)/$(MODULE_NAME:=.min.js)
endif
ifeq ($(CSS_SRCS),)
CSS_TARGET =
CSS_COMPRESS_TARGET =
else
CSS_TARGET = $(DIST_DIR)/$(MODULE_NAME:=.css)
CSS_COMPRESS_TARGET = $(DIST_DIR)/$(MODULE_NAME:=.min.css)
endif

# Sanity check
JS_COMPRESS_CHECK := $(shell command -v $(JS_COMPRESS) 2> /dev/null)
CSS_COMPRESS_CHECK := $(shell command -v $(CSS_COMPRESS) 2> /dev/null)

# Specify the phony targets
.PHONY: all check concat minify clean copy

# Generate everything
all: check clean concat minify copy stamp

# Sanity check, make sure the program required are present
check:
	@echo "CHECK\t$(JS_COMPRESS)"
ifndef JS_COMPRESS_CHECK
	$(error "$(JS_COMPRESS) is not available please install: sudo apt-get install npm && sudo npm install --global uglifyjs && uglifyjs --version")
endif
	@echo "CHECK\t$(CSS_COMPRESS)"
ifndef CSS_COMPRESS_CHECK
	$(error "$(CSS_COMPRESS) is not available please install: sudo apt-get install npm && sudo npm install --global uglifycss && uglifycss --version")
endif

# Concatenate the files
concat: ${DIST_DIR} $(JS_SRCS) $(CSS_SRCS)
ifneq (${JS_SRCS},)
	@echo "GENERATE\t$(JS_TARGET)"
	@cat $(JS_SRCS) > $(JS_TARGET)
endif
ifneq (${CSS_SRCS},)
	@echo "GENERATE\t$(CSS_TARGET)"
	@cat $(CSS_SRCS) > $(CSS_TARGET)
endif

# Compress the file using the uglyfier
minify: ${DIST_DIR} $(JS_TARGET) $(CSS_TARGET)
ifneq (${JS_SRCS},)
	@echo "MINIFY\t$(JS_COMPRESS_TARGET)"
	@$(JS_COMPRESS) $(JS_TARGET) $(JS_FLAGS) -o $(JS_COMPRESS_TARGET)
endif
ifneq (${CSS_SRCS},)
	@echo "MINIFY\t$(CSS_COMPRESS_TARGET)"
	@$(CSS_COMPRESS) $(CSS_TARGET) > $(CSS_COMPRESS_TARGET)
endif

# Clean the output directory
clean: ${DIST_DIR}
	@echo "CLEAN\t$(DIST_DIR)/*"
	@$(RM) $(DIST_DIR)/*

# Copy the distribute files to the output directory
copy: ${DIST_SRCS}
ifneq (${DIST_SRCS},)
	@echo "COPY\t$(DIST_SRCS)"
	@$(CP) $(DIST_SRCS) $(DIST_DIR)
endif

# Generate the output directory 
${DIST_DIR}:
	@echo "MKDIR\t$(DIST_DIR)"
	@${MKDIR} ${DIST_DIR}

# Apply stamps to the files
stamp: ${JS_TARGET} ${JS_COMPRESS_TARGET} ${CSS_TARGET} ${CSS_COMPRESS_TARGET}
	@echo "STAMP $(filter %.js %.css %.php,$^)"
	@for file in $(filter %.js,$^); do \
		echo "${JS_STAMP}" > .temp && cat $$file >> .temp && mv .temp $$file; \
	done
	@for file in $(filter %.css,$^); do \
		echo "${CSS_STAMP}" > .temp && cat $$file >> .temp && mv .temp $$file; \
	done
	@for file in $(filter %.php,$^); do \
		echo "${PHP_STAMP}" > .temp && cat $$file >> .temp && mv .temp $$file; \
	done