import type { AppConfig, OpenCodeSession } from "../types.js";

type OpenCodePart = {
  text?: string;
  content?: string;
  message?: string;
};

type OpenCodeResponse = {
  parts?: OpenCodePart[];
  [key: string]: unknown;
};

type OpenCodeSessionResponse = {
  id?: string;
  sessionID?: string;
  sessionId?: string;
  title?: string;
  name?: string;
  info?: {
    id?: string;
    title?: string;
  };
};

function trimSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function normalizeSessionId(session: OpenCodeSessionResponse): string | null {
  return session.id || session.sessionID || session.sessionId || session.info?.id || null;
}

function normalizeSessionTitle(session: OpenCodeSessionResponse): string {
  return session.title || session.name || session.info?.title || "";
}

function collectText(parts: OpenCodePart[] | undefined): string {
  if (!Array.isArray(parts)) {
    return "";
  }
  return parts
    .map((part) => {
      if (typeof part.text === "string") {
        return part.text;
      }
      if (typeof part.content === "string") {
        return part.content;
      }
      if (typeof part.message === "string") {
        return part.message;
      }
      return "";
    })
    .filter(Boolean)
    .join("\n");
}

export class OpenCodeClient {
  private readonly baseUrl: string;
  private readonly agent: string;
  private readonly model: string;

  constructor(config: AppConfig) {
    this.baseUrl = trimSlash(config.opencodeServerUrl);
    this.agent = config.opencodeAgent;
    this.model = config.opencodeModel;
  }

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        "content-type": "application/json",
        ...(init.headers || {})
      }
    });

    if (!response.ok) {
      const body = await response.text();
      const error = new Error(`OpenCode request failed (${response.status} ${response.statusText}): ${body}`) as Error & {
        status?: number;
      };
      error.status = response.status;
      throw error;
    }

    if (response.status === 204) {
      return null as T;
    }

    return (await response.json()) as T;
  }

  async createSession(title: string): Promise<OpenCodeSession> {
    const session = await this.request<OpenCodeSessionResponse>("/session", {
      method: "POST",
      body: JSON.stringify({ title })
    });

    const id = normalizeSessionId(session);
    if (!id) {
      throw new Error("OpenCode session create response did not include a session id.");
    }

    return { id, title: normalizeSessionTitle(session) || title };
  }

  async getSession(sessionId: string): Promise<OpenCodeSession> {
    const session = await this.request<OpenCodeSessionResponse>(`/session/${sessionId}`);
    const id = normalizeSessionId(session);
    if (!id) {
      throw new Error(`OpenCode session ${sessionId} response did not include a session id.`);
    }
    return {
      id,
      title: normalizeSessionTitle(session)
    };
  }

  async listSessions(): Promise<OpenCodeSession[]> {
    const sessions = await this.request<OpenCodeSessionResponse[]>("/session");
    if (!Array.isArray(sessions)) {
      return [];
    }
    return sessions
      .map((session) => ({
        id: normalizeSessionId(session),
        title: normalizeSessionTitle(session)
      }))
      .filter((session): session is OpenCodeSession => Boolean(session.id));
  }

  async findSessionByTicket(ticketKey: string): Promise<OpenCodeSession | null> {
    const prefix = `${ticketKey} `;
    const sessions = await this.listSessions();
    return sessions.find((session) => session.title === ticketKey || session.title.startsWith(prefix)) || null;
  }

  async ensureSession(ticketKey: string, issueSummary: string, existingSessionId: string | null): Promise<OpenCodeSession> {
    if (existingSessionId) {
      try {
        return await this.getSession(existingSessionId);
      } catch (error) {
        const status = (error as { status?: number }).status;
        if (status !== 404) {
          throw error;
        }
      }
    }

    const recovered = await this.findSessionByTicket(ticketKey);
    if (recovered) {
      return recovered;
    }

    return this.createSession(`${ticketKey} ${issueSummary}`.trim());
  }

  async sendMessage(sessionId: string, message: string): Promise<{ raw: OpenCodeResponse; text: string }> {
    const body: Record<string, unknown> = {
      agent: this.agent,
      parts: [{ type: "text", text: message }]
    };
    if (this.model) {
      body.model = this.model;
    }

    const response = await this.request<OpenCodeResponse>(`/session/${sessionId}/message`, {
      method: "POST",
      body: JSON.stringify(body)
    });

    return {
      raw: response,
      text: collectText(response.parts)
    };
  }
}
