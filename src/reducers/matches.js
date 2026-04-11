import { FETCH_ALL, CREATE, UPDATE } from "../constants/actionTypes";

const reducer = (matches = [], action) => {
  switch (action.type) {
    case FETCH_ALL:
      return action.payload;
    case CREATE:
      return [...matches, action.payload];
    case UPDATE:
      return matches.map((match) =>
        match._id === action.payload._id ? action.payload : match
      );
    default:
      return matches;
  }
};
export default reducer;
