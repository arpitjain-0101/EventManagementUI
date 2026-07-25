import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  deleteEventRegistration,
  getEventRegistrations,
  register,
  type CreateEventRegistrationPayload,
  type EventDto,
  type EventRegistrationDto,
  type EventPayload
} from "./api";
import EventCard from "./components/EventCard";
import EventForm from "./components/EventForm";
import RegisterUserModal from "./components/RegisterUserModal";
import RegistrationsModal from "./components/RegistrationsModal";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { createEventThunk, deleteEventThunk, fetchEvents, updateEventThunk } from "./store/eventsSlice";
import "./App.css";

const blank: EventPayload = { title: "", description: "", date: "", maxCapacity: 10 };
const blankRegistration: CreateEventRegistrationPayload = { userId: "", name: "", email: "" };
const THEME_STORAGE_KEY = "event-app-theme";

type ThemeName = "dark" | "light" | "teal-green" | "teal-green-light" | "sunset";

const availableThemes: Array<{ value: ThemeName; label: string }> = [
  { value: "teal-green-light", label: "Teal Green Light" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "teal-green", label: "Teal Green" },
  { value: "sunset", label: "Sunset" }
];

function toDateTimeLocalValue(value?: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}

function formatEventDateTimeForModal(value?: string): { date: string; time: string } {
  if (!value) {
    return { date: "-", time: "-" };
  }

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    return { date: "-", time: "-" };
  }

  const date = d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const time = d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit"
  });

  return { date, time };
}

