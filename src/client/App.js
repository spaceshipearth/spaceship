import React from 'react';
import Home from './Home';
import './App.css';
import gql from "graphql-tag";
import { useQuery } from 'react-apollo';
import Dashboard from './Dashboard';
import AdminMissionEditor from './Admin';
import {SignOutMenuItem} from './Signin';
import Mission from './Mission';
import Profile from './Profile';
import {
  AppBar,
  Box,
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
import AvatarPng from "../../public/avatar.png";

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

function LogInMenu() {
  return (
    <Typography>
      Log in, ya bastard
    </Typography>
  );
}

function ProfileMenu() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { data, loading, error } = useQuery(currentUserQuery);
  if (loading) {
    return '';
  }

  const currentUser = data.currentUser;
  if (!currentUser) {
    return <LogInMenu />;
  }

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
          src={currentUser.photoUrl || AvatarPng}
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

function SpaceToolBar({ location }) {
  // we query for the current user so we can tell if we're logged in or not
  const { data, loading, error } = useQuery(currentUserQuery);
  if (loading) {
    return '';
  }

  // don't render an app bar on the home page for logged-out users
  const currentUser = data.currentUser;
  const atHome = location.pathname === '/';
  if (atHome && !Boolean(currentUser)) {
    return null;
  }

  return (
    <AppBar elevation={1} position="sticky">
      <Toolbar>
        <Switch>
          <Route
            exact
            path="/"
            component={() => {
              return (
                <Link to="/" style={{ textDecoration: "none" }}>
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
                <>
                  <IconButton color="inherit" component={Link} to="/">
                    <ArrowBack />
                  </IconButton>
                  <Typography variant="h6" style={{ color: "white" }}>
                    Spaceship Earth
                  </Typography>
                </>
              );
            }}
          />
        </Switch>
        <div style={{ flexGrow: 1 }}> </div>
        <ProfileMenu />
      </Toolbar>
    </AppBar>
  );
}

const App = () => {
  const { data, loading, error } = useQuery(currentUserQuery);
  if (loading) {
    return '';
  }

  const homePageComponent = Boolean(data.currentUser) ? Dashboard : Home;

  return (
    <>
      <CssBaseline />
      <Route component={SpaceToolBar} />
      <Switch>
        <Route exact path="/" component={homePageComponent} />
        <Route exact path="/mission/:missionId" component={Mission} />
        <Route exact path="/admin" component={AdminMissionEditor} />
        <Route exact path="/profile/:userId" component={Profile} />
      </Switch>
    </>
  );
};

export default App;


