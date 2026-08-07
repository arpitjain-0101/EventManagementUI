import { useState } from "react";
import type { EventDto } from "../api";

interface DeleteEventModalProps {
  eventToDelete: EventDto | null;
  onCancel: () => void;
  onConfirm: (event: EventDto) => Promise<void>;
}

export default function DeleteEventModal({ eventToDelete, onCancel, onConfirm }: DeleteEventModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!eventToDelete) return null;

  async function handleConfirmDelete() {
    if (!eventToDelete) return;
    setIsSubmitting(true);
    try {
      await onConfirm(eventToDelete);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Confirm delete event">
      <div className="modal-panel modal-panel-compact">
        <div className="modal-header">
          <h3>Confirm Deletion</h3>
        </div>

        <p className="confirm-delete-message">
          Are you sure you want to delete <b>{eventToDelete.title}</b>?
        </p>

        <div className="confirm-delete-actions">
          <button type="button" className="ghost-btn" onClick={onCancel} disabled={isSubmitting}>
            No
          </button>
          <button
            type="button"
            className="event-action-btn-danger"
            onClick={() => {
              void handleConfirmDelete();
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Deleting..." : "Yes"}
          </button>
        </div>
      </div>
    </div>
  );
}