export default function App() {
  const dispatch = useAppDispatch();
  const events = useAppSelector((state) => state.events.items);
  const eventsError = useAppSelector((state) => state.events.error);
  const eventFormContainerRef = useRef<HTMLDivElement | null>(null);
  const eventCardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const blinkTimerRef = useRef<number | null>(null);
  const successTimerRef = useRef<number | null>(null);
  const eventCardHighlightTimerRef = useRef<number | null>(null);
  const [theme, setTheme] = useState<ThemeName>(() => {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (
      stored === "dark" ||
      stored === "light" ||
      stored === "teal-green" ||
      stored === "teal-green-light" ||
      stored === "sunset"
    ) {
      return stored;
    }
    return "teal-green-light";
  });
  const [form, setForm] = useState<EventPayload>(blank);
  const [editId, setEditId] = useState<number | string | null>(null);
  const [activeEvent, setActiveEvent] = useState<EventDto | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistrationDto[]>([]);
  const [registrationsError, setRegistrationsError] = useState("");
  const [isRegistrationsLoading, setIsRegistrationsLoading] = useState(false);
  const [registerEvent, setRegisterEvent] = useState<EventDto | null>(null);
  const [registrationForm, setRegistrationForm] = useState<CreateEventRegistrationPayload>(blankRegistration);
  const [registrationError, setRegistrationError] = useState("");
  const [isSubmittingRegistration, setIsSubmittingRegistration] = useState(false);
  const [isFormBlinking, setIsFormBlinking] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [eventToDelete, setEventToDelete] = useState<EventDto | null>(null);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
  const [highlightedEventId, setHighlightedEventId] = useState<string | null>(null);
  const [detailsEvent, setDetailsEvent] = useState<EventDto | null>(null);
  const [detailsRegistrations, setDetailsRegistrations] = useState<EventRegistrationDto[]>([]);
  const [detailsRegistrationsError, setDetailsRegistrationsError] = useState("");
  const [isDetailsRegistrationsLoading, setIsDetailsRegistrationsLoading] = useState(false);
  const detailsRequestRef = useRef(0);

  useEffect(() => {
    void dispatch(fetchEvents());
  }, [dispatch]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    return () => {
      if (blinkTimerRef.current !== null) {
        window.clearTimeout(blinkTimerRef.current);
      }
      if (successTimerRef.current !== null) {
        window.clearTimeout(successTimerRef.current);
      }
      if (eventCardHighlightTimerRef.current !== null) {
        window.clearTimeout(eventCardHighlightTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!highlightedEventId) return;
    const highlightedCard = eventCardRefs.current[highlightedEventId];
    if (!highlightedCard) return;
    highlightedCard.scrollIntoView({ behavior: "smooth", block: "center" });
    highlightedCard.focus();
  }, [events, highlightedEventId]);

  function showSuccessMessage(message: string) {
    setSuccessMessage(message);
    if (successTimerRef.current !== null) {
      window.clearTimeout(successTimerRef.current);
    }
    successTimerRef.current = window.setTimeout(() => {
      setSuccessMessage("");
    }, 2300);
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const isUpdating = editId !== null;
    const payload: EventPayload = {
      title: form.title,
      description: form.description,
      date: new Date(form.date).toISOString(),
      maxCapacity: Number(form.maxCapacity)
    };

    try {
      const savedEvent =
        isUpdating && editId !== null
          ? await dispatch(updateEventThunk({ id: editId, payload })).unwrap()
          : await dispatch(createEventThunk(payload)).unwrap();
      setForm(blank);
      setEditId(null);
      showSuccessMessage(isUpdating ? "Event Updated !!" : "Event Created !!");

      const savedEventKey = String(savedEvent.id);
      setHighlightedEventId(null);
      requestAnimationFrame(() => {
        setHighlightedEventId(savedEventKey);
      });

      if (eventCardHighlightTimerRef.current !== null) {
        window.clearTimeout(eventCardHighlightTimerRef.current);
      }
      eventCardHighlightTimerRef.current = window.setTimeout(() => {
        setHighlightedEventId(null);
      }, 1100);
    } catch (e) {
      setSuccessMessage("");
      console.error(e);
    }
  }

  async function openRegistrationsModal(evt: EventDto) {
    setActiveEvent(evt);
    setRegistrations([]);
    setRegistrationsError("");
    setIsRegistrationsLoading(true);

    try {
      const users = await getEventRegistrations(evt.id);
      setRegistrations(users);
    } catch (e) {
      setRegistrationsError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsRegistrationsLoading(false);
    }
  }

  function closeRegistrationsModal() {
    setActiveEvent(null);
    setRegistrations([]);
    setRegistrationsError("");
    setIsRegistrationsLoading(false);
  }

  async function removeUserFromEvent(userId: string) {
    if (!activeEvent) return;

    try {
      await deleteEventRegistration(activeEvent.id, userId);
      setRegistrations((prev) => prev.filter((user) => user.userId !== userId));
      await dispatch(fetchEvents());
    } catch (e) {
      setRegistrationsError(e instanceof Error ? e.message : String(e));
    }
  }

  function openRegisterModal(evt: EventDto) {
    setRegisterEvent(evt);
    setRegistrationForm(blankRegistration);
    setRegistrationError("");
    setIsSubmittingRegistration(false);
  }

  function closeRegisterModal() {
    setRegisterEvent(null);
    setRegistrationForm(blankRegistration);
    setRegistrationError("");
    setIsSubmittingRegistration(false);
  }

  async function submitRegistration(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!registerEvent) return;

    const payload: CreateEventRegistrationPayload = {
      userId: registrationForm.userId.trim(),
      name: registrationForm.name.trim(),
      email: registrationForm.email.trim()
    };

    if (!payload.userId || !payload.name || !payload.email) {
      setRegistrationError("UserID, Name, and Email are required.");
      return;
    }

    setRegistrationError("");
    setIsSubmittingRegistration(true);
    try {
      await register(registerEvent.id, payload);
      closeRegisterModal();
      await dispatch(fetchEvents());
    } catch (e) {
      setRegistrationError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsSubmittingRegistration(false);
    }
  }

  function startEditingEvent(evt: EventDto, dateValue?: string) {
    setEditId(evt.id);
    setForm({
      title: evt.title ?? "",
      description: evt.description ?? "",
      date: dateValue ?? toDateTimeLocalValue(evt.date),
      maxCapacity: evt.maxCapacity ?? 10
    });
  }

  function focusAndBlinkEventForm() {
    const container = eventFormContainerRef.current;
    if (!container) return;

    container.scrollIntoView({ behavior: "smooth", block: "start" });

    const firstInput = container.querySelector("input, textarea") as HTMLInputElement | HTMLTextAreaElement | null;
    firstInput?.focus();

    setIsFormBlinking(false);
    requestAnimationFrame(() => {
      setIsFormBlinking(true);
    });

    if (blinkTimerRef.current !== null) {
      window.clearTimeout(blinkTimerRef.current);
    }

    blinkTimerRef.current = window.setTimeout(() => {
      setIsFormBlinking(false);
    }, 1000);
  }

  function requestDeleteEvent(evt: EventDto) {
    setEventToDelete(evt);
  }

  async function openEventDetails(evt: EventDto) {
    const requestId = detailsRequestRef.current + 1;
    detailsRequestRef.current = requestId;

    setDetailsEvent(evt);
    setDetailsRegistrations([]);
    setDetailsRegistrationsError("");
    setIsDetailsRegistrationsLoading(true);

    try {
      const users = await getEventRegistrations(evt.id);
      if (detailsRequestRef.current !== requestId) return;
      setDetailsRegistrations(users);
    } catch (e) {
      if (detailsRequestRef.current !== requestId) return;
      setDetailsRegistrationsError(e instanceof Error ? e.message : String(e));
    } finally {
      if (detailsRequestRef.current !== requestId) return;
      setIsDetailsRegistrationsLoading(false);
    }
  }

  function closeEventDetails() {
    setDetailsEvent(null);
    setDetailsRegistrations([]);
    setDetailsRegistrationsError("");
    setIsDetailsRegistrationsLoading(false);
  }

  function cancelDeleteEvent() {
    if (isDeleteSubmitting) return;
    setEventToDelete(null);
  }

  async function confirmDeleteEvent() {
    if (!eventToDelete) return;
    setIsDeleteSubmitting(true);
    try {
      await dispatch(deleteEventThunk(eventToDelete.id)).unwrap();
      setEventToDelete(null);
      showSuccessMessage("Event Deleted !!");
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleteSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 1000, margin: "20px auto", fontFamily: "Arial" }}>
      <div className="topbar">
        <h1>Event Management System</h1>
        <label className="theme-picker">
          Theme
          <select value={theme} onChange={(e) => setTheme(e.target.value as ThemeName)}>
            {availableThemes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div ref={eventFormContainerRef} className={isFormBlinking ? "event-form-highlight" : ""}>
        <EventForm form={form} isEditing={editId !== null} onSubmit={submit} onFormChange={setForm} />
      </div>

      {successMessage && (
        <div className="success-toast" role="status" aria-live="polite">
          {successMessage}
        </div>
      )}

      {eventsError && <p className="error">{eventsError}</p>}

      <section className="events-panel" aria-label="Events section">
        <h3 className="events-panel-title">Event List</h3>
        {events.length === 0 ? (
          <p className="events-empty">No events available. Create one using the form above.</p>
        ) : (
          <div className="events-grid">
            {events.map((evt) => (
              <div
                key={evt.id}
                ref={(node) => {
                  eventCardRefs.current[String(evt.id)] = node;
                }}
                tabIndex={-1}
                className={
                  highlightedEventId === String(evt.id) ? "event-card-focus-target event-card-highlight" : "event-card-focus-target"
                }
              >
                <EventCard
                  event={evt}
                  dateValue={toDateTimeLocalValue(evt.date)}
                  onOpenDetails={(event) => {
                    void openEventDetails(event);
                  }}
                  onEdit={(event) => {
                    startEditingEvent(event);
                    focusAndBlinkEventForm();
                  }}
                  onDelete={(event) => {
                    requestDeleteEvent(event);
                  }}
                  onRegister={(event) => {
                    openRegisterModal(event);
                  }}
                  onViewUsers={(event) => {
                    void openRegistrationsModal(event);
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {detailsEvent && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Event details"
          onClick={closeEventDetails}
        >
          <div
            className="modal-panel modal-panel-compact event-details-modal"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="modal-header">
              <h3>
                Event Details | <span className="modal-event-tag">{detailsEvent.title}</span>
              </h3>
              <button type="button" className="ghost-btn" onClick={closeEventDetails}>
                Close
              </button>
            </div>

            <p className="event-details-description">{detailsEvent.description || "-"}</p>

            <div className="event-details-grid" role="table" aria-label="Event information">
              <div className="event-details-row" role="row">
                <span className="event-details-label" role="columnheader">
                  Date
                </span>
                <span className="event-details-value" role="cell">
                  {formatEventDateTimeForModal(detailsEvent.date).date}
                </span>
              </div>
              <div className="event-details-row" role="row">
                <span className="event-details-label" role="columnheader">
                  Time
                </span>
                <span className="event-details-value" role="cell">
                  {formatEventDateTimeForModal(detailsEvent.date).time}
                </span>
              </div>
              <div className="event-details-row" role="row">
                <span className="event-details-label" role="columnheader">
                  Capacity
                </span>
                <span className="event-details-value" role="cell">
                  {detailsEvent.currentRegistrations ?? 0}/{detailsEvent.maxCapacity ?? 0}
                </span>
              </div>
            </div>

            <div className="event-details-attendees">
              <h4 className="event-details-attendees-title">Attendees ({detailsRegistrations.length})</h4>

              {detailsRegistrationsError && <p className="error">{detailsRegistrationsError}</p>}
              {isDetailsRegistrationsLoading && <p className="event-details-loading">Loading attendees...</p>}

              {!isDetailsRegistrationsLoading && !detailsRegistrationsError && (
                detailsRegistrations.length === 0 ? (
                  <p className="event-details-empty">No attendees registered yet.</p>
                ) : (
                  <div className="event-details-attendees-list" role="list" aria-label="Attendees list">
                    {detailsRegistrations.map((user) => (
                      <div className="event-details-attendee" role="listitem" key={user.userId}>
                        <p className="event-details-attendee-name">{user.name || "-"}</p>
                        <p className="event-details-attendee-meta">
                          {user.userId || "-"} | {user.email || "-"}
                        </p>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      <RegistrationsModal
        activeEvent={activeEvent}
        registrations={registrations}
        registrationsError={registrationsError}
        isRegistrationsLoading={isRegistrationsLoading}
        onClose={closeRegistrationsModal}
        onRemoveUser={(userId) => {
          void removeUserFromEvent(userId);
        }}
      />

      <RegisterUserModal
        registerEvent={registerEvent}
        registrationForm={registrationForm}
        registrationError={registrationError}
        isSubmittingRegistration={isSubmittingRegistration}
        onClose={closeRegisterModal}
        onSubmit={submitRegistration}
        onFormChange={setRegistrationForm}
      />

      {eventToDelete && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Confirm delete event">
          <div className="modal-panel modal-panel-compact">
            <div className="modal-header">
              <h3>Confirm Deletion</h3>
            </div>

            <p className="confirm-delete-message">Are you sure you want to delete <b>{eventToDelete.title}</b>?</p>

            <div className="confirm-delete-actions">
              <button type="button" className="ghost-btn" onClick={cancelDeleteEvent} disabled={isDeleteSubmitting}>
                No
              </button>
              <button
                type="button"
                className="event-action-btn-danger"
                onClick={() => {
                  void confirmDeleteEvent();
                }}
                disabled={isDeleteSubmitting}
              >
                {isDeleteSubmitting ? "Deleting..." : "Yes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}