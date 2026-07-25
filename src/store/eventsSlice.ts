import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createEvent,
  deleteEvent,
  getEvents,
  type EventDto,
  type EventId,
  type EventPayload,
  type EventsResponse,
  updateEvent
} from "../api";

type EventsState = {
  items: EventDto[];
  isLoading: boolean;
  error: string;
};

const initialState: EventsState = {
  items: [],
  isLoading: false,
  error: ""
};

function normalizeEventsResponse(data: EventsResponse): EventDto[] {
  return Array.isArray(data) ? data : Array.isArray(data?.events) ? data.events : [];
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export const fetchEvents = createAsyncThunk<EventDto[], void, { rejectValue: string }>(
  "events/fetchEvents",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getEvents();
      return normalizeEventsResponse(data);
    } catch (error) {
      return rejectWithValue(toErrorMessage(error));
    }
  }
);

export const createEventThunk = createAsyncThunk<EventDto, EventPayload, { rejectValue: string }>(
  "events/createEvent",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const savedEvent = await createEvent(payload);
      await dispatch(fetchEvents()).unwrap();
      return savedEvent;
    } catch (error) {
      return rejectWithValue(toErrorMessage(error));
    }
  }
);

export const updateEventThunk = createAsyncThunk<
  EventDto,
  { id: EventId; payload: EventPayload },
  { rejectValue: string }
>("events/updateEvent", async ({ id, payload }, { dispatch, rejectWithValue }) => {
  try {
    const savedEvent = await updateEvent(id, payload);
    await dispatch(fetchEvents()).unwrap();
    return savedEvent;
  } catch (error) {
    return rejectWithValue(toErrorMessage(error));
  }
});

export const deleteEventThunk = createAsyncThunk<EventId, EventId, { rejectValue: string }>(
  "events/deleteEvent",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await deleteEvent(id);
      await dispatch(fetchEvents()).unwrap();
      return id;
    } catch (error) {
      return rejectWithValue(toErrorMessage(error));
    }
  }
);

const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    clearEventsError(state) {
      state.error = "";
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.isLoading = true;
        state.error = "";
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.items = [];
        state.error = action.payload ?? "Failed to fetch events";
      })
      .addCase(createEventThunk.pending, (state) => {
        state.error = "";
      })
      .addCase(createEventThunk.rejected, (state, action) => {
        state.error = action.payload ?? "Failed to create event";
      })
      .addCase(updateEventThunk.pending, (state) => {
        state.error = "";
      })
      .addCase(updateEventThunk.rejected, (state, action) => {
        state.error = action.payload ?? "Failed to update event";
      })
      .addCase(deleteEventThunk.pending, (state) => {
        state.error = "";
      })
      .addCase(deleteEventThunk.rejected, (state, action) => {
        state.error = action.payload ?? "Failed to delete event";
      });
  }
});

export const { clearEventsError } = eventsSlice.actions;
export default eventsSlice.reducer;