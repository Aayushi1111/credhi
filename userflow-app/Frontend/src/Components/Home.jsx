import React from 'react';
import './Home.css';
import PreLoginNavbar from './Preloginnav';

const Home = () => {
  return (
    <div>
       <PreLoginNavbar />
      <div id="home" className="container1">
        <div className="text-section">
          <h1>Unlock valuable insights using the AI-driven Financial Analysis platform.</h1>
          <div className="buttons">
            <button className="explore-button">Explore</button>
            <button className="learn-more-button">Learn more</button>
          </div>
        </div>
        <div className="image-section">
          <img src="coding-illustration.png" alt="Illustration" />
        </div>
      </div>

      <div id="mission" className="additional-section">
        <div className="text">
          <h2>Light, fast & responsive</h2>
          <p>Gain clarity on financial documents without getting overwhelmed by numbers. Whether it's a downturn, a surge, or a stable phase, each financial fluctuation provides meaningful and actionable insights. Make informed decisions with confidence.</p>
        </div>
        <img src="features-img.png" alt="Features Illustration" />
      </div>

      <div id="product" className="additional-section">
        <div className="text">
          <h2>About Us</h2>
          <p>At Credhi, we focus on helping small and medium businesses succeed. We use technology to create special ways of measuring how well these businesses are doing. Our mission is to simplify access to tailored financing solutions, utilizing advanced algorithms to assess businesses accurately and offer personalized loan assistance swiftly. Committed to transparency and innovation, we're here to empower SMEs on their journey to financial growth and stability.</p>
        </div>
        <img src="support-img.png" alt="Support Illustration" />
      </div>

      <div id="contact" className="contact-container">
        <h2>Contact</h2>
        <p className="subheading">Tell Us Everything</p>
        <p className="description">Do you have any question? Feel free to reach out.</p>
        <a href="#" className="chat-link">Let's Chat</a>
      </div>
    </div>
  );
};

export default Home;
