// Footer component placeholder.
import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-base">🍔</span>
              </div>
              <span className="font-bold">FoodHub <span className="text-primary">Pro</span></span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your favorite food, delivered fast. Premium quality from the best restaurants.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Company</h4>
            <div className="space-y-2">
              <Link to="/" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">About Us</Link>
              <Link to="/" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Careers</Link>
              <Link to="/" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Support</h4>
            <div className="space-y-2">
              <Link to="/" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Help Center</Link>
              <Link to="/" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Contact Us</Link>
              <Link to="/" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Partners</h4>
            <div className="space-y-2">
              <Link to="/" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Add Restaurant</Link>
              <Link to="/" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Become a Rider</Link>
              <Link to="/" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">For Business</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-6 text-center">
          <p className="text-xs text-muted-foreground">© 2025 FoodHub Pro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}