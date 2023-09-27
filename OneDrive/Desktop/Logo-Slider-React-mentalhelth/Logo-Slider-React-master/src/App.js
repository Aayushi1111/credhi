import React, { Component } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./App.css";

class App extends Component {
  render() {
    const settings = {
      dots: true,
      infinite: true,
      slidesToShow: 3,
      slidesToScroll: 1,
      autoplay: true,
      speed: 2000,
      autoplaySpeed: 2000,
      cssEase: "linear"
    };
    return (
      <div className="mainContainer">
        <h2>Auto Play</h2>
        <Slider {...settings}>
          <div className="container">
            <img src={require('./images/1.jpg')} />
          </div>
          <div className="container">
            <img src={require('./images/2.jpg')} />
          </div>
          <div className="container">
            <img src={require('./images/3.jpg')} />
          </div>
          <div className="container">
            <img src={require('./images/4.jpg')} />
          </div>
          <div className="container">
            <img src={require('./images/5.jpg')} />
          </div>

        </Slider>
      </div>
    );
  }
}

export default App;