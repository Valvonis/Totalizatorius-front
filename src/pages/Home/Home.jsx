import React from "react";
import { Container, Grow, Grid, Box } from "@mui/material";
import MatchCards from "../../components/MatchCards/MatchCards";
import Layout from "../../components/Layout/Layout";
import "./home.scss";
import VoteModal from "../../components/VoteModal/VoteModal";
import QuestionCard from "../../components/QuestionCard/QuestionCard";
import Typography from "@mui/material/Typography";

const Home = (props) => {
  const questionChampion = {
    question: "Kas laimės čempionatą?",
    data: [
      {
        name: "Valdas",
        country: "Vokietija",
        stillCompeting: false,
      },
      {
        name: "Arnas",
        country: "Portugalija",
        stillCompeting: false,
      },
      {
        name: "Dautartas",
        country: "Portugalija",
        stillCompeting: false,
      },
    ],
  };
  const questionGoldenBoot = {
    question: "Kas gaus auksinį batelį? ",
    data: [
      {
        name: "Valdas",
        country: "Anglija",
        stillCompeting: true,
        additional: { player: "Bellingham", fullName: "Bellingham", goals: 2 },
      },
      {
        name: "Arnas",
        country: "Portugalija",
        stillCompeting: false,
        additional: { player: "Ronaldo", fullName: "Ronaldo", goals: 0 },
      },
      {
        name: "Dautartas",
        country: "Vokietija",
        stillCompeting: false,
        additional: { player: "Havertz", fullName: "Havertz", goals: 2 },
      },
    ],
  };

  return (
    <Layout>
      <Grow in>
        <Container className="flex flex-col gap-4 ">
          <Box className="grid grid-cols-2 max-xl:grid-cols-1 gap-8">
            <QuestionCard {...questionChampion} />
            <QuestionCard {...questionGoldenBoot} />
          </Box>
          <Typography
            id="matchesUpcoming"
            variant="h3"
            className="flex w-full justify-center text-center text-white drop-shadow-2xl bg-black/50"
            align="center"
          >
            {"Artėjančios varžybos"}
          </Typography>
          <Grid
            container
            justifyContent="space-between"
            alignItems="stretch"
            spacing={3}
          >
            <Grid item xs={12} sm={12}>
              <MatchCards />
            </Grid>
          </Grid>
          <div>
            <VoteModal />
          </div>
        </Container>
      </Grow>
    </Layout>
  );
};

export default Home;
