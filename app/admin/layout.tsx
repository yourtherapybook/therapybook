import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/Layout/DashboardShell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
        redirect('/unauthorized');
    }

    const navItems = [
        { href: '/admin', label: 'Dashboard', icon: 'Activity' },
        { href: '/admin/applications', label: 'Applications', icon: 'CheckSquare' },
        { href: '/admin/users', label: 'Users', icon: 'Users' },
        { href: '/admin/sessions', label: 'Sessions', icon: 'FileText' },
        { href: '/admin/payments', label: 'Payments', icon: 'CreditCard' },
        { href: '/admin/documents', label: 'Documents', icon: 'FolderOpen' },
        { href: '/admin/audit', label: 'Audit Log', icon: 'ScrollText' },
    ];

    return (
        <DashboardShell
            navItems={navItems}
            userEmail={session.user.email || ''}
            userName={`${session.user.firstName} ${session.user.lastName}`}
            variant="dark"
        >
            {children}
        </DashboardShell>
    );
}
