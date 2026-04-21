#!/bin/bash
set -e

# This script helps verify the DEFINE-state output directory for the idea-refine skill.

CURRENT_TASK_DIR=".memory-bank-v2/machine/current-task"

if [ ! -d "$CURRENT_TASK_DIR" ]; then
  mkdir -p "$CURRENT_TASK_DIR"
  echo "Created directory: $CURRENT_TASK_DIR" >&2
else
  echo "Directory already exists: $CURRENT_TASK_DIR" >&2
fi

echo "{\"status\": \"ready\", \"directory\": \"$CURRENT_TASK_DIR\", \"artifact\": \"definition.md\"}"
