const API_BASE = import.meta.env.VITE_API_URL;

if (!API_BASE) {
  throw new Error("Missing VITE_API_URL environment variable");
}

export type EventId = number | string;

export interface EventPayload {
  title: string;
  description: string;
  date: string;
  maxCapacity: number;
}

export interface EventDto extends EventPayload {
  id: EventId;
  currentRegistrations?: number;
}

export interface EventRegistrationDto {
  userId: string;
  name: string;
  email: string;
}

export interface CreateEventRegistrationPayload {
  userId: string;
  name: string;
  email: string;
}

export type EventsResponse = EventDto[] | { events: EventDto[] };

export async function getEvents(): Promise<EventsResponse> {
  const res = await fetch(`${API_BASE}/api/events`);
  if (!res.ok) throw new Error("Failed to fetch events");
  return (await res.json()) as EventsResponse;
}

export async function createEvent(payload: EventPayload): Promise<EventDto> {
  const res = await fetch(`${API_BASE}/api/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as EventDto;
}

export async function updateEvent(id: EventId, payload: EventPayload): Promise<EventDto> {
  const res = await fetch(`${API_BASE}/api/events/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as EventDto;
}

export async function deleteEvent(id: EventId): Promise<void> {
  const res = await fetch(`${API_BASE}/api/events/${id}`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) throw new Error("Delete failed");
}

export async function register(eventId: EventId, payload: CreateEventRegistrationPayload): Promise<void> {
  const res = await fetch(`${API_BASE}/api/events/${eventId}/registrations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function getEventRegistrations(eventId: EventId): Promise<EventRegistrationDto[]> {
  const res = await fetch(`${API_BASE}/api/events/${eventId}/registrations`);
  if (!res.ok) throw new Error(await res.text());

  const data = (await res.json()) as unknown;
  if (Array.isArray(data)) return data as EventRegistrationDto[];

  if (data && typeof data === "object") {
    const objectData = data as { registrations?: EventRegistrationDto[]; users?: EventRegistrationDto[] };
    if (Array.isArray(objectData.registrations)) return objectData.registrations;
    if (Array.isArray(objectData.users)) return objectData.users;
  }

  return [];
}

export async function deleteEventRegistration(eventId: EventId, userId: string): Promise<void> {
  const res = await fetch(
    `${API_BASE}/api/events/${eventId}/registrations/${encodeURIComponent(userId)}`,
    { method: "DELETE" }
  );
  if (!res.ok && res.status !== 204) throw new Error(await res.text());
}

export async function unregister(eventId: EventId, userId: string): Promise<void> {
  await deleteEventRegistration(eventId, userId);
}
