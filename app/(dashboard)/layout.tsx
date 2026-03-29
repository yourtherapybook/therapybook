import React from 'react';
import Link from 'next/link';
import { Shield, Home, Calendar, Clock, LogOut, User, Users } from 'lucide-react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SignOutButton from '@/components/Auth/SignOutButton';

const traineeNav = [
    { href: '/trainee-dashboard', label: 'Overview', icon: Home },
    { href: '/trainee-dashboard#schedule', label: 'My Schedule', icon: Calendar },
    { href: '/trainee-dashboard#history', label: 'Session History', icon: Clock },
];

const clientNav = [
    { href: '/client-dashboard', label: 'My Sessions', icon: Home },
    { href: '/client-dashboard#upcoming', label: 'Upcoming', icon: Calendar },
    { href: '/client-dashboard#history', label: 'History', icon: Clock },
    { href: '/client-dashboard#profile', label: 'Account', icon: User },
];

const supervisorNav = [
    { href: '/supervisor-dashboard', label: 'Overview', icon: Home },
    { href: '/supervisor-dashboard#trainees', label: 'Trainees', icon: Users },
    { href: '/supervisor-dashboard#sessions', label: 'Sessions', icon: Calendar },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/auth/signin?callbackUrl=%2Fclient-dashboard');
    }

    const role = session.user.role;
    const navItems = role === 'CLIENT'
        ? clientNav
        : role === 'SUPERVISOR'
            ? supervisorNav
            : traineeNav;

    return (
        <div className="h-[100dvh] bg-neutral-50 flex flex-col md:flex-row">
            {/* Sidebar — sticky, full viewport height, own scroll */}
            <aside className="w-full md:w-64 md:sticky md:top-0 md:h-[100dvh] bg-white border-b md:border-b-0 md:border-r border-neutral-200 flex flex-col flex-shrink-0">
                <div className="h-16 flex items-center px-6 border-b border-neutral-200 shrink-0">
                    <Link href="/" className="flex items-center">
                        <Shield className="h-6 w-6 text-primary-500 mr-2" />
                        <span className="text-lg font-bold text-neutral-900">TherapyBook</span>
                    </Link>
                </div>

                <nav className="flex md:flex-col overflow-x-auto md:overflow-x-visible md:overflow-y-auto flex-1 min-h-0 py-3 md:py-6 px-3 gap-1 md:gap-0 md:space-y-2">
                    {navItems.map((item, i) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                                i === 0
                                    ? 'text-primary-700 bg-primary-50'
                                    : 'text-neutral-600 hover:bg-neutral-50'
                            }`}
                        >
                            <item.icon className={`h-5 w-5 mr-3 ${i === 0 ? 'text-primary-500' : 'text-neutral-400'}`} />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="hidden md:block p-4 border-t border-neutral-200 text-sm text-neutral-600 shrink-0">
                    <div className="mb-4 truncate px-3 font-medium">{session.user.email}</div>
                    <SignOutButton className="flex w-full items-center justify-start px-3 py-2 font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut className="h-5 w-5 mr-3" />
                        Sign Out
                    </SignOutButton>
                </div>
            </aside>

            {/* Main Rendering Surface — scrollable */}
            <main className="flex-1 overflow-y-auto min-h-0 bg-neutral-50">
                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
