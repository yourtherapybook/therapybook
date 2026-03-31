"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
    Heart, LogOut, Menu, X,
    Home, Calendar, Clock, User, Users,
    Activity, CheckSquare, FileText, CreditCard, FolderOpen, ScrollText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import SignOutButton from '@/components/Auth/SignOutButton';
import { cn } from '@/lib/utils';

// Map string icon names to components — avoids passing functions from Server to Client
const ICON_MAP: Record<string, React.ElementType> = {
    Home, Calendar, Clock, User, Users,
    Activity, CheckSquare, FileText, CreditCard, FolderOpen, ScrollText,
};

interface NavItem {
    href: string;
    label: string;
    icon: string; // icon name, not component
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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

    const renderNavItems = (onClickItem?: () => void) =>
        navItems.map((item, i) => {
            const IconComponent = ICON_MAP[item.icon] || Home;
            return (
                <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClickItem}
                    className={cn(
                        "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                        i === 0 ? sidebarActiveText : `${sidebarText} ${sidebarTextHover}`
                    )}
                >
                    <IconComponent className={cn("h-5 w-5 mr-3", i === 0 ? sidebarActiveIcon : sidebarIconColor)} />
                    {item.label}
                </Link>
            );
        });

    return (
        <div className="h-[100dvh] bg-neutral-50 flex flex-col md:flex-row">
            {/* Mobile header */}
            <header className={cn(
                "md:hidden flex items-center justify-between h-14 px-4 border-b shrink-0",
                sidebarBg, sidebarBorder
            )}>
                <Link href="/" className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary-500" />
                    <span className={cn("font-bold", isDark ? "text-white" : "text-neutral-900")}>TherapyBook</span>
                </Link>
                <div className="flex items-center gap-2">
                    <span className={cn("text-xs truncate max-w-[120px]", footerText)}>{userName}</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className={cn("h-9 w-9", isDark ? "text-white" : "")}
                    >
                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </header>

            {/* Mobile menu overlay */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 top-14 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
                    <div
                        className={cn("w-64 h-full flex flex-col", sidebarBg)}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                            {renderNavItems(() => setMobileMenuOpen(false))}
                        </nav>
                        <div className={cn("p-4 border-t", sidebarBorder)}>
                            <div className={cn("text-xs truncate px-3 mb-3", footerEmail)}>{userEmail}</div>
                            <SignOutButton className={cn("flex w-full items-center justify-start px-3 py-2 text-sm font-medium rounded-lg transition-colors", logoutColor)}>
                                <LogOut className="h-4 w-4 mr-3" />
                                Sign Out
                            </SignOutButton>
                        </div>
                    </div>
                </div>
            )}

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
                    {renderNavItems()}
                </nav>

                <div className={cn("p-4 border-t text-sm shrink-0", sidebarBorder, footerText)}>
                    <div className={cn("truncate px-3 mb-3 font-medium", footerEmail)}>{userEmail}</div>
                    <SignOutButton className={cn("flex w-full items-center justify-start px-3 py-2 font-medium rounded-lg transition-colors", logoutColor)}>
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                    </SignOutButton>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto min-h-0 bg-neutral-50">
                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
