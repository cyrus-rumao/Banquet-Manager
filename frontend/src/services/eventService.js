import axios from "../lib/axios";

// ✅ conflict check
export const checkConflict = (data) => {
  return axios.post("/events/check-conflict", data);
};

// ✅ create event
export const createEvent = (data) => {
  return axios.post("/events/", data);
};

// ✅ get user events
export const getMyEvents = () => {
  return axios.get("/events/event/my");
};