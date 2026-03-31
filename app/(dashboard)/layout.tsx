import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/Layout/DashboardShell';

const traineeNav = [
    { href: '/trainee-dashboard', label: 'Overview', icon: 'Home' },
    { href: '/trainee-dashboard#availability', label: 'Availability', icon: 'Calendar' },
    { href: '/trainee-dashboard#history', label: 'History', icon: 'Clock' },
];

const clientNav = [
    { href: '/client-dashboard', label: 'My Sessions', icon: 'Home' },
    { href: '/client-dashboard#upcoming', label: 'Upcoming', icon: 'Calendar' },
    { href: '/client-dashboard#history', label: 'History', icon: 'Clock' },
    { href: '/client-dashboard#profile', label: 'Account', icon: 'User' },
];

const supervisorNav = [
    { href: '/supervisor-dashboard', label: 'Overview', icon: 'Home' },
    { href: '/supervisor-dashboard#trainees', label: 'Trainees', icon: 'Users' },
    { href: '/supervisor-dashboard#sessions', label: 'Sessions', icon: 'FileText' },
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
        <DashboardShell
            navItems={navItems}
            userEmail={session.user.email || ''}
            userName={`${session.user.firstName} ${session.user.lastName}`}
            variant="light"
        >
            {children}
        </DashboardShell>
    );
}
