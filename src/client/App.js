import React from 'react';
import Home from './Home';
import './App.css';
import gql from "graphql-tag";
import { useQuery } from 'react-apollo';
import Dashboard from './Dashboard';
import {SignOutMenuItem} from './Signin';
import Mission from './Mission';
import {
  AppBar,
  Button,
  CssBaseline,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Toolbar,
  Typography
} from "@material-ui/core";
import ArrowBack from "@material-ui/icons/ArrowBack";
import { Switch, Route, Link } from "react-router-dom";

export const currentUserQuery = gql`
  query CurrentUser {
    currentUser {
      id
      name
      email
      photoUrl
    }
  }
`;

function ProfileMenu() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { data, loading, error } = useQuery(currentUserQuery);
  if (loading) {
    return '';
  }

  const currentUser = data.currentUser;

  function handleClick(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  return (
    <>
      <Button
        aria-controls="user-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        <Avatar
          alt={currentUser.name}
          src={currentUser.photoUrl}
        />
      </Button>
      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem
          onClick={handleClose}
          component={Link}
          to={`/profile/${currentUser.id}`}
        >
          Profile
        </MenuItem>
        <SignOutMenuItem />
      </Menu>
    </>
  );
}

const App = () => {
  const { data, loading, error } = useQuery(currentUserQuery);
  if (loading) {
    return '';
  }

  if (data.currentUser) {
    return (
      <>
        <CssBaseline />
        <AppBar elevation={1} position="sticky">
          <Toolbar>
            <Switch>
              <Route
                exact
                path="/"
                component={() => {
                  return (
                    <Link to="/">
                      <Typography variant="h6" style={{ color: "white" }}>
                        Spaceship Earth
                      </Typography>
                    </Link>
                  );
                }}
              />
              <Route
                component={() => {
                  return (
                    <IconButton color="inherit" component={Link} to="/">
                      <ArrowBack />
                    </IconButton>
                  );
                }}
              />
            </Switch>
            <div style={{ flexGrow: 1 }}> </div>
            <ProfileMenu />
          </Toolbar>
        </AppBar>
        <Switch>
          <Route exact path="/" component={Dashboard} />
          <Route exact path="/mission/:missionId" component={Mission} />
        </Switch>
      </>
    );
  } else {
    return (
      <Switch>
        <Route exact path="/" component={Home} />
      </Switch>
    );
  }
};

export default App;


