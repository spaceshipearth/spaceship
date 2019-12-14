import React, { useState} from 'react';
import gql from 'graphql-tag';
import {
  Box,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@material-ui/core";
import {
  Edit,
  Clear,
  Save,
} from '@material-ui/icons';
import { useQuery } from 'react-apollo';

export const userQuery = gql`
  query User($id: ID!) {
    user(id: $id) {
      id
      name
      email
      photoUrl
    }
    currentUser {
      id
    }
    isAdmin
  }
`;

function ProfileFieldButtons({editing, startEditing, cancelEdit, saveEdit}) {
  if (editing) {
    return (
      <>
        <IconButton onClick={ cancelEdit }>
          <Clear/>
        </IconButton>
        <IconButton onClick={ saveEdit }>
          <Save/>
        </IconButton>
      </>
    );
  } else {
    return (
      <IconButton
        onClick={ startEditing ? startEditing : () => {} }
        disabled={ !Boolean(startEditing) }
      >
        <Edit/>
      </IconButton>
    );
  }
}

function ProfileField({label, value, onSave}) {
  const [curValue, setCurValue] = useState(value);
  const [editing, setEditing] = useState(false);

  const startEditing = onSave ? () => setEditing(true) : false;
  const cancelEdit = () => { setEditing(false); setCurValue(value); };
  const saveEdit = () => { setEditing(false); onSave(curValue) };

  return (
    <TextField
      label={ label }
      variant="outlined"
      value={ curValue }
      onChange={ (ev) => { setCurValue(ev.target.value) } }
      InputProps={{
        readOnly: !editing,
        endAdornment: (
          <InputAdornment position="end">
            <ProfileFieldButtons
              editing={ editing }
              startEditing={ startEditing }
              cancelEdit={ cancelEdit }
              saveEdit={ saveEdit }
            ></ProfileFieldButtons>
          </InputAdornment>
        ),
      }}
    ></TextField>
  );
}

function Profile({match}) {
  const { data, loading, error } = useQuery(userQuery, {variables: {id: match.params.userId}});
  if (loading) {
    return '';
  }

  const user = data.user;
  const isOwner = data.currentUser && data.currentUser.id === user.id;
  const canEdit = isOwner || data.isAdmin;

  const [name, setName] = useState(user.name);
  const [editName, setEditName] = useState(false);

  return (
    <Container maxWidth="md">
      <Grid container style={{ marginTop: 10 }} spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper style={{ padding: 16 }}>
            <Typography gutterBottom variant="h6">
              User Profile
            </Typography>

            <Box mt={2}>
              <ProfileField label="Name" value={ name } onSave={ (ev) => setName(ev.target.value) }>
              </ProfileField>
            </Box>

            <Box mt={2}>
              <ProfileField label="Email" value={ user.email || '' }>
              </ProfileField>
            </Box>

            <Box mt={2}>
              <ProfileField label="Photo" value={ user.photo || '' }>
              </ProfileField>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Profile;
