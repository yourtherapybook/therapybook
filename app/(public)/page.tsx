import React from 'react';
import Hero from '@/components/LandingPage/Hero';
import Process from '@/components/LandingPage/Process';
import Testimonials from '@/components/LandingPage/Testimonials';
import SupportCTA from '@/components/LandingPage/SupportCTA';

export default function Home() {
    return (
        <main>
            <Hero />
            <Process />
            <Testimonials />
            <SupportCTA />
        </main>
    );
}
