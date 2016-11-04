MOCHA = node_modules/.bin/mocha
ESLINT = node_modules/.bin/eslint
KARMA = node_modules/karma/bin/karma

.PHONY: clean build-tests build-lib watch-lib watch-tests build test lint lint-quiet lint-fix

build:
	make build-tests
	make build-lib

build-tests:
	babel test-src --out-dir=test

build-lib:
	babel src --out-dir=lib

watch-lib:
	babel src --out-dir=lib -w

watch-tests:
	babel test-src --out-dir=test -w

test:
	make test-server
	make test-client

test-server:
	$(MOCHA) test/server

test-client:
	$(KARMA) start

lint:
	$(ESLINT) --ext .js --ext .jsx .

lint-fix:
	$(ESLINT) --fix --ext .js --ext .jsx .

lint-quiet:
	$(ESLINT) --ext .js --ext .jsx --quiet .
