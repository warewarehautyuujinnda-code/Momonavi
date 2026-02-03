// Notion Integration - Using Replit Notion Connector
import { Client } from '@notionhq/client';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=notion',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Notion not connected');
  }
  return accessToken;
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
export async function getNotionClient() {
  const accessToken = await getAccessToken();
  return new Client({ auth: accessToken });
}

// Extract database ID from Notion URL
export function extractDatabaseId(url: string): string {
  // Handle various Notion URL formats
  // https://www.notion.so/workspace/DatabaseName-abc123...
  // https://notion.so/abc123...
  const match = url.match(/([a-f0-9]{32})|([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
  if (!match) {
    throw new Error(`Invalid Notion URL: ${url}`);
  }
  return match[0].replace(/-/g, '');
}

// Test connection to a Notion database
export async function testDatabaseConnection(databaseId: string): Promise<{ success: boolean; title?: string; error?: string }> {
  try {
    const notion = await getNotionClient();
    const response = await notion.databases.retrieve({ database_id: databaseId });
    const title = (response as any).title?.[0]?.plain_text || 'Untitled';
    return { success: true, title };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
