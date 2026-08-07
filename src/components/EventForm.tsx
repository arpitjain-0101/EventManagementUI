import type { FormEvent } from "react";
import type { EventPayload } from "../api";
import "./EventForm.css";

interface EventFormProps {
  form: EventPayload;
  isEditing: boolean;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onFormChange: (next: EventPayload) => void;
}

type MockEventTemplate = Pick<EventPayload, "title" | "description" | "maxCapacity">;

const mockEventTemplates: MockEventTemplate[] = [
  {
    title: "Quarterly Product Meetup",
    description: "A hands-on meetup with demos, networking, and open Q&A.",
    maxCapacity: 75
  },
  {
    title: "Frontend Design Sprint",
    description: "Collaborative UI workshop to prototype and review design systems.",
    maxCapacity: 40
  },
  {
    title: "Backend Performance Clinic",
    description: "Profiling session focused on APIs, latency, and throughput tuning.",
    maxCapacity: 30
  },
  {
    title: "Cloud Cost Optimization Talk",
    description: "Learn practical techniques to reduce cloud spend without regressions.",
    maxCapacity: 55
  },
  {
    title: "Data Visualization Bootcamp",
    description: "Build interactive dashboards and improve storytelling with charts.",
    maxCapacity: 60
  },
  {
    title: "Security Awareness Workshop",
    description: "Review common vulnerabilities and secure coding best practices.",
    maxCapacity: 45
  },
  {
    title: "Mobile UX Lab",
    description: "Test and iterate mobile-first flows with guided usability exercises.",
    maxCapacity: 35
  },
  {
    title: "AI Feature Ideation Jam",
    description: "Brainstorm and prioritize practical AI enhancements for product teams.",
    maxCapacity: 50
  },
  {
    title: "DevOps Automation Hour",
    description: "Create CI/CD automations to accelerate releases and reduce errors.",
    maxCapacity: 42
  },
  {
    title: "Accessibility Review Session",
    description: "Audit core journeys for keyboard, screen reader, and contrast support.",
    maxCapacity: 38
  },
  {
    title: "Customer Feedback Roundtable",
    description: "Analyze user feedback themes and map them to actionable backlog items.",
    maxCapacity: 28
  },
  {
    title: "API Contract Governance Meetup",
    description: "Align teams on API standards, versioning, and integration reliability.",
    maxCapacity: 48
  }
];

function getLocalDateTimePlusMinutes(minutesAhead: number): string {
  const date = new Date(Date.now() + minutesAhead * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

export default function EventForm({ form, isEditing, onSubmit, onFormChange }: EventFormProps) {
  function fillMockValues() {
    const randomTemplate =
      mockEventTemplates[Math.floor(Math.random() * mockEventTemplates.length)] ?? mockEventTemplates[0];

    onFormChange({
      title: randomTemplate.title,
      description: randomTemplate.description,
      date: getLocalDateTimePlusMinutes(30),
      maxCapacity: randomTemplate.maxCapacity
    });
  }

  return (
    <form className="event-form" onSubmit={onSubmit}>
      <div className="event-form-title-row">
        <h3>{isEditing ? "Edit Event" : "Create Event"}</h3>
        <button type="button" className="ui-btn-mock" onClick={fillMockValues}>
          Mock Sample Inputs
        </button>
      </div>
      <label>
        Title
        <input
          required
          placeholder="Enter event title"
          value={form.title}
          onChange={(e) => onFormChange({ ...form, title: e.target.value })}
        />
      </label>
      <label>
        Description
        <textarea
          required
          placeholder="Describe the event"
          value={form.description}
          onChange={(e) => onFormChange({ ...form, description: e.target.value })}
        />
      </label>
      <div className="event-form-row">
        <label className="event-form-date-label">
          Date & Time
          <input
            className="event-form-date-input"
            required
            type="datetime-local"
            value={form.date}
            onChange={(e) => onFormChange({ ...form, date: e.target.value })}
          />
        </label>
        <label>
          Max Capacity
          <input
            required
            type="number"
            min="1"
            value={form.maxCapacity}
            onChange={(e) => onFormChange({ ...form, maxCapacity: Number(e.target.value) })}
          />
        </label>
      </div>
      <button type="submit">{isEditing ? "Update" : "Create"}</button>
    </form>
  );
}
