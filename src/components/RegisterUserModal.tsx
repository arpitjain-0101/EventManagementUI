import type { FormEvent } from "react";
import type { CreateEventRegistrationPayload, EventDto } from "../api";

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

interface RegisterUserModalProps {
  registerEvent: EventDto | null;
  registrationForm: CreateEventRegistrationPayload;
  registrationError: string;
  isSubmittingRegistration: boolean;
  onClose: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onFormChange: (next: CreateEventRegistrationPayload) => void;
}

const registrationMockSamples: CreateEventRegistrationPayload[] = [
  { userId: "u_alex_101", name: "Alex Carter", email: "alex.carter@example.com" },
  { userId: "u_priya_214", name: "Priya Nair", email: "priya.nair@example.com" },
  { userId: "u_miguel_330", name: "Miguel Santos", email: "miguel.santos@example.com" },
  { userId: "u_zoe_442", name: "Zoe Kim", email: "zoe.kim@example.com" },
  { userId: "u_liam_557", name: "Liam O'Brien", email: "liam.obrien@example.com" },
  { userId: "u_noah_608", name: "Noah Green", email: "noah.green@example.com" },
  { userId: "u_aniya_719", name: "Aniya Brooks", email: "aniya.brooks@example.com" },
  { userId: "u_kenji_826", name: "Kenji Watanabe", email: "kenji.watanabe@example.com" }
];

export default function RegisterUserModal({
  registerEvent,
  registrationForm,
  registrationError,
  isSubmittingRegistration,
  onClose,
  onSubmit,
  onFormChange
}: RegisterUserModalProps) {
  if (!registerEvent) return null;

  function fillMockRegistration() {
    const randomSample =
      registrationMockSamples[Math.floor(Math.random() * registrationMockSamples.length)] ??
      registrationMockSamples[0];

    onFormChange({
      userId: randomSample.userId,
      name: randomSample.name,
      email: randomSample.email
    });
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Register user">
      <div className="modal-panel modal-panel-compact">
        <div className="modal-header">
          <h3>Register user for {registerEvent.title}</h3>
          <div className="modal-header-actions">
            <button type="button" className="mock-btn modal-mock-btn" onClick={fillMockRegistration}>
              Mock
            </button>
            <button type="button" className="ghost-btn modal-close-btn" aria-label="Close" title="Close" onClick={onClose}>
              <FontAwesomeIcon icon={byPrefixAndName.fas["xmark"]} className="modal-close-icon" />
            </button>
          </div>
        </div>

        <form className="modal-form" onSubmit={onSubmit}>
          <label>
            UserID
            <input
              required
              value={registrationForm.userId}
              onChange={(e) =>
                onFormChange({
                  ...registrationForm,
                  userId: e.target.value
                })
              }
            />
          </label>

          <label>
            Name
            <input
              required
              value={registrationForm.name}
              onChange={(e) =>
                onFormChange({
                  ...registrationForm,
                  name: e.target.value
                })
              }
            />
          </label>

          <label>
            Email
            <input
              required
              type="email"
              value={registrationForm.email}
              onChange={(e) =>
                onFormChange({
                  ...registrationForm,
                  email: e.target.value
                })
              }
            />
          </label>

          {registrationError && <p className="error">{registrationError}</p>}

          <button type="submit" disabled={isSubmittingRegistration}>
            {isSubmittingRegistration ? "Enrolling..." : "Enroll"}
          </button>
        </form>
      </div>
    </div>
  );
}
