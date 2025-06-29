# MCP Aare.guru Server

A Model Context Protocol (MCP) server that provides access to the Aare.guru API for getting water temperature and swimming conditions of the Aare river in Switzerland.

## Features

This MCP server provides the following tools:

- **get_cities**: Get list of all available monitoring locations
- **get_current_conditions**: Get comprehensive current data (temperature, flow, forecasts) for a specific location
- **get_today_summary**: Get minimal current temperature and swimming recommendation
- **get_widget_data**: Get current data for all locations at once
- **get_historical_data**: Get historical time series data for temperature, flow, and air temperature

## Requirements

- Node.js 18 or newer

## Installation

### Using npx (Recommended)

```bash
npx mcp-aareguru
```

### Global Installation

```bash
npm install -g mcp-aareguru
mcp-aareguru
```

### Local Development

```bash
git clone <repository-url>
cd mcp-aareguru
npm install
npm start
```

## Usage with Claude Desktop

Add the following to your Claude Desktop MCP configuration:

```json
{
  "mcpServers": {
    "aareguru": {
      "command": "npx",
      "args": ["mcp-aareguru"]
    }
  }
}
```

Or if installed globally:

```json
{
  "mcpServers": {
    "aareguru": {
      "command": "mcp-aareguru"
    }
  }
}
```

## Available Tools

### get_cities

Get a list of all available monitoring locations along the Aare river.

**Parameters:** None required

- `app` (optional): App identifier
- `version` (optional): Version number
- `values` (optional): Specific values to extract

### get_current_conditions

Get comprehensive current conditions for a specific location.

**Parameters:**

- `city` (optional, default: "bern"): Location identifier (e.g., "bern", "thun")
- `app` (optional): App identifier
- `version` (optional): Version number
- `values` (optional): Specific values to extract

### get_today_summary

Get a minimal summary with current temperature and swimming recommendation.

**Parameters:**

- `city` (optional, default: "bern"): Location identifier
- `app` (optional): App identifier
- `version` (optional): Version number
- `values` (optional): Specific values to extract

### get_widget_data

Get current data for all locations simultaneously.

**Parameters:**

- `app` (optional): App identifier
- `version` (optional): Version number
- `values` (optional): Specific values to extract

### get_historical_data

Get historical time series data for water temperature, flow, and air temperature.

**Parameters:** (all required)

- `city`: Location identifier
- `start`: Start date/time (ISO format, timestamp, "yesterday", "-1 day", etc.)
- `end`: End date/time (ISO format, timestamp, "now", etc.)
- `app` (optional): App identifier
- `version` (optional): Version number
- `values` (optional): Specific values to extract

## Example Queries

Once connected to Claude Desktop, you can ask questions like:

- "What's the current water temperature in Bern?"
- "Show me all available Aare monitoring locations"
- "Get the historical data for Thun from last week"
- "What are the current swimming conditions across all locations?"

## API Data

This server connects to the Aare.guru API (https://aare.guru), which provides:

- Current water temperature
- Water flow/discharge rates
- Air temperature
- Swimming recommendations and "Sprüche" (sayings)
- Weather forecasts
- Historical data
- Multiple monitoring locations along the Aare river

## License

MIT

## Credits

Data provided by [Aare.guru](https://aare.guru) - a service by [Bureau für digitale Existenz](https://bureau.existenz.ch).

This MCP server is not officially affiliated with Aare.guru but uses their public API with respect to their terms of service.
