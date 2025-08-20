export type DatabuddyAnalyticsResponse = {
  success: boolean;
  data: {
    summary: {
      pageviews: number;
      visitors: number;
      sessions: number;
      bounce_rate: number;
      avg_session_duration: number;
    };
    events_by_date: Array<{
      date: string;
      pageviews: number;
      visitors: number;
      sessions: number;
    }>;
    top_pages: Array<{
      path: string;
      pageviews: number;
      visitors: number;
    }>;
    top_referrers: Array<{
      referrer: string;
      visitors: number;
      percentage: number;
    }>;
    countries: Array<{
      country: string;
      visitors: number;
      percentage: number;
    }>;
    devices: Array<{
      device_type: string;
      visitors: number;
      percentage: number;
    }>;
    browsers: Array<{
      browser_name: string;
      visitors: number;
      percentage: number;
    }>;
  };
};

export type DatabuddyWebsitesResponse = {
  success: boolean;
  data: Array<{
    id: string;
    name: string;
    domain: string;
    created_at: string;
    verified: boolean;
  }>;
};

export type DatabuddyWebsiteDetailsResponse = {
  success: boolean;
  data: {
    id: string;
    name: string;
    domain: string;
    created_at: string;
    verified: boolean;
    tracking_code: string;
    monthly_pageviews: number;
  };
};

export type DatabuddyEventsResponse = {
  success: boolean;
  data: {
    events: Array<{
      event_name: string;
      count: number;
      unique_users: number;
    }>;
    events_over_time: Array<{
      date: string;
      [key: string]: number | string;
    }>;
  };
};

export type DatabuddyErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details: Record<string, unknown>;
  };
};

export type DatabuddyAssistantResponse = {
  type: string;
  content: string;
  data?: unknown;
};
