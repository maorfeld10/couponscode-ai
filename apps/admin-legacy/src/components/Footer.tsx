import React from 'react';
import { Link } from 'react-router-dom';
import { NewsletterForm } from './NewsletterForm';

export const Footer = () => (
  <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1">
          <span className="text-xl font-black tracking-tighter text-sky-900">TopCoupons.ai</span>
          <p className="mt-4 text-xs font-medium leading-relaxed text-gray-400 max-w-xs">
            Your premium AI-driven portal for verified digital savings. We make every dollar go further.
          </p>
        </div>
        <div>
          <h4 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-6">Explore</h4>
          <ul className="space-y-3">
            <li><Link to="/stores" className="text-xs font-bold text-gray-400 hover:text-sky-600 transition-colors">Categories</Link></li>
            <li><Link to="/stores" className="text-xs font-bold text-gray-400 hover:text-sky-600 transition-colors">Stores</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-6">Legal</h4>
          <ul className="space-y-3">
            <li><Link to="/privacy-policy" className="text-xs font-bold text-gray-400 hover:text-sky-600 transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms-and-conditions" className="text-xs font-bold text-gray-400 hover:text-sky-600 transition-colors">Terms of Service</Link></li>
            <li><Link to="/contact-us" className="text-xs font-bold text-gray-400 hover:text-sky-600 transition-colors">Contact Us</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-6">Subscribe</h4>
          <NewsletterForm 
            source="homepage_signup"
            placeholder="Email"
            buttonText="JOIN"
            inputClassName="bg-gray-50 border-gray-100"
            buttonClassName="bg-sky-700 text-white hover:bg-sky-800"
          />
        </div>
      </div>
      
      <div className="pt-8 border-t border-gray-50">
        <p className="text-[10px] leading-relaxed text-gray-400">
          © 2024 TopCoupons.ai. All rights reserved. Affiliate Disclosure: We may earn a commission when you use our links. This allows us to keep our service free and our AI algorithms running.
        </p>
      </div>
    </div>
  </footer>
);
