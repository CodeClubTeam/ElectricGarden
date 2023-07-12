#!/usr/bin/env bash

set -e

zip -r function-app.zip host.json dist/* */function.json node_modules/*
