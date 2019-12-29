import React from "react";
import "./Home.css";
import gql from "graphql-tag";
import {
  Container,
  List, ListItem, ListItemText,
  ListItemSecondaryAction,
} from "@material-ui/core";
import { useQuery } from "react-apollo";
import { CategoryEditor, GoalEditor } from "./ObjectEditor";
import { Redirect } from "react-router-dom";

export const goalsQuery = gql`
  query Missions {
    categories {
      id
      title
      displayRank
      shortDescription
      longDescription
      goals {
        id
        title
        shortDescription
        longDescription
        displayRank
        categoryId
      }
    }
    currentUser {
      id
      isAdmin
    }
  }
`;

function AdminMissionEditor() {
  const { data, loading, error } = useQuery(goalsQuery);
  if (loading) {
    return "";
  }

  // TODO: set correct users to admins and uncomment below
  //if (!Boolean(data.currentUser) || !data.currentUser.isAdmin) {
  if (!Boolean(data.currentUser)) {
    return (
      <Redirect to="/" />
    );
  }

  return (
    <Container maxWidth="md" style={{ marginTop: 50 }}>
      <List>
        {data.categories.map(category => (
          <>
            <ListItem key={category.id}>
              <ListItemText
                primary={category.title}
                secondary={category.shortDescription}
              />
              <ListItemSecondaryAction>
                <CategoryEditor category={category} />
              </ListItemSecondaryAction>
            </ListItem>
            <List disablePadding style={{ paddingLeft: 20 }}>
              {category.goals.map(goal => (
                <ListItem key={goal.id}>
                  <ListItemText
                    primary={goal.title}
                    secondary={goal.shortDescription}
                  />
                  <ListItemSecondaryAction>
                    <GoalEditor goal={goal} />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
              <div style={{paddingLeft: 20}}>
                <GoalEditor />
                </div>
            </List>
          </>
        ))}
        <CategoryEditor />
      </List>
    </Container>
  );
}


export default AdminMissionEditor;
