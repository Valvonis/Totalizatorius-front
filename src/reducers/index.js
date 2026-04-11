import { combineReducers } from "redux";

import matches from "./matches";
import modal from "./modalSlice";
import score from "./scoreSlice";

export default combineReducers({
  matches,
  modal,
  score,
});
