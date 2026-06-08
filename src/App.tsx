/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { db } from './store';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import DashboardEvents from './components/DashboardEvents';
import CreateEvent from './components/CreateEvent';
import EventDetail from './components/EventDetail';
import SubscriptionPage from './components/SubscriptionPage';
import PublicInvitation from './components/PublicInvitation';
import DatabaseConsole from './components/DatabaseConsole';
import { Link2, Github, Globe, RefreshCcw, Command, Layout } from 'lucide-react';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>('/');
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  
  // Public invitation visitors states
  const [invSlug, setInvSlug] = useState<string>('');
  const [invLink, setInvLink] = useState<string>('');

  const [tick, setTick] = useState(0);

  // Sync with browser native pathname on mount & popstate
  useEffect(() => {
    const parseURL = () => {
      // In AI Studio Dev, pathname could be arbitrary so we sanitize
      const path = window.location.pathname;
      
      const invMatch = path.match(/^\/inv\/([^/]+)\/([^/]+)$/);
      if (invMatch) {
        const [, slug, link] = invMatch;
        setInvSlug(slug);
        setInvLink(link);
        setCurrentRoute('/inv');
        return;
      }

      if (path.startsWith('/dashboard/events/create')) {
        setCurrentRoute('/dashboard/events/create');
      } else if (path.startsWith('/dashboard/events/detail')) {
        // detail path can hold query param or suffix
        const parts = path.split('/');
        const eventId = parts[partCount() - 1];
        if (eventId && eventId !== 'detail') {
          setSelectedEventId(eventId);
        }
        setCurrentRoute('/dashboard/events/detail');
      } else if (path.startsWith('/dashboard/events')) {
        setCurrentRoute('/dashboard/events');
      } else if (path.startsWith('/dashboard/subscription')) {
        setCurrentRoute('/dashboard/subscription');
      } else if (path.startsWith('/login')) {
        setCurrentRoute('/login');
      } else if (path.startsWith('/register')) {
        setCurrentRoute('/register');
      } else {
        // Default relative landing
        setCurrentRoute('/');
      }
    };

    const partCount = () => window.location.pathname.split('/').length;

    parseURL();
    window.addEventListener('popstate', parseURL);
    
    // Subscribe also to state store to trigger renders
    const unsubscribe = db.subscribe(() => {
      setTick((t) => t + 1);
    });

    return () => {
      window.removeEventListener('popstate', parseURL);
      unsubscribe();
    };
  }, []);

  // Central Routing function that supports updating window.history state smoothly
  const navigateTo = (route: string, params?: { eventId?: string; slug?: string; link?: string }) => {
    let finalPath = route;

    if (route === '/dashboard/events/detail' && params?.eventId) {
      setSelectedEventId(params.eventId);
      finalPath = `/dashboard/events/detail/${params.eventId}`;
    } else if (route === '/inv' && params?.slug && params?.link) {
      setInvSlug(params.slug);
      setInvLink(params.link);
      finalPath = `/inv/${params.slug}/${params.link}`;
    }

    // Attempt pushing back state for real address transitions
    try {
      window.history.pushState(null, '', finalPath);
    } catch (e) {
      console.warn('History navigation restricted in iframe, routing internally', e);
    }

    setCurrentRoute(route);
  };

  const handleSelectEvent = (id: string) => {
    navigateTo('/dashboard/events/detail', { eventId: id });
  };

  const handleSelectGuestInvitation = (slug: string, link: string) => {
    navigateTo('/inv', { slug, link });
  };

  // Helper renderer
  const renderActiveRoute = () => {
    switch (currentRoute) {
      case '/':
        return <LandingPage onNavigate={(r) => navigateTo(r)} />;
      case '/login':
        return <AuthPage onNavigate={(r) => navigateTo(r)} initialTab="login" />;
      case '/register':
        return <AuthPage onNavigate={(r) => navigateTo(r)} initialTab="register" />;
      case '/dashboard/events':
        return (
          <DashboardEvents 
            onNavigate={(r) => navigateTo(r)} 
            onSelectEvent={handleSelectEvent} 
          />
        );
      case '/dashboard/events/create':
        return <CreateEvent onNavigate={(r) => navigateTo(r)} />;
      case '/dashboard/events/detail':
        return (
          <EventDetail 
            eventId={selectedEventId || 'event-wedding-1'} 
            onNavigate={(r) => navigateTo(r)} 
            onSelectGuestInvitation={handleSelectGuestInvitation}
          />
        );
      case '/dashboard/subscription':
        return <SubscriptionPage onNavigate={(r) => navigateTo(r)} />;
      case '/inv':
        return (
          <PublicInvitation 
            eventSlug={invSlug || 'pernikahan-richard-lisa'} 
            guestLink={invLink || 'budi-wedding-link-abc'} 
            onNavigateBackToDashboard={() => navigateTo('/dashboard/events')}
          />
        );
      default:
        return <LandingPage onNavigate={(r) => navigateTo(r)} />;
    }
  };

  // Active user plan state indicator
  const currentUserPlan = db.getCurrentPlan();

  return (
    <div className="relative min-h-screen bg-[#FAF9F6] flex flex-col">
      
      {/* 🌐 DEVELOPMENT BROWSING HELPER STATUS HUDBAR */}
      <div className="bg-zinc-950 text-zinc-300 px-4 py-2.5 text-xs flex flex-wrap items-center justify-between border-b border-zinc-800 gap-3 relative z-50">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-zinc-400 shrink-0" />
          <span className="font-bold text-[10px] text-zinc-400 uppercase tracking-widest hidden sm:inline">Active path:</span>
          
          {/* Simulated address display */}
          <div className="bg-zinc-900 px-3 py-1 rounded-lg text-[11px] font-mono text-zinc-100 border border-zinc-800 flex items-center gap-1.5 break-all max-w-sm sm:max-w-xl">
            <span className="text-zinc-500">{window.location.origin}</span>
            <span className="font-semibold text-zinc-300">{
              currentRoute === '/inv' ? `/inv/${invSlug}/${invLink}` :
              currentRoute === '/dashboard/events/detail' ? `/dashboard/events/${selectedEventId || '[id]'}` :
              currentRoute === '/dashboard/events/create' ? `/dashboard/events/create` :
              currentRoute === '/dashboard/subscription' ? `/dashboard/subscription` :
              currentRoute
            }</span>
          </div>
        </div>

        {/* Navigation quick routing shortcuts to test every specific state easily */}
        <div className="flex items-center gap-2 text-[10px]">
          <span className="hidden lg:inline text-zinc-500 font-bold uppercase font-mono mr-1">Rute Cepat:</span>
          <button 
            onClick={() => navigateTo('/')} 
            className={`px-2 py-1 rounded font-bold cursor-pointer transition-all ${currentRoute === '/' ? 'bg-white text-zinc-950 shadow-xs' : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'}`}
          >
            Landing
          </button>
          <button 
            onClick={() => navigateTo('/login')} 
            className={`px-2 py-1 rounded font-bold cursor-pointer transition-all ${currentRoute === '/login' || currentRoute === '/register' ? 'bg-white text-zinc-950 shadow-xs' : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'}`}
          >
            Auth Portal
          </button>
          
          {db.getSessionUserId() ? (
            <>
              <button 
                onClick={() => navigateTo('/dashboard/events')} 
                className={`px-2 py-1 rounded font-bold cursor-pointer transition-all ${currentRoute === '/dashboard/events' ? 'bg-white text-zinc-950 shadow-xs' : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => navigateTo('/dashboard/subscription')} 
                className={`px-2 py-1 rounded font-bold cursor-pointer transition-all ${currentRoute === '/dashboard/subscription' ? 'bg-white text-zinc-950 shadow-xs' : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'}`}
              >
                Langganan ({currentUserPlan?.plan === 'premium' ? '👑 Premium' : 'Free'})
              </button>
            </>
          ) : (
            <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-1 rounded font-bold uppercase">
              🔒 LOGIN DAHULU
            </span>
          )}
        </div>
      </div>

      {/* Render selected layout */}
      <div className="grow flex flex-col">
        {renderActiveRoute()}
      </div>

      {/* Database Schema Drawer Simulator Console */}
      <DatabaseConsole />

    </div>
  );
}
