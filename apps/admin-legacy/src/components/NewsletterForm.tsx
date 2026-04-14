import React, { useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { subscribeToNewsletter } from '../services/supabaseService';
import { SiteUserSource } from '../types/database';

interface NewsletterFormProps {
  source: SiteUserSource;
  merchantId?: string;
  placeholder?: string;
  buttonText?: string;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  layout?: 'horizontal' | 'vertical';
}

export const NewsletterForm: React.FC<NewsletterFormProps> = ({
  source,
  merchantId,
  placeholder = "Email address",
  buttonText = "Join Now",
  className = "",
  inputClassName = "",
  buttonClassName = "",
  layout = 'horizontal'
}) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'already_subscribed'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    try {
      const { error } = await subscribeToNewsletter({
        email: email.trim().toLowerCase(),
        source,
        merchant_id: merchantId
      });

      if (error) {
        if (error.message === 'ALREADY_SUBSCRIBED') {
          setStatus('already_subscribed');
        } else if (error.message === 'INVALID_EMAIL') {
          setStatus('error');
          setErrorMessage('Please enter a valid email address.');
        } else {
          setStatus('error');
          setErrorMessage('Something went wrong. Please try again later.');
        }
      } else {
        setStatus('success');
        setEmail('');
      }
    } catch (err: any) {
      console.error('Newsletter subscription error:', err);
      setStatus('error');
      // Show a more helpful message if possible
      const msg = err?.message || 'Something went wrong. Please try again later.';
      setErrorMessage(msg);
    }
  };

  if (status === 'success' || status === 'already_subscribed') {
    return (
      <div className={`flex items-center gap-3 text-emerald-700 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50 animate-in fade-in zoom-in duration-300 ${className}`}>
        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <p className="text-xs font-black tracking-tight">
          {status === 'success' ? 'Welcome to the club! You\'re all set.' : 'You\'re already on our VIP list!'}
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <form 
        onSubmit={handleSubmit}
        className={`flex ${layout === 'vertical' ? 'flex-col' : 'flex-col sm:flex-row'} gap-2 items-stretch sm:items-center`}
      >
        <div className="flex-1 relative group">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            disabled={status === 'loading'}
            className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all text-sm font-medium placeholder:text-gray-400 group-hover:border-gray-300 ${inputClassName}`}
            required
          />
        </div>
        <button
          type="submit"
          disabled={status === 'loading'}
          className={`px-6 py-2.5 rounded-xl font-black text-sm transition-all active:scale-95 flex items-center justify-center gap-2 min-w-[100px] shadow-sm hover:shadow-md disabled:opacity-50 disabled:active:scale-100 ${buttonClassName}`}
        >
          {status === 'loading' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            buttonText
          )}
        </button>
      </form>
      {status === 'error' && (
        <div className="mt-3 flex items-center gap-2 text-red-500 text-[11px] font-bold bg-red-50/50 p-2 rounded-lg border border-red-100/50 animate-in slide-in-from-top-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {errorMessage}
        </div>
      )}
    </div>
  );
};
