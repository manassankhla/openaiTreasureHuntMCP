// @ts-nocheck
import { baseURL } from "@/baseUrl";
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

const getAppsSdkCompatibleHtml = async (baseUrl: string, path: string) => {
  const result = await fetch(`${baseUrl}${path}`);
  return await result.text();
};

type ContentWidget = {
  id: string;
  title: string;
  templateUri: string;
  invoking: string;
  invoked: string;
  html: string;
  description: string;
  widgetDomain: string;
};

function widgetMeta(widget: ContentWidget) {
  return {
    "openai/outputTemplate": widget.templateUri,
    "openai/toolInvocation/invoking": widget.invoking,
    "openai/toolInvocation/invoked": widget.invoked,
    "openai/widgetAccessible": false,
    "openai/resultCanProduceWidget": true,
  } as const;
}

const handler = createMcpHandler(async (server) => {
  const html = await getAppsSdkCompatibleHtml(baseURL, "/");

  const contentWidget: ContentWidget = {
    id: "update_treasure_hunt_ui",
    title: "Update Treasure Hunt UI",
    templateUri: "ui://widget/treasure-hunt.html",
    invoking: "Updating game screen...",
    invoked: "Game screen updated",
    html: html,
    description: "Displays the treasure hunt game UI",
    widgetDomain: "https://nextjs.org/docs", // Keep default or change if needed
  };

  server.registerResource(
    "content-widget",
    contentWidget.templateUri,
    {
      title: contentWidget.title,
      description: contentWidget.description,
      mimeType: "text/html+skybridge",
      _meta: {
        "openai/widgetDescription": contentWidget.description,
        "openai/widgetPrefersBorder": true,
      },
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/html+skybridge",
          text: `<html>${contentWidget.html}</html>`,
          _meta: {
            "openai/widgetDescription": contentWidget.description,
            "openai/widgetPrefersBorder": true,
            "openai/widgetDomain": contentWidget.widgetDomain,
          },
        },
      ],
    })
  );

  // @ts-ignore - Ignore generic type depth error
  server.registerTool(
    contentWidget.id,
    {
      title: contentWidget.title,
      description: "Update the Treasure Hunt game UI with the current state. The game starts in the forest. From the forest, the player can go to the cave or the castle. In the cave, there is a dragon to fight. In the castle, there is treasure. Guide the user through the game and use this tool to update the UI on EVERY turn.",
      inputSchema: {
        location: z.string().describe("The current location: 'forest', 'cave', or 'castle'"),
        event: z.string().describe("The current event: 'none', 'dragon', 'attack', 'treasure', or 'victory'"),
        message: z.string().describe("The story text or narrator message to display to the player"),
      },
      _meta: widgetMeta(contentWidget),
    },
    async (args: any) => {
      const { location, event, message } = args;
      return {
        content: [
          {
            type: "text",
            text: `UI Updated: ${location}, ${event}, ${message}`,
          },
        ],
        structuredContent: {
          location,
          event,
          message,
          timestamp: new Date().toISOString(),
        },
        _meta: widgetMeta(contentWidget),
      };
    }
  );
});

export const GET = handler;
export const POST = handler;
