import { useEffect, useState, type FormEvent } from "react";
import { type EventDto, type EventPayload } from "./api";
import AppTopBar from "./components/app/AppTopBar";
import SuccessToast from "./components/app/SuccessToast";
import EventsSection from "./components/events/EventsSection";
import EventForm from "./components/events/EventForm";
import DeleteEventModal from "./components/modals/DeleteEventModal";
import EventDetailsModal from "./components/modals/EventDetailsModal";
import RegisterUserModal from "./components/modals/RegisterUserModal";
import RegistrationsModal from "./components/modals/RegistrationsModal";
import { useEventFormBlink } from "./hooks/useEventFormBlink";
import { useEventHighlight } from "./hooks/useEventHighlight";
import { useTimedMessage } from "./hooks/useTimedMessage";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { createEventThunk, deleteEventThunk, fetchEvents, updateEventThunk } from "./store/eventsSlice";
import { toDateTimeLocalValue } from "./utils/dateTime";
import "./components/app/AppShell.css";

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

export default function App() {
  const dispatch = useAppDispatch();
  const events = useAppSelector((state) => state.events.items);
  const eventsError = useAppSelector((state) => state.events.error);
  const { eventFormContainerRef, isFormBlinking, focusAndBlinkEventForm } = useEventFormBlink(1000);
  const { message: successMessage, showMessage: showSuccessMessage, clearMessage: clearSuccessMessage } = useTimedMessage(2300);
  const { highlightedEventId, highlightEvent } = useEventHighlight(1100);
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
  const [eventToDelete, setEventToDelete] = useState<EventDto | null>(null);
  const [detailsEvent, setDetailsEvent] = useState<EventDto | null>(null);

  useEffect(() => {
    void dispatch(fetchEvents());
  }, [dispatch]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

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
      highlightEvent(savedEvent);
    } catch (e) {
      clearSuccessMessage();
      console.error(e);
    }
  }

  function openRegistrationsModal(evt: EventDto) {
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
    <div className="app-shell">
      <AppTopBar
        theme={theme}
        options={availableThemes}
        onThemeChange={(nextTheme) => setTheme(nextTheme as ThemeName)}
      />

      <div ref={eventFormContainerRef} className={isFormBlinking ? "event-form-is-highlighted" : ""}>
        <EventForm form={form} isEditing={editId !== null} onSubmit={submit} onFormChange={setForm} />
      </div>

      <SuccessToast message={successMessage} />

      {eventsError && <p className="ui-error">{eventsError}</p>}

      <EventsSection
        events={events}
        highlightedEventId={highlightedEventId}
        onOpenDetails={openEventDetails}
        onEdit={(event) => {
          startEditingEvent(event, toDateTimeLocalValue(event.date));
          focusAndBlinkEventForm();
        }}
        onDelete={requestDeleteEvent}
        onRegister={openRegisterModal}
        onViewUsers={openRegistrationsModal}
      />

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