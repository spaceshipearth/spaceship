import React, { useState, useEffect } from 'react';
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
import { useQuery, useMutation } from 'react-apollo';

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

export const updateUserMutation = gql`
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      success
      user {
        id
        name
        email
        photoUrl
      }
    }
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
  useEffect(() => {
    setCurValue(value);
  }, [value]);

  const [editing, setEditing] = useState(false);

  const startEditing = onSave ? () => setEditing(true) : false;
  const cancelEdit = () => { setEditing(false); setCurValue(value); };
  const saveEdit = () => { setEditing(false); onSave(curValue) };

  return (
    <TextField
      label={ label }
      variant="outlined"
      value={ curValue }
      onChange={ ev => setCurValue(ev.target.value) }
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
  const [updateUserHandler] = useMutation(updateUserMutation);

  function handleNameUpdate(newName) {
    updateUserHandler({variables:{input: {userId: data.user.id, field: 'name', value: newName}}});
  }

  const { data, loading, error } = useQuery(userQuery, {variables: {id: match.params.userId}});
  if (loading) {
    return '';
  }

  const user = data.user;
  const isOwner = data.currentUser && data.currentUser.id === user.id;
  const canEdit = isOwner || data.isAdmin;

  return (
    <Container maxWidth="md">
      <Grid container style={{ marginTop: 10 }} spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper style={{ padding: 16 }}>
            <Typography gutterBottom variant="h6">
              User Profile
            </Typography>

            <Box mt={2}>
              <ProfileField
                label="Name"
                value={ user.name }
                onSave={ (newName) => handleNameUpdate(newName) }
              ></ProfileField>
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
