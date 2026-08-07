import { useEffect, useRef } from "react";
import type { EventDto } from "../api";
import { toDateTimeLocalValue } from "../utils/dateTime";
import EventCard from "./EventCard";
import "./EventsSection.css";

interface EventsSectionProps {
  events: EventDto[];
  highlightedEventId: string | null;
  onOpenDetails: (event: EventDto) => void;
  onEdit: (event: EventDto) => void;
  onDelete: (event: EventDto) => void;
  onRegister: (event: EventDto) => void;
  onViewUsers: (event: EventDto) => void;
}

export default function EventsSection({
  events,
  highlightedEventId,
  onOpenDetails,
  onEdit,
  onDelete,
  onRegister,
  onViewUsers
}: EventsSectionProps) {
  const eventCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!highlightedEventId) return;
    const highlightedCard = eventCardRefs.current[highlightedEventId];
    if (!highlightedCard) return;
    highlightedCard.scrollIntoView({ behavior: "smooth", block: "center" });
    highlightedCard.focus();
  }, [events, highlightedEventId]);

  return (
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
                highlightedEventId === String(evt.id)
                  ? "event-card-focus-target event-card-highlight"
                  : "event-card-focus-target"
              }
            >
              <EventCard
                event={evt}
                dateValue={toDateTimeLocalValue(evt.date)}
                onOpenDetails={onOpenDetails}
                onEdit={onEdit}
                onDelete={onDelete}
                onRegister={onRegister}
                onViewUsers={onViewUsers}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
