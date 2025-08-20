import { env } from '@/config/env';
import type {
  DatabuddyAnalyticsResponse,
  DatabuddyErrorResponse,
  DatabuddyEventsResponse,
  DatabuddyWebsiteDetailsResponse,
  DatabuddyWebsitesResponse,
} from '@/types/databuddy';

const BASE_URL = 'https://api.databuddy.cc/v1';

class DatabuddyAPI {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = env.DATABUDDY_API_KEY;
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    if (!this.apiKey) {
      throw new Error('Databuddy API key not configured');
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'X-Api-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!data.success) {
      const error = data as DatabuddyErrorResponse;
      throw new Error(`API Error: ${error.error.message}`);
    }

    return data as T;
  }

  async getWebsites(): Promise<DatabuddyWebsitesResponse> {
    return this.makeRequest<DatabuddyWebsitesResponse>('/websites');
  }

  async getWebsiteDetails(
    websiteId: string
  ): Promise<DatabuddyWebsiteDetailsResponse> {
    return this.makeRequest<DatabuddyWebsiteDetailsResponse>(
      `/websites/${websiteId}`
    );
  }

  async getAnalytics(
    websiteId: string,
    options?: {
      startDate?: string;
      endDate?: string;
      granularity?: 'hour' | 'day' | 'week' | 'month';
      metrics?: string;
    }
  ): Promise<DatabuddyAnalyticsResponse> {
    const params = new URLSearchParams();
    if (options?.startDate) params.append('start_date', options.startDate);
    if (options?.endDate) params.append('end_date', options.endDate);
    if (options?.granularity) params.append('granularity', options.granularity);
    if (options?.metrics) params.append('metrics', options.metrics);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.makeRequest<DatabuddyAnalyticsResponse>(
      `/websites/${websiteId}/analytics${query}`
    );
  }

  async getEvents(
    websiteId: string,
    options?: {
      eventName?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<DatabuddyEventsResponse> {
    const params = new URLSearchParams();
    if (options?.eventName) params.append('event_name', options.eventName);
    if (options?.startDate) params.append('start_date', options.startDate);
    if (options?.endDate) params.append('end_date', options.endDate);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.makeRequest<DatabuddyEventsResponse>(
      `/websites/${websiteId}/events${query}`
    );
  }

  async askAssistant(
    websiteId: string,
    message: string,
    context?: {
      dateRange?: {
        start: string;
        end: string;
      };
    }
  ): Promise<{ type: string; content: string; data?: unknown }> {
    if (!this.apiKey) {
      throw new Error('Databuddy API key not configured');
    }

    const response = await fetch(
      `${BASE_URL}/websites/${websiteId}/assistant/chat`,
      {
        method: 'POST',
        headers: {
          'X-Api-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `AI Assistant Error: ${data.error?.message || 'Unknown error'}`
      );
    }

    return data;
  }
}

export const databuddyAPI = new DatabuddyAPI();
