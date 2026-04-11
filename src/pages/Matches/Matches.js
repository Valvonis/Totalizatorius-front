import React from "react";
import { Container, Grow, Grid } from "@mui/material";
import Layout from "../../components/Layout/Layout";
import MatchForm from "../../components/MatchForm/MatchForm";
const Matches = (props) => {
  return (
    <Layout>
      <Grow in>
        <Container>
          <Grid
            container
            justifyContent="space-between"
            alignItems="stretch"
            spacing={3}
          >
            {/* <Grid item xs={12} sm={7}>
              <Posts />
            </Grid> */}
            <Grid item xs={12} sm={4}>
              <MatchForm />
            </Grid>
          </Grid>
        </Container>
      </Grow>
    </Layout>
  );
};

export default Matches;
