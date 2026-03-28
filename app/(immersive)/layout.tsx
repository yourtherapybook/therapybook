import React from 'react';

export default function ImmersiveLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-screen w-full bg-neutral-900 overflow-hidden text-white">
            {children}
        </div>
    );
}
