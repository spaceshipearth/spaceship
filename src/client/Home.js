import React from 'react';
import EarthJpg from '../../public/earth.jpg';
import './Home.css';
import { Signup, Signin } from "./Signin";

class Home extends React.Component {
  render() {
    return (
      <div className="Home">
        <div className="Home-header">
          <h1>Spaceship Earth</h1>
          <br />
          <br />
          <br />
          <img src={EarthJpg} className="Home-logo" alt="logo" />
        </div>
        <p className="Home-intro">
          <Signup />
          <br />
          <br />
          <Signin />
        </p>
      </div>
    );
  }
}

export default Home;
