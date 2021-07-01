# Welcome to not-grocys build system, based on GNU make.
# Using 1970s tech to solve 2021 problems.
#
# If you are used to npm scripts, this is basically the same thing:
# run commands, one after the other, or in parallel (as long as the
# dependency tree allows for such parallelism).
#
# However, this doesn't spin up node for every command, especially
# if it can be done with a simple C program that had a stable
# CLI for the better part of a century.
#
# Additionally, we can have comments and multi-line, multi-command
# recepies without "tricks" like && that make the command lines
# virtually unreadable.
#
# If you have multiple cores, you can speed up compilation by using
# `make -j<NUMBER OF CPU CORES>` and run targets in parallel.
#
####################################################################
#                          IMPORTANT                               #
# ---------------------------------------------------------------- #
#                                                                  #
# This file is intended to run on a UNIX-like shell (bash, zsh, …) #
# Running with a DOS-like shell like on Microsoft (R) Windows (TM) #
# is unsupported.                                                  #
#                                                                  #
# If you want to build on Windows, you can use Windows Subsystem   #
# for Linux:                                                       #
# https://docs.microsoft.com/de-de/windows/wsl/install-win10       #
####################################################################

# Configure the build tools to use.
# The default is to use the modules provided by yarn. These are listed
# as dependencies in the package.json file.
# If – for one reason or another – you want to user globally installed
# tools, configure these here.
# To successfully build not-grocy, you need these tools in your PATH:
# yarn ≥ 2.0, 7.3 ≤ php < 8.0, composer, node ≥ 12.0
SASS=npx sass
ROLLUP=npx rollup
UGLIFY=npx uglifyjs
YARN=yarn
PHP=php
COMPOSER=composer
POSTCSS=npx postcss

# Configure some default flags for the tooling. Set include paths.
SASSFLAGS=-I node_modules/ --color --quiet-deps
UGLIFYFLAGS=--compress --mangle "reserved=GrocyClass" --source-map "content=public/dist/grocy.js.map"
RUNFLAGS=-S localhost:8000 -t public/ 

# Normally, you should not need to change anything below this line.
#------------------------------------------------------------------

# Input files
SASS_INPUT=scss/grocy.scss
SASS_OUTPUT=public/dist/grocy.css
UGLIFY_INPUT=public/dist/grocy.js
UGLIFY_OUTPUT=public/dist/grocy.min.js
OBJDIRS := public/dist public/js public/css public/js/locales
TMPSASS=public/dist/grocy.tmp.css

.DEFAULT_GOAL := build
# disable default suffixes
.SUFFIXES:

.PHONY=help
help:
	@echo "Available targets:"
	@echo "help\t\t - \t show this message and exit."
	@echo "build\t\t - \t automatically rebuild the frontend. (default target)"
	@echo "watch\t\t - \t same as \x1b[7mbuild\x1b[0m, but watch for changes and run the php development server."
	@echo "publish\t\t - \t \x1b[7mbuild\x1b[0m, but in production mode. Also minifies."
	@echo "run\t\t – \t Run not-grocy with the php development server."
	@echo "release\t\t – \t publish and bundle a release .tar.xz"
	@echo " "
	@echo "For more information, look inside the \x1b[7mMakefile\x1b[0m."

# Install all dependencies, then build the public/ folder.
.PHONY=build
build: vendor js css public/js/locales/grocy/en.json resources

.PHONY=minify
minify: build
	${UGLIFY} ${UGLIFYFLAGS} -o ${UGLIFY_OUTPUT} ${UGLIFY_INPUT}

.PHONY=publish
publish: export NODE_ENV=production
publish: build minify

# this handles running yarn somewhat intelligently.
# loosely based around this stackoverflow answer:
# https://stackoverflow.com/a/44249374/10045846

yarn.lock: node_modules package.json
	${YARN} install ${YARNFLAGS}
	@touch -mr $(shell ls -Atd $? | head -1) $@

node_modules:
	mkdir -p $@

# run composer only if neccessary
# validate must be "ignored" because it might fail
# after clean.
#
# Also there are cases where composer doesn't update
# the modified date of the vendor folder,
# so touch it after execution (if we haven't failed,
# that is.)
vendor: composer.json composer.lock
	-${COMPOSER} validate
	${COMPOSER} install
	${COMPOSER} normalize
	@touch -mr $(shell ls -Atd $? | head -1) $@

