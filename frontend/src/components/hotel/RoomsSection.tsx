import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { api } from '../../services/api';

interface Room {
  id: string;
  name: string;
  type: string;
  price_per_night: number;
  images: string[];
}

// Fallback rooms shown while the API loads or when it is unavailable
const FALLBACK_ROOMS: Room[] = [
  {
    id: '1',
    name: 'The Luminary Suite',
    type: 'Signature Suite',
    price_per_night: 480,
    images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80'],
  },
  {
    id: '2',
    name: 'Celestial Penthouse',
    type: 'Presidential',
    price_per_night: 1200,
    images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80'],
  },
  {
    id: '3',
    name: 'Aurora Deluxe',
    type: 'Deluxe King',
    price_per_night: 380,
    images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80'],
  },
  {
    id: '4',
    name: 'Prism Studio',
    type: 'Studio',
    price_per_night: 290,
    images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80'],
  },
  {
    id: '5',
    name: 'Nebula Junior Suite',
    type: 'Junior Suite',
    price_per_night: 650,
    images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80'],
  },
  {
    id: '6',
    name: 'Horizon Room',
    type: 'Standard King',
    price_per_night: 320,
    images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80'],
  },
];

export function RoomsSection() {
  const [rooms, setRooms] = useState<Room[]>(FALLBACK_ROOMS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.rooms
      .list({ available: true, limit: 6 })
      .then((res) => {
        const fetched = (res.data as Room[]);
        if (fetched.length > 0) setRooms(fetched);
      })
      .catch(() => {
        // Keep fallback data on error
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="rooms" className="py-32 px-6 bg-[#F5F5F7]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="block font-body text-xs tracking-widest uppercase text-gray-400 mb-4">

            Our Spaces
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-heading text-5xl holographic-text">

            Curated Sanctuaries
          </motion.h2>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-opacity duration-500 ${loading ? 'opacity-60' : 'opacity-100'}`}>
          {rooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl overflow-hidden holographic-border group shadow-sm hover:shadow-xl transition-all duration-300">

              <div className="aspect-video overflow-hidden">
                <img
                  src={room.images[0]}
                  alt={room.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="font-heading text-2xl text-gray-900">
                  {room.name}
                </h3>
                <p className="font-body text-xs tracking-widest uppercase text-gray-400 mt-1">
                  {room.type}
                </p>

                <div className="h-px w-full bg-gray-100 my-4"></div>

                <div className="flex items-center justify-between">
                  <span className="font-body text-sm text-gray-500">
                    From ${room.price_per_night} / night
                  </span>
                  <button className="flex items-center space-x-1 group/btn">
                    <span className="font-body text-sm font-medium holographic-text">
                      Book
                    </span>
                    <ArrowRight
                      size={14}
                      className="text-[#b8a9ff] group-hover/btn:translate-x-1 transition-transform"
                    />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}