# Event Management App Frontend

A React + TypeScript + Vite frontend for managing events and registrations.

This application lets you:
- Create, edit, and delete events
- Register users for events
- View and remove attendees
- Open event details in a popup with attendee list
- Switch between multiple visual themes

## Tech Stack

- React 18
- TypeScript
- Vite 5
- CSS variables based theme system

## Project Structure

```text
frontend/
  index.html
  package.json
  tsconfig.json
  vite.config.js
  .env.example
  src/
    main.tsx
    App.tsx
    App.css
    api.ts
    components/
      EventCard.tsx
      EventForm.tsx
      RegisterUserModal.tsx
      RegistrationsModal.tsx
```

## Prerequisites

Before running locally, ensure you have:
- Node.js 18+ (recommended: latest LTS)
- npm 9+ (comes with Node in most installs)
- A running backend API compatible with the endpoints described below

## Environment Configuration

The frontend reads API base URL from Vite environment variables.

Default API URLs by environment:

- Development (npm run dev): http://localhost:5073
- Production build (npm run build / npm run preview): https://eventmanagementapi-bkcucwf3b4e7djf7.canadacentral-01.azurewebsites.net

1. Create a local environment file:

```bash
cp .env.example .env
```

For Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

2. Set the API URL in .env:

```env
VITE_API_URL=http://localhost:5073
```

If VITE_API_URL is set, it overrides the default for both environments.

If VITE_API_URL is not set, the app uses:

- http://localhost:5073 in development
- https://eventmanagementapi-bkcucwf3b4e7djf7.canadacentral-01.azurewebsites.net in production build

## Install Dependencies

From the frontend folder:

```bash
npm install
```

## Run the App Locally

Start the Vite development server:

```bash
npm run dev
```

Then open the URL shown in your terminal (typically http://localhost:5173).

## Build and Preview Production Output

Create production build:

```bash
npm run build
```

Preview production build locally:

```bash
npm run preview
```

## Available Scripts

In package.json:

- npm run dev: Starts development server with hot reload
- npm run build: Produces optimized production build
- npm run preview: Serves production build locally for verification

## Backend API Contract

The frontend uses these endpoints (base URL = VITE_API_URL when set, otherwise environment defaults above):

### Events
- GET /api/events
- POST /api/events
- PUT /api/events/{id}
- DELETE /api/events/{id}

### Registrations
- POST /api/events/{id}/registrations
- GET /api/events/{id}/registrations
- DELETE /api/events/{id}/registrations/{userId}

## Expected Data Shapes

### EventPayload

```ts
{
  title: string;
  description: string;
  date: string;         // ISO date-time string
  maxCapacity: number;
}
```

### EventDto

```ts
{
  id: number | string;
  title: string;
  description: string;
  date: string;
  maxCapacity: number;
  currentRegistrations?: number;
}
```

### CreateEventRegistrationPayload

```ts
{
  userId: string;
  name: string;
  email: string;
}
```

### EventRegistrationDto

```ts
{
  userId: string;
  name: string;
  email: string;
}
```

Note: Registrations fetch supports multiple backend response shapes:
- Array directly
- Object containing registrations array
- Object containing users array

## Main UI Workflows

1. Create event
- Fill title, description, date-time, and max capacity
- Submit to create an event card

2. Edit event
- Click edit icon on a card
- Form auto-focuses and updates the event

3. Delete event
- Click delete icon on a card
- Confirm in custom modal

4. Register attendee
- Click register icon on a card
- Submit user details in modal

5. View attendees
- Click View Users icon to open attendees modal
- Remove attendees using delete action

6. Open event details popup
- Click an event card (outside action buttons)
- See event details and attendee list with loading/error states

## Theming

Themes are applied via CSS variables and persisted in local storage.

Current theme options:
- Teal Green Light
- Light
- Dark
- Teal Green
- Sunset

## Troubleshooting

### 1) Cannot load events / network errors
- Verify backend is running
- Verify VITE_API_URL value in .env
- Confirm backend allows requests from frontend origin (CORS)

### 2) Empty attendees list when users exist
- Check backend registration endpoint response shape
- Ensure returned user objects include userId, name, and email

### 3) Build issues
- Delete node_modules and package-lock.json, then reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

For Windows PowerShell:

```powershell
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json -Force
npm install
```

### 4) Wrong date/time display
- Ensure backend stores and returns valid ISO date strings
- Confirm system locale/timezone settings if display differs from expectation

## Development Notes

- API functions are centralized in src/api.ts
- Main orchestration state is in src/App.tsx
- UI components are split under src/components
- No external icon package is required for current icon rendering

## License

No license specified yet. Add a LICENSE file if this project will be shared publicly.
