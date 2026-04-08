export interface GoogleCalendarEventTime {
  dateTime: string;
  timeZone: string;
}

export interface GoogleCalendarPerson {
  email: string;
  self?: boolean;
}

export interface GoogleCalendarEvent {
  kind: string;
  id: string;
  status: string;
  summary: string;
  description?: string;
  location?: string;
  htmlLink?: string;
  created?: string;
  updated?: string;
  creator?: GoogleCalendarPerson;
  organizer?: GoogleCalendarPerson;
  start: GoogleCalendarEventTime;
  end: GoogleCalendarEventTime;
  eventType: string;
}

export interface GoogleCalendarEventsResponse {
  kind: string;
  summary: string;
  updated: string;
  timeZone: string;
  accessRole?: string;
  nextSyncToken?: string;
  items: GoogleCalendarEvent[];
}

export interface GoogleUser {
  name: string;
  email: string;
  picture: string | null;
}
