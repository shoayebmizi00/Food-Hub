// Restaurant card component placeholder.
import React from 'react';
import { Star, Clock, MapPin, Bike } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function RestaurantCard({ restaurant, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link to={`/restaurant/${restaurant.id}`} className="block group">
        <div className="bg-card rounded-2xl overflow-hidden border border-border/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
          <div className="relative aspect-[16/9] overflow-hidden">
            <img
              src={restaurant.cover_image_url || restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=340&fit=crop'}
              alt={restaurant.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {restaurant.is_featured && (
              <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full">
                Featured
              </span>
            )}

            <div className="absolute bottom-3 left-3 right-3">
              <h3 className="text-white font-bold text-lg mb-1 line-clamp-1">{restaurant.name}</h3>
              <p className="text-white/80 text-xs line-clamp-1">{restaurant.cuisine_type || 'Multi-cuisine'}</p>
            </div>
          </div>
          
          <div className="p-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-foreground">{restaurant.rating || '4.5'}</span>
                <span>({restaurant.total_reviews || 0})</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {restaurant.avg_delivery_time || '30-45 min'}
              </span>
              <span className="flex items-center gap-1">
                <Bike className="w-3.5 h-3.5" /> ৳{restaurant.delivery_fee || 'Free'}
              </span>
            </div>
            
            {restaurant.min_order > 0 && (
              <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Min. order ৳{restaurant.min_order}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}