import { prisma } from "../prisma";

/**
 * Twenty CRM Client
 * Handles HTTP requests to Twenty CRM REST Metadata and GraphQL APIs.
 */
export class TwentyClient {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = process.env.TWENTY_API_URL || "http://localhost:3000/api/v1";
    this.apiKey = process.env.TWENTY_API_KEY || "";
  }

  /**
   * General request helper for Twenty API
   */
  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    // If the path starts with /rest (which is the VPS mount point) and the apiUrl already has /api/v1,
    // we should construct the url correctly.
    // In our .env, TWENTY_API_URL is "https://twenty-5ncc.srv1472050.hstgr.cloud/api/v1"
    // So the server base is "https://twenty-5ncc.srv1472050.hstgr.cloud".
    // For metadata endpoints, they are mounted under "/rest/metadata/...".
    // For graphql endpoint, it is mounted under "/graphql".
    // We should parse the base URL dynamically.
    const urlObj = new URL(this.apiUrl);
    const baseUrl = `${urlObj.protocol}//${urlObj.host}`;

    let url = "";
    if (path === "/graphql") {
      url = `${baseUrl}/graphql`;
    } else {
      // For metadata paths (e.g. /rest/metadata/objects)
      url = `${baseUrl}${path}`;
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Twenty API error [${response.status} ${response.statusText}] on ${url}: ${errorText}`
        );
      }

      if (response.status === 204) {
        return {} as T;
      }

      return await response.json() as T;
    } catch (error) {
      console.error(`[TwentyClient] Error on request to ${url}:`, error);
      throw error;
    }
  }

  /**
   * Execute a GraphQL query or mutation against Twenty's records API
   */
  async graphql<T>(query: string, variables?: Record<string, any>): Promise<T> {
    const body = {
      query,
      variables,
    };

    const res = await this.request<{ data?: T; errors?: any[] }>("/graphql", {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (res.errors && res.errors.length > 0) {
      const errorsMsg = res.errors.map((e) => e.message).join(", ");
      throw new Error(`Twenty GraphQL Errors: ${errorsMsg}`);
    }

    if (!res.data) {
      throw new Error("Twenty GraphQL returned no data.");
    }

    return res.data;
  }

  /**
   * Fetch custom object schemas from Metadata API
   */
  async getObjectMetadatas(): Promise<any> {
    return this.request<any>("/rest/metadata/objects");
  }

  /**
   * Create a custom object via REST Metadata API
   */
  async createObjectMetadata(input: {
    nameSingular: string;
    namePlural: string;
    labelSingular: string;
    labelPlural: string;
    description: string;
    icon?: string;
  }): Promise<any> {
    return this.request<any>("/rest/metadata/objects", {
      method: "POST",
      body: JSON.stringify({
        ...input,
        isCustom: true,
      }),
    });
  }

  /**
   * Create a custom field on an object via REST Metadata API
   */
  async createFieldMetadata(
    objectMetadataId: string,
    input: {
      name: string;
      type: string;
      label: string;
      description?: string;
      isNullable?: boolean;
      settings?: Record<string, any>;
    }
  ): Promise<any> {
    return this.request<any>("/rest/metadata/fields", {
      method: "POST",
      body: JSON.stringify({
        ...input,
        objectMetadataId,
        isCustom: true,
      }),
    });
  }

  /**
   * Create a relationship between two objects in Twenty CRM
   */
  async createRelationMetadata(input: {
    objectMetadataId: string;
    relationType: "ONE_TO_MANY" | "MANY_TO_ONE" | "MANY_TO_MANY" | "ONE_TO_ONE";
    connectToObjectMetadataId: string;
    name: string;
    label: string;
  }): Promise<any> {
    return this.request<any>("/rest/metadata/relations", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }
}

export const twentyClient = new TwentyClient();
