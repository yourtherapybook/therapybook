import React from 'react';
import Hero from '../components/LandingPage/Hero';
import Process from '../components/LandingPage/Process';
import Testimonials from '../components/LandingPage/Testimonials';

const Landing: React.FC = () => {
  return (
    <div>
      <Hero />
      <Process />
      <Testimonials />
    </div>
  );
};

export default Landing;