# In watch mode build, then watch & run.
# Trap on SIGINT to kill all background-watching
# processes in the process tree.
# IMPORTANT: these commands need to be executed in the same
# shell, thus & \ need to be at the end of each line. 
.PHONY=watch
watch:
	touch ${TMPSASS}
	${SASS} ${SASSFLAGS} --watch ${SASS_INPUT} ${TMPSASS} & \
	${POSTCSS} ${TMPSASS} --config . -o ${SASS_OUTPUT} --watch & \
	${ROLLUP} --watch --no-watch.clearScreen --config ${RFLAGS} & \
	${PHP} ${RUNFLAGS} & \
	trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT & \
	wait
	rm ${TMPSASS}

# run rollup to build and bundle JS.
# for specific options, see rollup.config.js
.PHONY=js
js: yarn.lock | $(OBJDIRS)
	${ROLLUP} --config ${RFLAGS}

# build and bundle SASS files.
.PHONY=css
css: yarn.lock | $(OBJDIRS)
	${SASS} ${SASSFLAGS} ${SASS_INPUT} ${SASS_OUTPUT}
	${POSTCSS} --config . ${SASS_OUTPUT} -r


# To bundle all resources, there are a few prerequisites:
# First, the public output folders need to be created.
# Then we need to build all resources, in a way that they don't
# get rebuilt unless they need to be.
#
# The resources target depends on all i18n copy targets
# defined below, which do the actual magic.
.PHONY=resources
resources: public/webfonts public/dist/font public/js/locales/summernote public/js/locales/bootstrap-select public/js/locales/fullcalendar public/js/locales/fullcalendar-core public/js/swagger-ui.js

public/dist:
	mkdir -p public/dist
public/js:
	mkdir -p public/js
public/css:
	mkdir -p public/css
public/js/locales:
	mkdir -p public/js/locales

public/webfonts: | $(OBJDIRS)
	cp -r node_modules/@fortawesome/fontawesome-free/webfonts public/webfonts

public/dist/font: | $(OBJDIRS)
	cp -r node_modules/summernote/dist/font public/dist/font

public/js/locales/summernote: | $(OBJDIRS)
	cp -r node_modules/summernote/dist/lang public/js/locales/summernote

public/js/locales/bootstrap-select: | $(OBJDIRS)
	cp -r node_modules/bootstrap-select/dist/js/i18n public/js/locales/bootstrap-select 

public/js/locales/fullcalendar: | $(OBJDIRS)
	cp -r node_modules/fullcalendar/dist/locale public/js/locales/fullcalendar 

public/js/locales/fullcalendar-core: | $(OBJDIRS)
	cp -r node_modules/@fullcalendar/core/locales public/js/locales/fullcalendar-core

public/js/swagger-ui.js: node_modules/swagger-ui-dist/swagger-ui.js | $(OBJDIRS)
	cp -r node_modules/swagger-ui-dist/*.js node_modules/swagger-ui-dist/*.js.map public/js
	cp -r node_modules/swagger-ui-dist/*.css node_modules/swagger-ui-dist/*.css.map public/css


# This doesn't just generate en.json, but all locale files.
# However, as they are updated all at the same time, en.json
# serves as our key artifact.
# Locales are only regenerated if neccessary (that is, strings.pot has changed).
# This is not ideal, but works for now.
public/js/locales/grocy/en.json: vendor localization/strings.pot | $(OBJDIRS)
	${PHP} buildfiles/generate-locales.php

.PHONY=run
run: build
	${PHP} ${RUNFLAGS}

# This packs a release. Due to the way the data/ folder is structured,
# we need to be careful to include only the files we need.
.PHONY=release
release: YARNFLAGS=--check-cache
release: publish manifest
	mkdir -p release
	tar cvfJ release/not-grocy-$(shell git describe --tags).tar.xz \
		changelog \
		controllers \
		data/.htaccess \
		data/plugins \
		helpers \
		localization \
		middleware \
		migrations \
		public \
		services \
		vendor \
		views \
		app.php \
		config-dist.php \
		grocy.openapi.json \
		routes.php \
		version.json

# this will error if the working tree is dirty (git diff-index will return a non-zero status code)
# only permit to build a release zip from an actual commit (which will be referenced in version.json)
.PHONY=manifest
manifest:
	git update-index --refresh 
	git diff-index --quiet HEAD --
	php -r 'echo json_encode(["Version" => trim(`git describe --tags`), "ReleaseDate" => date("Y-m-d")]);' > version.json

.PHONY=clean
clean:
	-rm -rf public/dist
	-rm -rf public/js
	-rm -rf public/css
	-rm -rf public/js/locales
	-rm -rf release/
	-rm -rf vendor/
	-rm -rf node_modules
