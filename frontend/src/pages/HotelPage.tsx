import React from 'react';
import { HotelNav } from '../components/hotel/HotelNav';
import { HeroSection } from '../components/hotel/HeroSection';
import { RoomsSection } from '../components/hotel/RoomsSection';
import { AmenitiesSection } from '../components/hotel/AmenitiesSection';
import { HotelFooter } from '../components/hotel/HotelFooter';
export function HotelPage() {
  return (
    <div className="min-h-screen bg-white">
      <HotelNav />
      <main>
        <HeroSection />
        <RoomsSection />
        <AmenitiesSection />
      </main>
      <HotelFooter />
    </div>);

}