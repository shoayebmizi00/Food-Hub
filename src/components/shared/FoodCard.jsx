// Food card component placeholder.
import React from 'react';
import { Heart, Plus, Star, Clock, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FoodCard({ item, onAddToCart, onToggleFavorite, isFavorite, onViewDetails }) {
  const hasDiscount = item.discount_price && item.discount_price < item.price;
  const discountPercent = hasDiscount ? Math.round((1 - item.discount_price / item.price) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group bg-card rounded-2xl overflow-hidden border border-border/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer"
      onClick={() => onViewDetails?.(item)}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            -{discountPercent}%
          </span>
        )}
        
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(item); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-600 dark:text-slate-300'}`} />
        </button>

        <div className="absolute bottom-3 left-3 flex gap-1.5">
          {item.is_vegetarian && (
            <span className="bg-green-500/90 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full">Veg</span>
          )}
          {item.is_spicy && (
            <span className="bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <Flame className="w-2.5 h-2.5" /> Spicy
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-foreground text-sm line-clamp-1 mb-1">{item.name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-1 mb-3">{item.description || 'Delicious meal'}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">
              ৳{hasDiscount ? item.discount_price : item.price}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">৳{item.price}</span>
            )}
          </div>
          
          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart?.(item); }}
            className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/25"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/50">
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> 4.5
          </span>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="w-3 h-3" /> {item.prep_time || '15-20 min'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}