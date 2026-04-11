import React from "react";
import PropTypes from "prop-types";
import { Container, AppBar, Typography, Divider, Button } from "@mui/material";
import EURO2024 from "../../images/euro2024.avif";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import {
  selectValdasScore,
  selectArnasScore,
  selectDautartasScore,
} from "../../reducers/scoreSlice";
import { useSelector } from "react-redux";
const Layout = (props) => {
  const ValdasScore = useSelector(selectValdasScore);
  const ArnasScore = useSelector(selectArnasScore);
  const DautartasScore = useSelector(selectDautartasScore);

  return (
    <Container
      maxwidth="lg"
      className="flex flex-col justify-center items-center gap-8"
    >
      <a href="/">
        <img
          className="w-60 pt-3 m-auto"
          src={EURO2024}
          alt="memories"
          height="240"
          target="/"
        ></img>
      </a>
      <Typography
        className="font-bold max-sm:text-4xl xl:text-6xl text-white"
        variant="h3"
        align="center"
      >
        TOTALIZATORIUS
      </Typography>

      <AppBar
        className="rounded-2xl shadow-2xl flex justify-center items-center w-60"
        position="static"
        color="inherit"
      >
        <Typography className="font-bold w-48 flex" variant="h5" align="center">
          <span className="w-36">Valdas: </span>
          <span className="font-bold ">{ValdasScore}</span>
          <Divider />
        </Typography>
        <Typography className="font-bold w-48 flex" variant="h5" align="center">
          <span className="w-36">Arnas: </span>{" "}
          <span className="font-bold ">{ArnasScore}</span> <Divider />
        </Typography>
        <Typography className="font-bold w-48 flex" variant="h5" align="center">
          <span className="w-36">Dautartas: </span>
          <span className="font-bold ">{DautartasScore}</span>
        </Typography>
      </AppBar>
      <div className="flex justify-center h-12 text-center">
        <Button
          variant="outlined"
          href="#matchesDone"
          color="primary"
          className="bg-white font-bold rounded-2xl"
        >
          Į praėjusias varžybas <ArrowDownwardIcon />
        </Button>
      </div>

      {props.children}
    </Container>
  );
};

Layout.propTypes = { children: PropTypes.node };

export default Layout;
