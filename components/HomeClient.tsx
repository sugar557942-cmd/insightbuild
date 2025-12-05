'use client';

import { useState } from 'react';
import Header from './Header';
import Hero from './Hero';
import About from './About';
import Services from './Services';
import Process from './Process';
import Portfolio from './Portfolio';
import Stats from './Stats';
import Contact from './Contact';
import CustomCursor from './CustomCursor';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

interface HomeClientProps {
    initialContent: any;
}

export default function HomeClient({ initialContent }: HomeClientProps) {
    const [content, setContent] = useState(initialContent);
    const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
    const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

    const handleAdminClick = () => {
        setIsAdminLoginOpen(true);
    };

    const handleLogin = () => {
        setIsAdminDashboardOpen(true);
    };

    const handleSaveContent = (newContent: any) => {
        setContent(newContent);
    };

    return (
        <main className="min-h-screen bg-black text-white selection:bg-[var(--primary-yellow)] selection:text-black">
            <CustomCursor />

            <Header onAdminClick={handleAdminClick} />

            <Hero content={content.hero} />
            <About content={content.about} portfolioItems={content.portfolio.items} />
            <Services content={content.services} />

            {isAdminDashboardOpen && (
                <AdminDashboard
                    content={content}
                    onSave={handleSaveContent}
                    onClose={() => setIsAdminDashboardOpen(false)}
                />
            )}
        </main>
    );
}
