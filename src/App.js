import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { getMatches } from "./actions/matches";
import Home from "./pages/Home/Home";
import Matches from "./pages/Matches/Matches";

import "./App.scss";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getMatches());
  }, [dispatch]);
  return (
    <Router>
      <Routes>
        <Route path="/matches" element={<Matches />}></Route>
        <Route path="/" element={<Home />}></Route>
      </Routes>
    </Router>
  );
}

export default App;
