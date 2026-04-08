export interface GoogleCalendarEventTime {
  dateTime?: string;
  date?: string;
  timeZone?: string;
}

export interface GoogleCalendarPerson {
  email: string;
  self?: boolean;
  displayName?: string;
  organizer?: boolean;
}

export interface GoogleCalendarAttendee {
  email: string;
  self?: boolean;
  displayName?: string;
  organizer?: boolean;
  responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
  optional?: boolean;
  comment?: string;
}

export interface GoogleCalendarEvent {
  kind: string;
  id: string;
  status: string;
  summary: string;
  description?: string;
  location?: string;
  htmlLink?: string;
  colorId?: string;
  created?: string;
  updated?: string;
  creator?: GoogleCalendarPerson;
  organizer?: GoogleCalendarPerson;
  start: GoogleCalendarEventTime;
  end: GoogleCalendarEventTime;
  eventType: string;
  hangoutLink?: string;
  attendees?: GoogleCalendarAttendee[];
  recurringEventId?: string;
}

export interface GoogleCalendarEventsResponse {
  kind: string;
  summary: string;
  updated: string;
  timeZone: string;
  accessRole?: string;
  nextSyncToken?: string;
  nextPageToken?: string;
  items: GoogleCalendarEvent[];
}

export interface GoogleUser {
  name: string;
  email: string;
  picture: string | null;
}
