import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Paper,
  createTheme,
} from "@mui/material";

import { useDispatch } from "react-redux";
// import PropTypes from "prop-types";
import useStyles from "./styles";
import { createMatch } from "../../actions/matches";
import { countryNames } from "./countryNames";
const MatchForm = (props) => {
  const [matchData, setMatchData] = useState({
    team1: "",
    team2: "",
    time: "",
    team1Score: null,
    team2Score: null,
    guessValdas: {
      team1Goal: null,
      team2Goal: null,
    },
    guessArnas: {
      team1Goal: null,
      team2Goal: null,
    },
    guessDautartas: {
      team1Goal: null,
      team2Goal: null,
    },
  });
  const theme = createTheme();
  const classes = useStyles();
  const dispatch = useDispatch();
  const handleSubmit = (e) => {
    console.log(e);
    e.preventDefault();
    console.log(matchData);
    dispatch(createMatch(matchData));
  };
  return (
    <Paper className={classes.paper} sx={{ padding: theme.spacing(2) }}>
      <form
        autoComplete="off"
        noValidate
        // className={`${classes.root} ${classes.form}`}
        onSubmit={handleSubmit}
      >
        <Typography varient="h6">Matcho kortelė</Typography>
        <TextField
          name="creator"
          variant="outlined"
          label="Šalis 1"
          fullWidth
          value={matchData.team1}
          onChange={(e) =>
            setMatchData({ ...matchData, team1: e.target.value })
          }
        />
        {/* <Select
          defaultValue={10}
          id="named-select"
          name="demo-select"
          label="Šalis 1"
          onChange={(e) =>
            setMatchData({ ...matchData, team1: e?.target.value })
          }
        >
          {countryNames.map((countryName, i) => (
            <Option value={countryName} key={i}>
              {countryName}
            </Option>
          ))}
        </Select> */}
        <TextField
          name="title"
          variant="outlined"
          label="Šalis 2"
          fullWidth
          value={matchData.team2}
          onChange={(e) =>
            setMatchData({ ...matchData, team2: e.target.value })
          }
        />
        <TextField
          id="datetime-local"
          label="Matcho laikas"
          type="datetime-local"
          defaultValue="2024-06-14T16:00"
          InputLabelProps={{
            shrink: true,
          }}
          onChange={(e) => setMatchData({ ...matchData, time: e.target.value })}
        />
        <Button
          className={classes.buttonSubmit}
          color="primary"
          variant="contained"
          size="large"
          type="submit"
          fullWidth
        >
          Įrašyti
        </Button>
      </form>
    </Paper>
  );
};

// MatchForm.propTypes = {};

export default MatchForm;
