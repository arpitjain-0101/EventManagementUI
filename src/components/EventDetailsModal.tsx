import { useEffect, useRef, useState } from "react";
import { getEventRegistrations, type EventDto, type EventRegistrationDto } from "../api";
import "./EventDetailsModal.css";
import "./ModalCommon.css";

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

interface EventDetailsModalProps {
  event: EventDto | null;
  onClose: () => void;
}

export default function EventDetailsModal({ event, onClose }: EventDetailsModalProps) {
  const [registrations, setRegistrations] = useState<EventRegistrationDto[]>([]);
  const [registrationsError, setRegistrationsError] = useState("");
  const [isRegistrationsLoading, setIsRegistrationsLoading] = useState(false);
  const requestRef = useRef(0);

  useEffect(() => {
    if (!event) {
      setRegistrations([]);
      setRegistrationsError("");
      setIsRegistrationsLoading(false);
      return;
    }

    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    setRegistrations([]);
    setRegistrationsError("");
    setIsRegistrationsLoading(true);

    void (async () => {
      try {
        const users = await getEventRegistrations(event.id);
        if (requestRef.current !== requestId) return;
        setRegistrations(users);
      } catch (error) {
        if (requestRef.current !== requestId) return;
        setRegistrationsError(error instanceof Error ? error.message : String(error));
      } finally {
        if (requestRef.current !== requestId) return;
        setIsRegistrationsLoading(false);
      }
    })();
  }, [event]);

  if (!event) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Event details" onClick={onClose}>
      <div
        className="modal-panel modal-panel-compact event-details-modal"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="modal-header">
          <h3>
            Event Details | <span className="modal-event-tag">{event.title}</span>
          </h3>
          <div className="modal-header-actions">
            <button
              type="button"
              className="ui-btn-ghost modal-close-btn"
              aria-label="Close"
              title="Close"
              onClick={onClose}
            >
              <FontAwesomeIcon icon={byPrefixAndName.fas["xmark"]} className="modal-close-icon" />
            </button>
          </div>
        </div>

        <p className="event-details-description">{event.description || "-"}</p>

        <div className="event-details-grid" role="table" aria-label="Event information">
          <div className="event-details-row" role="row">
            <span className="event-details-label" role="columnheader">
              Date
            </span>
            <span className="event-details-value" role="cell">
              {formatEventDateTimeForModal(event.date).date}
            </span>
          </div>
          <div className="event-details-row" role="row">
            <span className="event-details-label" role="columnheader">
              Time
            </span>
            <span className="event-details-value" role="cell">
              {formatEventDateTimeForModal(event.date).time}
            </span>
          </div>
          <div className="event-details-row" role="row">
            <span className="event-details-label" role="columnheader">
              Capacity
            </span>
            <span className="event-details-value" role="cell">
              {event.currentRegistrations ?? 0}/{event.maxCapacity ?? 0}
            </span>
          </div>
        </div>

        <div className="event-details-attendees">
          <h4 className="event-details-attendees-title">Attendees ({registrations.length})</h4>

          {registrationsError && <p className="ui-error">{registrationsError}</p>}
          {isRegistrationsLoading && <p className="event-details-loading">Loading attendees...</p>}

          {!isRegistrationsLoading && !registrationsError &&
            (registrations.length === 0 ? (
              <p className="event-details-empty">No attendees registered yet.</p>
            ) : (
              <div className="event-details-attendees-list" role="list" aria-label="Attendees list">
                {registrations.map((user) => (
                  <div className="event-details-attendee" role="listitem" key={user.userId}>
                    <p className="event-details-attendee-name">{user.name || "-"}</p>
                    <p className="event-details-attendee-meta">
                      {user.userId || "-"} | {user.email || "-"}
                    </p>
                  </div>
                ))}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
