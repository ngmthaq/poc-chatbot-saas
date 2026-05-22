# LIVEKIT AGENT

## Install Node.js

LiveKit Agents for Node.js requires Node.js >= 20. [Node.js](https://nodejs.org/en/download)

## Install HuggingFace CLI (Optional)

- On MacOS: `brew update && brew install hf`
- On Linux: `curl -LsSf https://hf.co/cli/install.sh | bash`
- On Windows: `powershell -ExecutionPolicy ByPass -c "irm https://hf.co/cli/install.ps1 | iex"`

Login HuggingFace: `hf auth login`

## For Cloud LiveKit Server

1. Install Livekit CLI:

- MacOS: `brew update && brew install livekit-cli`
- Linux: `curl -sSL https://get.livekit.io/cli | bash`
- Windows: `winget install LiveKit.LiveKitCLI`

2. Link Livekit Cloud to Livekit CLI: `lk cloud auth`

3. Install dependencies: `pnpm install`

4. Download model files: `pnpm download-files`

5. Testing: Use the [Agent Console](https://docs.livekit.io/agents/start/console/)
   to interact with and debug your agent in real-time.
   Note that you'll need to set the Agent name

## For On-Premise LiveKit Server

1. Install On-Premise LiveKit Server:

- MacOS: `brew update && brew install livekit`
- Linux: `curl -sSL https://get.livekit.io | bash`
- Windows: [Releases](https://github.com/livekit/livekit/releases)

2. Start the server in dev mode:

You can start LiveKit in development mode by running: `livekit-server --dev`.
This will start an instance using the following API key/secret pair:

```
API key: devkey
API secret: secret
```

- By default LiveKit's signal server binds to 127.0.0.1:7880.
  If you'd like to access it from other devices on your network, pass in --bind 0.0.0.0.
- To customize setup for production,
  refer to [deployment guides](https://docs.livekit.io/transport/self-hosting/deployment/).
