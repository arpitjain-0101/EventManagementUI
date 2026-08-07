import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  type EventDto,
  type EventPayload
} from "./api";
import DeleteEventModal from "./components/DeleteEventModal";
import EventCard from "./components/EventCard";
import EventDetailsModal from "./components/EventDetailsModal";
import EventForm from "./components/EventForm";
import RegisterUserModal from "./components/RegisterUserModal";
import RegistrationsModal from "./components/RegistrationsModal";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { createEventThunk, deleteEventThunk, fetchEvents, updateEventThunk } from "./store/eventsSlice";
import "./App.css";

const blank: EventPayload = { title: "", description: "", date: "", maxCapacity: 10 };
const THEME_STORAGE_KEY = "event-app-theme";

type ThemeName = "dark" | "light" | "teal-green" | "teal-green-light" | "sunset";

const availableThemes: Array<{ value: ThemeName; label: string }> = [
  { value: "teal-green-light", label: "Teal Green Light" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "teal-green", label: "Teal Green" },
  { value: "sunset", label: "Sunset" }
];

type IconDefinition = {
  viewBox: [number, number, number, number];
  path: string;
};

const byPrefixAndName: { fas: Record<string, IconDefinition> } = {
  fas: {
    xmark: {
      viewBox: [0, 0, 384, 512],
      path: "M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
    }
  }
};

function FontAwesomeIcon({ icon, className }: { icon: IconDefinition; className?: string }) {
  const [minX, minY, width, height] = icon.viewBox;
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={className}
      viewBox={`${minX} ${minY} ${width} ${height}`}
      fill="currentColor"
    >
      <path d={icon.path} />
    </svg>
  );
}

function toDateTimeLocalValue(value?: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
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
  const [registerEvent, setRegisterEvent] = useState<EventDto | null>(null);
  const [isFormBlinking, setIsFormBlinking] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [eventToDelete, setEventToDelete] = useState<EventDto | null>(null);
  const [highlightedEventId, setHighlightedEventId] = useState<string | null>(null);
  const [detailsEvent, setDetailsEvent] = useState<EventDto | null>(null);

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
  }

  function closeRegistrationsModal() {
    setActiveEvent(null);
  }

  function openRegisterModal(evt: EventDto) {
    setRegisterEvent(evt);
  }

  function closeRegisterModal() {
    setRegisterEvent(null);
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

  function openEventDetails(evt: EventDto) {
    setDetailsEvent(evt);
  }

  function closeEventDetails() {
    setDetailsEvent(null);
  }

  function cancelDeleteEvent() {
    setEventToDelete(null);
  }

  async function confirmDeleteEvent(event: EventDto) {
    try {
      await dispatch(deleteEventThunk(event.id)).unwrap();
      setEventToDelete(null);
      showSuccessMessage("Event Deleted !!");
    } catch (e) {
      console.error(e);
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
                    openEventDetails(event);
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

      <EventDetailsModal event={detailsEvent} onClose={closeEventDetails} />

      <RegistrationsModal
        activeEvent={activeEvent}
        onClose={closeRegistrationsModal}
        onUsersChanged={async () => {
          await dispatch(fetchEvents()).unwrap();
        }}
      />

      <RegisterUserModal
        registerEvent={registerEvent}
        onClose={closeRegisterModal}
        onRegistered={async () => {
          await dispatch(fetchEvents()).unwrap();
        }}
      />

      <DeleteEventModal eventToDelete={eventToDelete} onCancel={cancelDeleteEvent} onConfirm={confirmDeleteEvent} />
    </div>
  );
}