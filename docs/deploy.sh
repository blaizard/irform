#!/bin/bash

runServer () {
	while read args; do
		eval "set -- $args"
		type "$1" &> /dev/null
		if [ $? -eq 0 ]; then
			echo "Connect to the server: http://127.0.0.1:8000/docs"
			eval "$2"
			return
		fi
	done
	echo "You do not have any suitable command to run a local server, please install one of the following:"
	while read args; do
		eval "set -- $args"
		echo "- $1"
	done
}

SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )"
cd "$SCRIPT_DIR"

runServer <<EOF
php "php -S localhost:8000 -t ../"
EOF
