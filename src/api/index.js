import axios from "axios";

const API = axios.create({ baseURL: "https://totalizatorius.herokuapp.com" });

export const createMatch = (newMatch) => API.post("/matches", newMatch);
export const fetchMatches = () => API.get("/matches");

export const updateMatch = (id, updatedMatch) =>
  API.patch(`/matches/${id}`, updatedMatch);
//AA
