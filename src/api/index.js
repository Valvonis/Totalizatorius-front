import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_BE_URL,
});
console.log("API URL:", process.env.REACT_APP_BE_URL);
export const createMatch = (newMatch) => API.post("/matches", newMatch);
export const fetchMatches = () => API.get("/matches");

export const updateMatch = (id, updatedMatch) =>
  API.patch(`/matches/${id}`, updatedMatch);
//AA
