import React, { useEffect } from "react";
import { Card, CardActions, Button, Typography } from "@mui/material";
import moment from "moment";
import "moment/locale/lt";
import Flag from "../../../constants/flags";
import DoneRoundedIcon from "@mui/icons-material/DoneRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTime";
import FaceRoundedIcon from "@mui/icons-material/FaceRounded";

import { setOpen, setMatchId } from "../../../reducers/modalSlice";
import { useDispatch } from "react-redux";
import "./matchCard.scss";
import {
  addValdas,
  addArnas,
  addDautartas,
} from "../../../reducers/scoreSlice";
const MatchCard = ({ match }) => {
  const TIME_ZONE = 3;
  moment.locale("lt");
  const dispatch = useDispatch();
  let ValdasGuess = null;
  let ArnasGuess = null;
  let DautartasGuess = null;

  const handleGuess = (e) => {
    e.preventDefault();
    dispatch(setMatchId(match._id));
    dispatch(setOpen(true));
  };

  const calculatePoints = (
    team1Score,
    team2Score,
    guess1Score,
    guess2Score
  ) => {
    if (guess1Score === null || team1Score === null) return 0;
    else if (
      parseInt(team1Score) === guess1Score &&
      parseInt(team2Score) === guess2Score
    ) {
      return 5;
    } else if (team1Score - team2Score === guess1Score - guess2Score) {
      return 3;
    } else if (
      (team1Score > team2Score && guess1Score > guess2Score) ||
      (team1Score < team2Score && guess1Score < guess2Score)
    ) {
      return 1;
    } else return 0;
  };

  let ValdasScore = calculatePoints(
    match.team1Score,
    match.team2Score,
    match.guessValdas.team1Goal,
    match.guessValdas.team2Goal,
    "Valdas"
  );
  let ArnasScore = calculatePoints(
    match.team1Score,
    match.team2Score,
    match.guessArnas.team1Goal,
    match.guessArnas.team2Goal,
    "Arnas"
  );
  let DautartasScore = calculatePoints(
    match.team1Score,
    match.team2Score,
    match.guessDautartas.team1Goal,
    match.guessDautartas.team2Goal,
    "Dautartas"
  );

  useEffect(() => {
    dispatch(addValdas(ValdasScore));
    dispatch(addArnas(ArnasScore));
    dispatch(addDautartas(DautartasScore));
  }, [ValdasScore, ArnasScore, DautartasScore, dispatch]);

  let dateToConstruct = "";
  const a = new Date(match.time);
  a.setHours(a.getHours() - TIME_ZONE);
  dateToConstruct = `${a.getMonth() + 1}-${a.getDate()} ${a.getHours()}:00 `; //TO FIX

  let timeDifference = new Date(match.time) - new Date();
  timeDifference = timeDifference - 1000 * 60 * 60 * TIME_ZONE;
  if (timeDifference > 0) {
    ValdasGuess =
      match.guessValdas.team1Goal !== null ? (
        <DoneRoundedIcon />
      ) : (
        <CloseRoundedIcon />
      );
    ArnasGuess =
      match.guessArnas.team1Goal !== null ? (
        <DoneRoundedIcon />
      ) : (
        <CloseRoundedIcon />
      );
    DautartasGuess =
      match.guessDautartas.team1Goal !== null ? (
        <DoneRoundedIcon />
      ) : (
        <CloseRoundedIcon />
      );
  } else {
    ValdasGuess = (
      <span>
        {match.guessValdas.team1Goal}:{match.guessValdas.team2Goal}
      </span>
    );
    ArnasGuess = (
      <span>
        {match.guessArnas.team1Goal}:{match.guessArnas.team2Goal}
      </span>
    );
    DautartasGuess = (
      <span>
        {match.guessDautartas.team1Goal}:{match.guessDautartas.team2Goal}
      </span>
    );
  }
  return (
    <Card className="flex  pt-8 flex-col items-center rounded-2xl h-full gap-8 shadow-2xl">
      <div className="flex w-full justify-between px-4 text-black">
        {moment(match.time).subtract(TIME_ZONE, "hours").fromNow()}
        <div className="flex gap-2">
          <AccessTimeRoundedIcon />
          {dateToConstruct}
        </div>
      </div>
      <div className="flex gap-8">
        <figure className="flex flex-col items-center">
          <Flag countryName={match.team1} />
          <figcaption>{match.team1}</figcaption>
        </figure>
        <Typography variant="h2">
          {match.team1Score}-{match.team2Score}
        </Typography>
        <figure className="flex flex-col items-center">
          <Flag countryName={match.team2} />
          <figcaption>{match.team2}</figcaption>
        </figure>
      </div>

      <div className="flex flex-col content-center justify-between text-center">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="">
              <FaceRoundedIcon />
            </div>
            Valdas
            <div>{ValdasGuess}</div>
            <span>
              Taškai:
              <span className={`pointsColor${ValdasScore}`}>{ValdasScore}</span>
            </span>
          </div>
          <div>
            {" "}
            <div className="">
              <FaceRoundedIcon />
            </div>
            Arnas
            <div>{ArnasGuess}</div>
            <span>
              Taškai:
              <span className={`pointsColor${ArnasScore}`}>{ArnasScore}</span>
            </span>
          </div>
          <div>
            <div className="">
              <FaceRoundedIcon />
            </div>
            Dautartas
            <div>{DautartasGuess}</div>
            <span>
              Taškai:
              <span className={`pointsColor${DautartasScore}`}>
                {DautartasScore}
              </span>
            </span>
          </div>
        </div>
      </div>
      <CardActions className="flex text-center m-auto w-full shadow-xl border">
        <div className="flex text-center m-auto">
          <Button
            size="small"
            color="primary"
            onClick={handleGuess}
            disabled={
              timeDifference < 0 ||
              (match.guessValdas.team1Goal !== null &&
                match.guessArnas.team1Goal !== null &&
                match.guessDautartas.team1Goal !== null)
            }
          >
            <SportsSoccerIcon fontSize="large" />{" "}
            <span className="text-xl">SPĖTI</span>
          </Button>
        </div>
      </CardActions>
    </Card>
  );
};

export default MatchCard;
