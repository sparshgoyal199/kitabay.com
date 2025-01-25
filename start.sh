#!/bin/bash
poetry install
poetry run gunicorn -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:$PORT
