import * as api from "../api";
import { CREATE, FETCH_ALL, UPDATE } from "../constants/actionTypes";

export const createMatch = (match) => async (dispatch) => {
  try {
    const { data } = await api.createMatch(match);

    dispatch({ type: CREATE, payload: data });
  } catch (error) {
    console.log(error);
  }
};
export const getMatches = () => async (dispatch) => {
  try {
    const { data } = await api.fetchMatches();

    dispatch({ type: FETCH_ALL, payload: data });
  } catch (error) {
    console.log(error);
  }
};
export const updateMatch = (id, match) => async (dispatch) => {
  try {
    const { data } = await api.updateMatch(id, match);

    dispatch({ type: UPDATE, payload: data });
  } catch (error) {
    console.log(error);
  }
};
