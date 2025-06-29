#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const API_BASE_URL = "https://aareguru.existenz.ch";
const DEFAULT_APP = "mcp-aareguru-server";
const DEFAULT_VERSION = "1.0.0";

class AareGuruServer {
  constructor() {
    this.server = new Server(
      {
        name: "aareguru-server",
        version: "0.1.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "get_cities",
            description: "Get list of all available cities/locations with Aare data",
            inputSchema: {
              type: "object",
              properties: {
                app: {
                  type: "string",
                  description: "Optional app identifier",
                  default: DEFAULT_APP
                },
                version: {
                  type: "string", 
                  description: "Optional version number",
                  default: DEFAULT_VERSION
                },
                values: {
                  type: "string",
                  description: "Optional comma-separated list of specific values to extract"
                }
              }
            }
          },
          {
            name: "get_current_conditions", 
            description: "Get comprehensive current Aare data for a specific location including temperature, flow, forecasts",
            inputSchema: {
              type: "object",
              properties: {
                city: {
                  type: "string",
                  description: "City identifier (e.g., 'bern', 'thun')",
                  default: "bern"
                },
                app: {
                  type: "string",
                  description: "Optional app identifier", 
                  default: DEFAULT_APP
                },
                version: {
                  type: "string",
                  description: "Optional version number",
                  default: DEFAULT_VERSION
                },
                values: {
                  type: "string",
                  description: "Optional comma-separated list of specific values to extract"
                }
              }
            }
          },
          {
            name: "get_today_summary",
            description: "Get minimal current Aare temperature and swimming recommendation for a location",
            inputSchema: {
              type: "object", 
              properties: {
                city: {
                  type: "string",
                  description: "City identifier (e.g., 'bern', 'thun')",
                  default: "bern"
                },
                app: {
                  type: "string",
                  description: "Optional app identifier",
                  default: DEFAULT_APP
                },
                version: {
                  type: "string",
                  description: "Optional version number", 
                  default: DEFAULT_VERSION
                },
                values: {
                  type: "string",
                  description: "Optional comma-separated list of specific values to extract"
                }
              }
            }
          },
          {
            name: "get_widget_data",
            description: "Get current Aare data for all locations at once, suitable for widgets/dashboards",
            inputSchema: {
              type: "object",
              properties: {
                app: {
                  type: "string",
                  description: "Optional app identifier",
                  default: DEFAULT_APP
                },
                version: {
                  type: "string",
                  description: "Optional version number",
                  default: DEFAULT_VERSION
                },
                values: {
                  type: "string", 
                  description: "Optional comma-separated list of specific values to extract"
                }
              }
            }
          },
          {
            name: "get_historical_data",
            description: "Get historical time series data for water temperature, flow, and air temperature",
            inputSchema: {
              type: "object",
              properties: {
                city: {
                  type: "string",
                  description: "City identifier (required for historical data)",
                  required: true
                },
                start: {
                  type: "string", 
                  description: "Start date/time in various formats (ISO, timestamp, 'yesterday', '-1 day')",
                  required: true
                },
                end: {
                  type: "string",
                  description: "End date/time in various formats (ISO, timestamp, 'now')", 
                  required: true
                },
                app: {
                  type: "string",
                  description: "Optional app identifier",
                  default: DEFAULT_APP
                },
                version: {
                  type: "string",
                  description: "Optional version number",
                  default: DEFAULT_VERSION
                },
                values: {
                  type: "string",
                  description: "Optional comma-separated list of specific values to extract"
                }
              },
              required: ["city", "start", "end"]
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "get_cities":
            return await this.getCities(args);
          case "get_current_conditions":
            return await this.getCurrentConditions(args);
          case "get_today_summary":
            return await this.getTodaySummary(args);
          case "get_widget_data":
            return await this.getWidgetData(args);
          case "get_historical_data":
            return await this.getHistoricalData(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error.message}`
            }
          ],
          isError: true
        };
      }
    });
  }

  async makeApiRequest(endpoint, params = {}) {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    
    // Add default app and version if not provided
    if (!params.app) params.app = DEFAULT_APP;
    if (!params.version) params.version = DEFAULT_VERSION;
    
    // Add all parameters to URL
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }

  async getCities(args = {}) {
    const data = await this.makeApiRequest("/v2018/cities", args);
    
    return {
      content: [
        {
          type: "text",
          text: `Available Aare monitoring locations:\n\n${JSON.stringify(data, null, 2)}`
        }
      ]
    };
  }

  async getCurrentConditions(args = {}) {
    const data = await this.makeApiRequest("/v2018/current", args);
    
    return {
      content: [
        {
          type: "text", 
          text: `Current Aare conditions for ${args.city || 'Bern'}:\n\n${JSON.stringify(data, null, 2)}`
        }
      ]
    };
  }

  async getTodaySummary(args = {}) {
    const data = await this.makeApiRequest("/v2018/today", args);
    
    return {
      content: [
        {
          type: "text",
          text: `Today's Aare summary for ${args.city || 'Bern'}:\n\n${JSON.stringify(data, null, 2)}`
        }
      ]
    };
  }

  async getWidgetData(args = {}) {
    const data = await this.makeApiRequest("/v2018/widget", args);
    
    return {
      content: [
        {
          type: "text",
          text: `Aare widget data for all locations:\n\n${JSON.stringify(data, null, 2)}`
        }
      ]
    };
  }

  async getHistoricalData(args = {}) {
    if (!args.city || !args.start || !args.end) {
      throw new Error("Historical data requires city, start, and end parameters");
    }
    
    const data = await this.makeApiRequest("/v2018/history", args);
    
    return {
      content: [
        {
          type: "text",
          text: `Historical Aare data for ${args.city} (${args.start} to ${args.end}):\n\n${JSON.stringify(data, null, 2)}`
        }
      ]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Aare.guru MCP server running on stdio");
  }
}

const server = new AareGuruServer();
server.run().catch(console.error);