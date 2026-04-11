import React, { useState } from "react";
import { makeStyles } from "@mui/styles";
import {
  Button,
  RadioGroup,
  FormControl,
  Slider,
  Backdrop,
  Fade,
  CircularProgress,
  Radio,
  FormControlLabel,
  Modal,
  Typography,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  selectIsOpen,
  setOpen,
  setMatchId,
  selectMatchId,
} from "../../reducers/modalSlice";
import { updateMatch } from "../../actions/matches";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";

import Flag from "../../constants/flags";

const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  paper: {
    // backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    // boxShadow: theme.shadows[5],
    // padding: theme.spacing(2, 4, 3),
  },
  slider: {
    marginTop: "30px",
  },
  teamName: {
    textAlign: "center",
    width: "50%",
    margin: "auto",
  },
}));

const VoteModal = (props) => {
  const classes = useStyles();
  const open = useSelector(selectIsOpen);
  const matchId = useSelector(selectMatchId);
  const match = useSelector((state) =>
    matchId ? state.matches.find((m) => m._id === matchId) : null
  );
  const dispatch = useDispatch();
  const [score, setScore] = useState({
    guess1: 0,
    guess2: 0,
  });
  const [name, setName] = useState("");
  const handleClose = () => {
    dispatch(setMatchId(null));
    dispatch(setOpen(false));
  };
  let newMatchData = { ...match };
  const handleGuess = (e) => {
    if (name === "Valdas") {
      newMatchData.guessValdas = {
        team1Goal: score.guess1,
        team2Goal: score.guess2,
      };
    }
    if (name === "Arnas") {
      newMatchData.guessArnas = {
        team1Goal: score.guess1,
        team2Goal: score.guess2,
      };
    }
    if (name === "Dautartas") {
      newMatchData.guessDautartas = {
        team1Goal: score.guess1,
        team2Goal: score.guess2,
      };
    }

    e.preventDefault();
    dispatch(updateMatch(match._id, newMatchData));
    handleClose();
  };
  return (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      className={classes.modal}
      open={open}
      onClose={handleClose}
      closeAfterTransition
      // BackdropComponent={Backdrop}
      slotProps={{ backdrop: { timeout: 500 } }}
    >
      <Fade in={open}>
        <div className="bg-white rounded-2xl p-8" sx={{}}>
          <form
            autoComplete="off"
            noValidate
            className=" flex flex-col gap-8"
            onSubmit={handleGuess}
          >
            <FormControl component="fieldset">
              <RadioGroup
                row
                aria-label="position"
                name="position"
                defaultValue="top"
                onChange={(e) => setName(e.target.value)}
                className="grid grid-cols-3"
              >
                {!match ? (
                  <CircularProgress />
                ) : (
                  <FormControlLabel
                    value={"Valdas"}
                    control={
                      <Radio
                        color="secondary"
                        disabled={match.guessValdas.team1Goal !== null}
                      />
                    }
                    label="Valdas"
                    labelPlacement="top"
                  />
                )}
                {!match ? (
                  <CircularProgress />
                ) : (
                  <FormControlLabel
                    value={"Arnas"}
                    control={
                      <Radio
                        color="secondary"
                        disabled={match.guessArnas.team1Goal !== null}
                      />
                    }
                    label="Arnas"
                    labelPlacement="top"
                  />
                )}
                {!match ? (
                  <CircularProgress />
                ) : (
                  <FormControlLabel
                    value={"Dautartas"}
                    control={
                      <Radio
                        color="secondary"
                        disabled={match.guessDautartas.team1Goal !== null}
                      />
                    }
                    label="Dautartas"
                    labelPlacement="top"
                  />
                )}
              </RadioGroup>
            </FormControl>
            <div className="flex gap-8">
              <figure className="flex flex-col items-center">
                <Flag countryName={match?.team1} />
                <figcaption>{match?.team1}</figcaption>
              </figure>
              <Typography variant="h2">
                {score.guess1}-{score.guess2}
              </Typography>
              <figure className="flex flex-col items-center">
                <Flag countryName={match?.team2} />
                <figcaption>{match?.team2}</figcaption>
              </figure>
            </div>
            <div className="flex flex-col items-center gap-6">
              <div className="flex flex-col w-full">
                {!match ? (
                  <CircularProgress />
                ) : (
                  <span className={classes.teamName}>{match.team1} </span>
                )}
                <Slider
                  className={classes.slider}
                  defaultValue={0}
                  aria-labelledby="discrete-slider"
                  valueLabelDisplay="on"
                  step={1}
                  marks
                  min={0}
                  max={10}
                  color="primary"
                  onChange={(e, value) => setScore({ ...score, guess1: value })}
                />
              </div>
              <div className="flex flex-col w-full">
                {!match ? (
                  <CircularProgress />
                ) : (
                  <span className={classes.teamName}>{match.team2} </span>
                )}
                <Slider
                  className={classes.slider}
                  defaultValue={0}
                  aria-labelledby="discrete-slider"
                  valueLabelDisplay="on"
                  step={1}
                  marks
                  min={0}
                  max={10}
                  color="primary"
                  onChange={(e, value) => setScore({ ...score, guess2: value })}
                />
              </div>
            </div>

            <Button
              className={classes.buttonSubmit}
              color="primary"
              variant="contained"
              size="large"
              startIcon={<SportsSoccerIcon />}
              type="submit"
              fullWidth
            >
              Ką spėju - tą pataikau
            </Button>
          </form>
        </div>
      </Fade>
    </Modal>
  );
};

export default VoteModal;
