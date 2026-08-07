import { useEffect, useRef, useState } from "react";
import { deleteEventRegistration, getEventRegistrations, type EventDto, type EventRegistrationDto } from "../api";
import "./ModalCommon.css";
import "./RegistrationsModal.css";

type IconDefinition = {
  viewBox: [number, number, number, number];
  path: string;
};

const byPrefixAndName: { fas: Record<string, IconDefinition> } = {
  fas: {
    xmark: {
      viewBox: [0, 0, 384, 512],
      path: "M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
    },
    trash: {
      viewBox: [0, 0, 448, 512],
      path: "M135.2 17.7C140.6 7.1 151.5 0 163.3 0H284.7c11.8 0 22.7 7.1 28.1 17.7L328 48H432c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H16C7.2 112 0 104.8 0 96V64C0 55.2 7.2 48 16 48H120L135.2 17.7zM53.2 467c1.7 25.4 22.8 45 48.2 45H346.6c25.4 0 46.5-19.6 48.2-45L416 128H32L53.2 467z"
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

interface RegistrationsModalProps {
  activeEvent: EventDto | null;
  onClose: () => void;
  onUsersChanged?: () => void | Promise<void>;
}

export default function RegistrationsModal({
  activeEvent,
  onClose,
  onUsersChanged
}: RegistrationsModalProps) {
  const [registrations, setRegistrations] = useState<EventRegistrationDto[]>([]);
  const [registrationsError, setRegistrationsError] = useState("");
  const [isRegistrationsLoading, setIsRegistrationsLoading] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const requestRef = useRef(0);

  useEffect(() => {
    if (!activeEvent) {
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
        const users = await getEventRegistrations(activeEvent.id);
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
  }, [activeEvent]);

  if (!activeEvent) return null;

  async function removeUserFromEvent(userId: string) {
    if (!activeEvent) return;

    try {
      setRemovingUserId(userId);
      await deleteEventRegistration(activeEvent.id, userId);
      setRegistrations((prev) => prev.filter((user) => user.userId !== userId));
      await onUsersChanged?.();
    } catch (error) {
      setRegistrationsError(error instanceof Error ? error.message : String(error));
    } finally {
      setRemovingUserId(null);
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Event users">
      <div className="modal-panel">
        <div className="modal-header">
          <h3>
            Attendees List | <span className="modal-event-tag">{activeEvent.title}</span>
          </h3>
          <div className="modal-header-actions">
            <button type="button" className="ui-btn-ghost modal-close-btn" aria-label="Close" title="Close" onClick={onClose}>
              <FontAwesomeIcon icon={byPrefixAndName.fas["xmark"]} className="modal-close-icon" />
            </button>
          </div>
        </div>

        {registrationsError && <p className="ui-error">{registrationsError}</p>}
        {isRegistrationsLoading && <p>Loading users...</p>}

        {!isRegistrationsLoading && (
          <div className="modal-users-grid" role="table" aria-label="Registered users">
            <div className="modal-users-grid-row modal-users-grid-head" role="row">
              <div role="columnheader">UserId</div>
              <div role="columnheader">Name</div>
              <div role="columnheader">Email</div>
              <div role="columnheader">Actions</div>
            </div>

            {registrations.length === 0 ? (
              <div className="modal-users-grid-empty">No users registered for this event.</div>
            ) : (
              registrations.map((user) => (
                <div className="modal-users-grid-row" role="row" key={user.userId}>
                  <div role="cell">{user.userId || "-"}</div>
                  <div role="cell">{user.name || "-"}</div>
                  <div role="cell">{user.email || "-"}</div>
                  <div role="cell">
                    <button
                      type="button"
                      className="modal-danger-icon-btn"
                      aria-label={`Delete ${user.userId} from event`}
                      title="Delete user from event"
                      disabled={removingUserId === user.userId}
                      onClick={() => {
                        void removeUserFromEvent(user.userId);
                      }}
                    >
                      <FontAwesomeIcon icon={byPrefixAndName.fas["trash"]} className="modal-danger-icon-svg" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
