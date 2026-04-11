import axios from "axios";

const API = axios.create({
  baseURL: "totalizatorius-back-production.up.railway.app",
});

export const createMatch = (newMatch) => API.post("/matches", newMatch);
export const fetchMatches = () => API.get("/matches");

export const updateMatch = (id, updatedMatch) =>
  API.patch(`/matches/${id}`, updatedMatch);
//AA
