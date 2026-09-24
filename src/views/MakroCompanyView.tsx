import React from 'react';
import { ViewState } from '../App';
import { MakroNavbar } from '../components/makro/MakroNavbar';
import { MakroFooter } from '../components/makro/MakroFooter';
import { MakroCTA } from '../components/makro/MakroCTA';
import { Sparkles, Shield, Cpu, Zap, Globe, ArrowRight } from 'lucide-react';

interface MakroCompanyViewProps {
  onNavigate: (view: ViewState) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  session?: any;
}

export const MakroCompanyView: React.FC<MakroCompanyViewProps> = ({
  onNavigate,
  isDarkMode,
  toggleDarkMode,
  session,
}) => {
  const team = [
    {
      name: 'Vickthor Dennis',
      role: 'Founder & CEO',
      bio: 'Pioneering NFC hardware interfaces and predictive business tooling for African and global creators.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    },
    {
      name: 'Chioma Okonkwo',
      role: 'Head of Product Design',
      bio: 'Former senior designer at leading fintech scale-ups, obsessing over typographic craft and sub-100ms micro-interactions.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    },
    {
      name: 'Tariq Al-Mansoor',
      role: 'VP of Engineering',
      bio: 'Distributed systems architect specialized in high-concurrency ledger engines, bank API webhooks, and cryptography.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    },
    {
      name: 'Sarah Jenkins',
      role: 'Head of Growth & Partnerships',
      bio: 'Scaling solopreneur adoption across North America and Europe with deep focus on creator economy infrastructure.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    },
  ];

  const values = [
    {
      icon: Cpu,
      title: 'Latency Is A Feature',
      description:
        'Every UI screen, NFC tap handshake, and query must resolve in sub-100ms. If it feels like software, it is too slow.',
    },
    {
      icon: Sparkles,
      title: 'Radical Simplicity',
      description:
        'We replace dozens of nested tabs and spreadsheets with high-signal predictive dashboards and clean typography.',
    },
    {
      icon: Shield,
      title: 'Sovereign Privacy',
      description:
        'Your contact lists and financial telemetry belong exclusively to you. We never sell profile metadata to advertisers.',
    },
    {
      icon: Zap,
      title: 'Institutional Grade Craft',
      description:
        'Designed like a $100M platform from day one. Every border, font metric, and layout ratio is mathematically calibrated.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0B0E] text-neutral-900 dark:text-white transition-colors flex flex-col justify-between">
      <MakroNavbar
        currentView={'company' as ViewState}
        onNavigate={onNavigate}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        session={session}
      />

      <main className="flex-1">
        {/* Company Hero */}
        <section className="pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="max-w-5xl mx-auto px-6 sm:px-8 text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-full px-3.5 py-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#D2F843]"></span>
              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                Our Mission & Story
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-neutral-950 dark:text-white leading-[1.08]">
              Empowering professionals to connect with physical velocity.
            </h1>

            <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
              We started CHIPNG with a singular conviction: professionals and creators shouldn't have to rely on wasteful paper cards or clunky link trees. One contactless tap or dynamic URL should share your entire identity, verified vCard, and work.
            </p>
          </div>
        </section>

        {/* Narrative / Story Section */}
        <section className="py-16 border-y border-neutral-200/70 dark:border-neutral-800/80 bg-white dark:bg-[#0C0E13]">
          <div className="max-w-4xl mx-auto px-6 sm:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-4">
              <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#84A900] dark:text-[#D2F843]">
                01. The Origin
              </h2>
              <div className="text-2xl font-bold text-neutral-950 dark:text-white mt-2">
                The Death of the Paper Business Card
              </div>
            </div>
            <div className="md:col-span-8 space-y-4 text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
              <p>
                In 2024, our founders noticed that 88% of traditional paper business cards are discarded within seven days. Simultaneously, independent contractors and solopreneurs were struggling with erratic payment cycles and opaque cash runway.
              </p>
              <p>
                We engineered a unified ecosystem: aerospace-grade NFC hardware that transfers your dynamic digital profile and vCard in under 10 milliseconds, paired with a blazing-fast link-in-bio platform that lets you showcase portfolios, book consultations, and capture client contacts without friction.
              </p>
              <p>
                Today, CHIPNG processes millions of touchpoints for founders across Lagos, London, New York, and Nairobi, turning every meeting into a long-term business relationship.
              </p>
            </div>
          </div>
        </section>

        {/* Values Grid */}
        <section className="py-20 md:py-28 bg-[#FAFAFA] dark:bg-[#0A0B0E]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="max-w-2xl mb-14">
              <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-400 mb-2">
                02. Operating Principles
              </h2>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
                Built on unwavering standards.
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {values.map((v, i) => {
                const Icon = v.icon;
                return (
                  <div
                    key={i}
                    className="p-8 rounded-3xl bg-white dark:bg-[#12141B] border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-950 dark:text-white">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="text-xl font-bold text-neutral-950 dark:text-white">
                      {v.title}
                    </h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {v.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Executive Team */}
        <section className="py-20 md:py-28 border-t border-neutral-200/70 dark:border-neutral-800/80 bg-white dark:bg-[#0C0E13]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="max-w-2xl mb-14">
              <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-400 mb-2">
                03. Leadership
              </h2>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
                The minds driving CHIPNG.
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, i) => (
                <div
                  key={i}
                  className="rounded-3xl bg-neutral-50 dark:bg-[#12141B] border border-neutral-200/80 dark:border-neutral-800 p-6 flex flex-col justify-between space-y-4"
                >
                  <div>
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-20 h-20 rounded-2xl object-cover ring-2 ring-black/5 dark:ring-white/10 mb-4"
                      referrerPolicy="no-referrer"
                    />
                    <h4 className="text-lg font-bold text-neutral-950 dark:text-white">
                      {member.name}
                    </h4>
                    <div className="text-xs font-medium text-[#84A900] dark:text-[#D2F843] mb-3">
                      {member.role}
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {member.bio}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Global Hubs */}
        <section className="py-16 border-t border-neutral-200/70 dark:border-neutral-800/80 bg-[#FAFAFA] dark:bg-[#0A0B0E]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div className="p-6 rounded-2xl bg-white dark:bg-[#12141B] border border-neutral-200/80 dark:border-neutral-800">
                <div className="text-xs font-mono uppercase tracking-widest text-neutral-400">Headquarters</div>
                <div className="text-lg font-bold text-neutral-950 dark:text-white mt-1">Lagos, Nigeria</div>
                <div className="text-xs text-neutral-500 mt-1">Victoria Island Innovation Hub</div>
              </div>
              <div className="p-6 rounded-2xl bg-white dark:bg-[#12141B] border border-neutral-200/80 dark:border-neutral-800">
                <div className="text-xs font-mono uppercase tracking-widest text-neutral-400">EMEA Engineering</div>
                <div className="text-lg font-bold text-neutral-950 dark:text-white mt-1">London, UK</div>
                <div className="text-xs text-neutral-500 mt-1">Shoreditch Tech City</div>
              </div>
              <div className="p-6 rounded-2xl bg-white dark:bg-[#12141B] border border-neutral-200/80 dark:border-neutral-800">
                <div className="text-xs font-mono uppercase tracking-widest text-neutral-400">Global Strategy</div>
                <div className="text-lg font-bold text-neutral-950 dark:text-white mt-1">San Francisco, USA</div>
                <div className="text-xs text-neutral-500 mt-1">Market Street Financial District</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <MakroCTA onGetStarted={() => onNavigate('login')} />
      </main>

      <MakroFooter onNavigate={onNavigate} />
    </div>
  );
};
