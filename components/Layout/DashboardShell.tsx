"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Heart, LogOut, X, MoreHorizontal, ExternalLink,
    Home, Calendar, Clock, User, Users,
    Activity, CheckSquare, FileText, CreditCard, FolderOpen, ScrollText, Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import SignOutButton from '@/components/Auth/SignOutButton';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, React.ElementType> = {
    Home, Calendar, Clock, User, Users,
    Activity, CheckSquare, FileText, CreditCard, FolderOpen, ScrollText, Mail,
};

interface NavItem {
    href: string;
    label: string;
    icon: string;
}

interface DashboardShellProps {
    children: React.ReactNode;
    navItems: NavItem[];
    userEmail: string;
    userName: string;
    variant?: 'light' | 'dark';
}

export default function DashboardShell({
    children,
    navItems,
    userEmail,
    userName,
    variant = 'light',
}: DashboardShellProps) {
    const pathname = usePathname();
    const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);

    const isDark = variant === 'dark';
    const sidebarBg = isDark ? 'bg-neutral-900' : 'bg-white';
    const sidebarBorder = isDark ? 'border-neutral-800' : 'border-neutral-200';
    const sidebarText = isDark ? 'text-neutral-300' : 'text-neutral-600';
    const sidebarTextHover = isDark ? 'hover:bg-neutral-800 hover:text-white' : 'hover:bg-neutral-50';
    const sidebarActiveText = isDark ? 'text-primary-400 bg-neutral-800' : 'text-primary-700 bg-primary-50';
    const sidebarIconColor = isDark ? 'text-neutral-400' : 'text-neutral-400';
    const sidebarActiveIcon = isDark ? 'text-primary-400' : 'text-primary-500';
    const footerText = isDark ? 'text-neutral-400' : 'text-neutral-500';
    const footerEmail = isDark ? 'text-neutral-300' : 'text-neutral-700';
    const logoutColor = isDark ? 'text-red-400 hover:bg-neutral-800' : 'text-red-600 hover:bg-red-50';

    // Bottom nav: show first 3 items + "More"
    const bottomNavItems = navItems.slice(0, 3);
    const overflowItems = navItems.slice(3);

    const isActive = (href: string) => {
        const cleanHref = href.split('#')[0];
        return pathname === cleanHref || pathname?.startsWith(cleanHref + '/');
    };

    return (
        <div className="h-[100dvh] bg-neutral-50 flex flex-col md:flex-row">
            {/* Desktop sidebar */}
            <aside className={cn(
                "hidden md:flex md:w-64 md:sticky md:top-0 md:h-[100dvh] flex-col flex-shrink-0 border-r",
                sidebarBg, sidebarBorder
            )}>
                <div className={cn("h-14 flex items-center px-6 border-b shrink-0", sidebarBorder)}>
                    <Link href="/" className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-primary-500" />
                        <span className={cn("text-lg font-bold", isDark ? "text-white" : "text-neutral-900")}>TherapyBook</span>
                    </Link>
                </div>

                <nav className="flex-1 overflow-y-auto min-h-0 py-4 px-3 space-y-1">
                    {navItems.map((item) => {
                        const IconComponent = ICON_MAP[item.icon] || Home;
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                                    active ? sidebarActiveText : `${sidebarText} ${sidebarTextHover}`
                                )}
                            >
                                <IconComponent className={cn("h-5 w-5 mr-3", active ? sidebarActiveIcon : sidebarIconColor)} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className={cn("p-4 border-t text-sm shrink-0 space-y-1", sidebarBorder, footerText)}>
                    <div className={cn("truncate px-3 mb-2 font-medium", footerEmail)}>{userEmail}</div>
                    <Link
                        href="/"
                        className={cn("flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors", sidebarText, sidebarTextHover)}
                    >
                        <ExternalLink className={cn("h-4 w-4 mr-3", sidebarIconColor)} />
                        Back to site
                    </Link>
                    <SignOutButton className={cn("flex w-full items-center justify-start px-3 py-2 font-medium rounded-lg transition-colors", logoutColor)}>
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                    </SignOutButton>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto min-h-0 bg-neutral-50 pb-20 md:pb-0">
                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>

            {/* Mobile bottom nav */}
            <nav className={cn(
                "md:hidden fixed bottom-0 left-0 right-0 z-40 border-t",
                "bg-white/95 backdrop-blur-sm border-neutral-200",
                "safe-area-pb"
            )}
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
            >
                <div className="flex items-stretch">
                    {bottomNavItems.map((item) => {
                        const IconComponent = ICON_MAP[item.icon] || Home;
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors",
                                    active ? "text-primary-600" : "text-neutral-400"
                                )}
                            >
                                <IconComponent className="h-5 w-5" />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                    {/* More button */}
                    <button
                        onClick={() => setMoreDrawerOpen(true)}
                        className={cn(
                            "flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors",
                            moreDrawerOpen ? "text-primary-600" : "text-neutral-400"
                        )}
                    >
                        <MoreHorizontal className="h-5 w-5" />
                        <span className="text-[10px] font-medium">More</span>
                    </button>
                </div>
            </nav>

            {/* More drawer */}
            {moreDrawerOpen && (
                <div className="md:hidden fixed inset-0 z-50" onClick={() => setMoreDrawerOpen(false)}>
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/40" />

                    {/* Drawer from bottom */}
                    <div
                        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[70vh] flex flex-col animate-in slide-in-from-bottom"
                        onClick={(e) => e.stopPropagation()}
                        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
                    >
                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="w-10 h-1 rounded-full bg-neutral-300" />
                        </div>

                        {/* User info */}
                        <div className="px-5 py-3 border-b border-neutral-100">
                            <div className="font-medium text-neutral-900 text-sm">{userName}</div>
                            <div className="text-xs text-neutral-500 truncate">{userEmail}</div>
                        </div>

                        {/* Overflow nav items */}
                        {overflowItems.length > 0 && (
                            <div className="px-3 py-2 space-y-1">
                                {overflowItems.map((item) => {
                                    const IconComponent = ICON_MAP[item.icon] || Home;
                                    const active = isActive(item.href);
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setMoreDrawerOpen(false)}
                                            className={cn(
                                                "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                                                active ? "text-primary-700 bg-primary-50" : "text-neutral-600 hover:bg-neutral-50"
                                            )}
                                        >
                                            <IconComponent className={cn("h-5 w-5 mr-3", active ? "text-primary-500" : "text-neutral-400")} />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        )}

                        {/* All nav items (for context) */}
                        <div className="px-3 py-2 border-t border-neutral-100 space-y-1">
                            <div className="px-3 py-1 text-xs font-medium text-neutral-400 uppercase">Navigation</div>
                            {navItems.map((item) => {
                                const IconComponent = ICON_MAP[item.icon] || Home;
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={`more-${item.href}`}
                                        href={item.href}
                                        onClick={() => setMoreDrawerOpen(false)}
                                        className={cn(
                                            "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                                            active ? "text-primary-700 bg-primary-50" : "text-neutral-600 hover:bg-neutral-50"
                                        )}
                                    >
                                        <IconComponent className={cn("h-5 w-5 mr-3", active ? "text-primary-500" : "text-neutral-400")} />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Back to site + Sign out */}
                        <div className="px-3 py-3 border-t border-neutral-100 space-y-1">
                            <Link
                                href="/"
                                onClick={() => setMoreDrawerOpen(false)}
                                className="flex w-full items-center px-3 py-2.5 text-sm font-medium rounded-lg text-neutral-600 hover:bg-neutral-50 transition-colors"
                            >
                                <ExternalLink className="h-5 w-5 mr-3 text-neutral-400" />
                                Back to TherapyBook
                            </Link>
                            <SignOutButton className="flex w-full items-center justify-start px-3 py-2.5 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors">
                                <LogOut className="h-5 w-5 mr-3" />
                                Sign Out
                            </SignOutButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
