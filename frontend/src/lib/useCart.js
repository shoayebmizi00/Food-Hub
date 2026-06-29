// Cart hook placeholder.
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api/client';

let cartListeners = [];
let cachedItems = null;

function notifyListeners() {
  cartListeners.forEach(fn => fn(cachedItems));
}

export function useCart() {
  const [items, setItems] = useState(cachedItems || []);
  const [loading, setLoading] = useState(!cachedItems);

  useEffect(() => {
    const handler = (newItems) => setItems(newItems ? [...newItems] : []);
    cartListeners.push(handler);
    return () => { cartListeners = cartListeners.filter(h => h !== handler); };
  }, []);

  const refresh = useCallback(async (userId) => {
    if (!userId) return;
    const data = await api.entities.CartItem.filter({ customer_id: userId });
    cachedItems = data;
    setItems(data);
    setLoading(false);
    notifyListeners();
  }, []);

  const addItem = useCallback(async (userId, foodItem, restaurantId, qty = 1) => {
    const existing = (cachedItems || []).find(c => c.food_item_id === foodItem.id && c.customer_id === userId);
    if (existing) {
      await api.entities.CartItem.update(existing.id, { quantity: existing.quantity + qty });
    } else {
      await api.entities.CartItem.create({
        customer_id: userId,
        food_item_id: foodItem.id,
        restaurant_id: restaurantId,
        food_name: foodItem.name,
        food_image: foodItem.image_url,
        price: foodItem.discount_price || foodItem.price,
        quantity: qty
      });
    }
    await refresh(userId);
  }, [refresh]);

  const updateQty = useCallback(async (userId, itemId, qty) => {
    if (qty <= 0) {
      await api.entities.CartItem.delete(itemId);
    } else {
      await api.entities.CartItem.update(itemId, { quantity: qty });
    }
    await refresh(userId);
  }, [refresh]);

  const removeItem = useCallback(async (userId, itemId) => {
    await api.entities.CartItem.delete(itemId);
    await refresh(userId);
  }, [refresh]);

  const clearCart = useCallback(async (userId) => {
    await api.entities.CartItem.deleteMany({ customer_id: userId });
    cachedItems = [];
    setItems([]);
    notifyListeners();
  }, []);

  const total = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return { items, loading, total, count, addItem, updateQty, removeItem, clearCart, refresh };
}