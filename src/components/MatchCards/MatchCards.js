import React from "react";
import { useSelector } from "react-redux";
import MatchCard from "./MatchCard/MatchCard";
import { Grid, CircularProgress, createTheme } from "@mui/material";
import Typography from "@mui/material/Typography";
const MatchCards = (props) => {
  const NOW = new Date();
  const matches = useSelector((state) => state.matches).sort(
    (a, b) => new Date(a.time) - new Date(b.time)
  );
  const matchesUpcoming = matches.filter((match) => new Date(match.time) > NOW);
  const matchesDone = matches
    .filter((match) => new Date(match.time) < NOW)
    .reverse();
  // const found = matches.findIndex(match => new Date(match) < NOW); // first match, which is started or ended

  return !matches.length ? (
    <CircularProgress />
  ) : (
    <>
      {/* <Typography
        id="matchesUpcoming"
        variant="h3"
        className="flex justify-center text-center text-white drop-shadow-2xl bg-black/50"
        align="center"
      >
        {"Artėjančios varžybos"}
      </Typography> */}
      <div className="grid grid-cols-2 max-md:grid-cols-1 gap-8">
        {matchesUpcoming.map((match) => (
          <div key={match._id}>
            <MatchCard match={match} />
          </div>
        ))}
      </div>

      <Typography
        id="matchesDone"
        variant="h3"
        className="flex w-full justify-center text-center my-4 text-white drop-shadow-2xl bg-black/50"
        align="center"
      >
        {"Praėjusios varžybos"}
      </Typography>

      {matchesDone.length ? (
        <div className="grid grid-cols-2 max-md:grid-cols-1 gap-8">
          {matchesDone.map((match) => (
            <div key={match._id}>
              <MatchCard match={match} />
            </div>
          ))}
        </div>
      ) : (
        <Typography
          variant="body1"
          className="flex justify-center m-12 text-center font-bold"
          align="center"
        >
          {"Luktelk! Dar neprasidėjo nei vienos varžybos!"}
        </Typography>
      )}
    </>
  );
};

export default MatchCards;
