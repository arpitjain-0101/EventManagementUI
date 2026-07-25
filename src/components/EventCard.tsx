import type { EventDto } from "../api";

type IconDefinition = {
  viewBox: [number, number, number, number];
  path: string;
};

const byPrefixAndName: { fas: Record<string, IconDefinition> } = {
  fas: {
    "address-card": {
      viewBox: [0, 0, 576, 512],
      path: "M528 64H48C21.5 64 0 85.5 0 112V400C0 426.5 21.5 448 48 448H528C554.5 448 576 426.5 576 400V112C576 85.5 554.5 64 528 64zM224 384H64V352C64 307.8 99.8 272 144 272S224 307.8 224 352V384zM144 256C108.7 256 80 227.3 80 192S108.7 128 144 128S208 156.7 208 192S179.3 256 144 256zM512 368C512 376.8 504.8 384 496 384H272C263.2 384 256 376.8 256 368V336C256 327.2 263.2 320 272 320H496C504.8 320 512 327.2 512 336V368zM512 240C512 248.8 504.8 256 496 256H272C263.2 256 256 248.8 256 240V208C256 199.2 263.2 192 272 192H496C504.8 192 512 199.2 512 208V240z"
    },
    "user-plus": {
      viewBox: [0, 0, 640, 512],
      path: "M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zM96 288C43 288 0 331 0 384c0 70.7 57.3 128 128 128H320c17.7 0 32-14.3 32-32V448H128c-35.3 0-64-28.7-64-64s28.7-64 64-64H336c8.8 0 16-7.2 16-16s-7.2-16-16-16H96zm384 0c-17.7 0-32 14.3-32 32v64H384c-17.7 0-32 14.3-32 32s14.3 32 32 32h64v64c0 17.7 14.3 32 32 32s32-14.3 32-32V448h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H512V320c0-17.7-14.3-32-32-32z"
    },
    trash: {
      viewBox: [0, 0, 448, 512],
      path: "M135.2 17.7C140.6 7.1 151.5 0 163.3 0H284.7c11.8 0 22.7 7.1 28.1 17.7L328 48H432c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H16C7.2 112 0 104.8 0 96V64C0 55.2 7.2 48 16 48H120L135.2 17.7zM53.2 467c1.7 25.4 22.8 45 48.2 45H346.6c25.4 0 46.5-19.6 48.2-45L416 128H32L53.2 467z"
    },
    "pen-to-square": {
      viewBox: [0, 0, 512, 512],
      path: "M362.7 19.3C387.7-5.7 428.3-5.7 453.3 19.3L492.7 58.7C517.7 83.7 517.7 124.3 492.7 149.3L244.1 397.9c-9 9-20.3 15.4-32.8 18.5L128 437.3c-8.4 2.1-17.2-.4-23.2-6.4s-8.5-14.8-6.4-23.2l20.8-83.3c3.1-12.5 9.5-23.8 18.5-32.8L362.7 19.3zM80 64C35.8 64 0 99.8 0 144V432c0 44.2 35.8 80 80 80H368c44.2 0 80-35.8 80-80V336c0-17.7-14.3-32-32-32s-32 14.3-32 32V432c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V144c0-8.8 7.2-16 16-16H176c17.7 0 32-14.3 32-32S193.7 64 176 64H80z"
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

interface EventCardProps {
  event: EventDto;
  dateValue: string;
  onOpenDetails: (event: EventDto) => void;
  onEdit: (event: EventDto) => void;
  onDelete: (event: EventDto) => void;
  onRegister: (event: EventDto) => void;
  onViewUsers: (event: EventDto) => void;
}

type FormattedDateParts = {
  text: string;
  day: string;
  suffix: string;
  monthYear: string;
};

function formatDateAndTime(value: string): { date: FormattedDateParts; time: string } {
  const fallbackDate: FormattedDateParts = {
    text: "-",
    day: "",
    suffix: "",
    monthYear: ""
  };

  if (!value || !value.includes("T")) {
    return { date: fallbackDate, time: "-" };
  }

  const [datePart, timePartRaw] = value.split("T");
  const timePart = (timePartRaw ?? "").slice(0, 5);
  const [hoursRaw, minutes] = timePart.split(":");
  const hours24 = Number(hoursRaw);

  if (!Number.isFinite(hours24) || !minutes) {
    return {
      date: {
        text: datePart || "-",
        day: "",
        suffix: "",
        monthYear: ""
      },
      time: "-"
    };
  }

  const suffix = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;

  const [yearRaw, monthRaw, dayRaw] = datePart.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);

  const isValidDateParts = Number.isInteger(year) && Number.isInteger(month) && Number.isInteger(day);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  const getOrdinalSuffix = (n: number): string => {
    const mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 13) {
      return "th";
    }

    switch (n % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  const hasRichFormat = isValidDateParts && month >= 1 && month <= 12 && day >= 1 && day <= 31;
  const ordinalSuffix = getOrdinalSuffix(day);

  const formattedDateText =
    hasRichFormat
      ? `${day}${ordinalSuffix} ${monthNames[month - 1]} ${year}`
      : datePart || "-";

  const formattedDate: FormattedDateParts =
    isValidDateParts && month >= 1 && month <= 12 && day >= 1 && day <= 31
      ? {
          text: formattedDateText,
          day: String(day),
          suffix: ordinalSuffix,
          monthYear: `${monthNames[month - 1]} ${year}`
        }
      : {
          text: formattedDateText,
          day: "",
          suffix: "",
          monthYear: ""
        };

  return {
    date: formattedDate,
    time: `${hours12}:${minutes} ${suffix}`
  };
}

export default function EventCard({
  event,
  dateValue,
  onOpenDetails,
  onEdit,
  onDelete,
  onRegister,
  onViewUsers
}: EventCardProps) {
  const { date, time } = formatDateAndTime(dateValue);

  return (
    <div
      className="event-card event-card-clickable"
      role="button"
      tabIndex={0}
      onClick={() => {
        onOpenDetails(event);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenDetails(event);
        }
      }}
    >
      <div className="event-card-header">
        <h3 className="event-title">{event.title}</h3>
      </div>

      <div className="event-card-body">
        <p className="event-meta-line">
          <span className="event-meta-value">{event.description || "-"}</span>
        </p>

        <div className="event-facts">
          <p className="event-meta-line">
            <span className="event-tag">Date</span>
            <span className="event-meta-value">
              {date.day && date.suffix && date.monthYear ? (
                <>
                  {date.day}
                  <sup className="event-date-suffix">{date.suffix}</sup> {date.monthYear}
                </>
              ) : (
                date.text
              )}
            </span>
          </p>
          <p className="event-meta-line">
            <span className="event-tag">Time</span>
            <span className="event-meta-value">{time}</span>
          </p>
          <p className="event-meta-line">
            <span className="event-tag">Capacity</span>
            <span className="event-meta-value event-capacity">
              {event.currentRegistrations ?? 0}/{event.maxCapacity ?? 0}
            </span>
          </p>
        </div>
      </div>

      <div className="event-card-footer event-actions">
        <button
          type="button"
          className="event-action-btn"
          aria-label="Edit event"
          title="Edit"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(event);
          }}
        >
          <FontAwesomeIcon icon={byPrefixAndName.fas["pen-to-square"]} className="event-action-icon" />
        </button>
        <button
          type="button"
          className="event-action-btn event-action-btn-danger"
          aria-label="Delete event"
          title="Delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(event);
          }}
        >
          <FontAwesomeIcon icon={byPrefixAndName.fas["trash"]} className="event-action-icon" />
        </button>
        <button
          type="button"
          className="event-action-btn"
          aria-label="Register user"
          title="Register"
          onClick={(e) => {
            e.stopPropagation();
            onRegister(event);
          }}
        >
          <FontAwesomeIcon icon={byPrefixAndName.fas["user-plus"]} className="event-action-icon" />
        </button>
        <button
          type="button"
          className="event-action-btn event-action-btn-ghost"
          aria-label="View registered users"
          title="View Users"
          onClick={(e) => {
            e.stopPropagation();
            onViewUsers(event);
          }}
        >
          <FontAwesomeIcon icon={byPrefixAndName.fas["address-card"]} className="event-action-icon" />
        </button>
      </div>
    </div>
  );
}
