#!/usr/bin/env bash

current_dir=$(pwd)
echo "Current directory: $current_dir"

cd $current_dir/apps/livekit-agent && cp .env.example .env.local
echo "Copied .env.example to .env.local in apps/livekit-agent"

cd $current_dir/apps/deepagent && cp .env.example .env.local
echo "Copied .env.example to .env.local in apps/deepagent"

cd $current_dir/apps/client && cp .env.example .env.local
echo "Copied .env.example to .env.local in apps/client"

cd $current_dir/apps/server && cp .env.example .env.local
echo "Copied .env.example to .env.local in apps/server"

cd $current_dir/apps/infra && cp .env.example .env
echo "Copied .env.example to .env in apps/infra"