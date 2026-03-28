import React from 'react';
import Link from 'next/link';
import { Shield, Users, FileText, CheckSquare, Activity, LogOut } from 'lucide-react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SignOutButton from '@/components/Auth/SignOutButton';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
        redirect('/unauthorized');
    }

    const navItems = [
        { name: 'Dashboard', href: '/admin', icon: Activity },
        { name: 'Applications', href: '/admin/applications', icon: CheckSquare },
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Sessions', href: '/admin/sessions', icon: FileText },
    ];

    return (
        <div className="min-h-screen bg-neutral-100 flex">
            {/* Sidebar Extranet */}
            <aside className="w-64 bg-neutral-900 text-white flex flex-col flex-shrink-0">
                <div className="h-16 flex items-center px-6 border-b border-neutral-800">
                    <Shield className="h-6 w-6 text-primary-500 mr-2" />
                    <span className="text-lg font-bold">Admin Portal</span>
                </div>

                <nav className="flex-1 py-6 px-3 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
                        >
                            <item.icon className="h-5 w-5 mr-3 text-neutral-400" />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-neutral-800 text-sm text-neutral-400">
                    <div className="mb-4 truncate px-3 font-medium text-neutral-300">{session.user.email}</div>
                    <SignOutButton className="flex w-full items-center justify-start px-3 py-2 font-medium rounded-lg text-red-400 hover:bg-neutral-800 transition-colors">
                        <LogOut className="h-5 w-5 mr-3" />
                        Sign Out
                    </SignOutButton>
                </div>
            </aside>

            {/* Admin Rendering Surface */}
            <main className="flex-1 overflow-auto bg-neutral-50">
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
