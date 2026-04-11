import React from "react";
import PropTypes from "prop-types";
import { Card } from "@mui/material";
import Flag from "../../constants/flags";
import RonaldoLogo from "../../images/Players/Ronaldo.jpg";
import HavertzLogo from "../../images/Players/Havertz.jpg";
import BellinghamLogo from "../../images/Players/Bellingham.jpg";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import ClearIcon from "@mui/icons-material/Clear";
import { Typography } from "@mui/material";
const QuestionCard = (props) => {
  const PlayerLogo = (choice) => {
    switch (choice) {
      case "Ronaldo":
        return RonaldoLogo;
      case "Havertz":
        return HavertzLogo;
      case "Bellingham":
        return BellinghamLogo;
      default:
        break;
    }
  };
  return (
    <Card className="flex flex-col p-4 rounded-2xl ">
      <Typography
        className="flex justify-center items-center text-bold"
        variant="h5"
        align="center"
      >
        {props.question}
        <span className="font-bold pl-4"> +10</span>
      </Typography>

      <div className="grid grid-cols-3 items-center justify-between flex-wrap text-center h-full">
        {props.data.map((data) => (
          <figure
            key={`${data.question}${data.name}`}
            className="flex flex-col items-center"
          >
            <h3 className="text-xs">{data.name}</h3>
            {data.additional ? (
              <div className="flex flex-col items-center">
                <img
                  src={PlayerLogo(data.additional.player)}
                  alt={data.additional.fullName}
                  className="h-20 rounded-2xl"
                ></img>
                <figcaption className="text-xs">
                  {data.additional.fullName}
                </figcaption>
                <span className="font-bold">
                  {data.additional.goals}{" "}
                  {data.stillCompeting ? <QuestionMarkIcon /> : <ClearIcon />}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Flag countryName={data.country} />
                <figcaption className="text-xs">{data.country}</figcaption>
                {data.stillCompeting ? <QuestionMarkIcon /> : <ClearIcon />}
              </div>
            )}
          </figure>
        ))}
      </div>
    </Card>
  );
};

QuestionCard.propTypes = {
  question: PropTypes.string,
  data: PropTypes.array,
};

export default QuestionCard;
