import React from 'react';
import Link from 'next/link';
import { Shield, Home, Calendar, Clock, LogOut } from 'lucide-react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SignOutButton from '@/components/Auth/SignOutButton';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/auth/signin?callbackUrl=%2Ftrainee-dashboard');
    }

    return (
        <div className="min-h-screen bg-neutral-50 flex">
            {/* Sidebar Extranet */}
            <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col flex-shrink-0">
                <div className="h-16 flex items-center px-6 border-b border-neutral-200">
                    <Shield className="h-6 w-6 text-primary-500 mr-2" />
                    <span className="text-lg font-bold text-neutral-900">TherapyBook</span>
                </div>

                <nav className="flex-1 py-6 px-3 space-y-2">
                    <Link
                        href="/trainee-dashboard"
                        className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-primary-700 bg-primary-50 transition-colors"
                    >
                        <Home className="h-5 w-5 mr-3 text-primary-500" />
                        Overview
                    </Link>
                    <Link
                        href="/trainee-dashboard#schedule"
                        className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-neutral-600 hover:bg-neutral-50 transition-colors"
                    >
                        <Calendar className="h-5 w-5 mr-3 text-neutral-400" />
                        My Schedule
                    </Link>
                    <Link
                        href="/trainee-dashboard#history"
                        className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-neutral-600 hover:bg-neutral-50 transition-colors"
                    >
                        <Clock className="h-5 w-5 mr-3 text-neutral-400" />
                        Session History
                    </Link>
                </nav>

                <div className="p-4 border-t border-neutral-200 text-sm text-neutral-600">
                    <div className="mb-4 truncate px-3 font-medium">{session.user.email}</div>
                    <SignOutButton className="flex w-full items-center justify-start px-3 py-2 font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut className="h-5 w-5 mr-3" />
                        Sign Out
                    </SignOutButton>
                </div>
            </aside>

            {/* Main Rendering Surface */}
            <main className="flex-1 overflow-auto bg-neutral-50">
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
