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
  }
`;

function AdminMissionEditor() {
  const { data, loading, error } = useQuery(goalsQuery);
  if (loading) {
    return "";
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
