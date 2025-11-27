'use client';

import { useEffect, useState } from 'react';

export default function CustomCursor() {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const updateCursor = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });
            setIsVisible(true);
        };

        const handleMouseEnter = () => setIsVisible(true);
        const handleMouseLeave = () => setIsVisible(false);

        window.addEventListener('mousemove', updateCursor);
        document.body.addEventListener('mouseenter', handleMouseEnter);
        document.body.addEventListener('mouseleave', handleMouseLeave);

        // Add hover listeners to interactive elements
        const handleLinkHover = () => setIsHovering(true);
        const handleLinkLeave = () => setIsHovering(false);

        const interactiveElements = document.querySelectorAll('a, button, input, textarea, .cursor-hover');
        interactiveElements.forEach((el) => {
            el.addEventListener('mouseenter', handleLinkHover);
            el.addEventListener('mouseleave', handleLinkLeave);
        });

        // Mutation observer to attach listeners to new elements
        const observer = new MutationObserver(() => {
            const newElements = document.querySelectorAll('a, button, input, textarea, .cursor-hover');
            newElements.forEach((el) => {
                el.removeEventListener('mouseenter', handleLinkHover);
                el.removeEventListener('mouseleave', handleLinkLeave);
                el.addEventListener('mouseenter', handleLinkHover);
                el.addEventListener('mouseleave', handleLinkLeave);
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            window.removeEventListener('mousemove', updateCursor);
            document.body.removeEventListener('mouseenter', handleMouseEnter);
            document.body.removeEventListener('mouseleave', handleMouseLeave);
            observer.disconnect();
        };
    }, []);

    if (!isVisible) return null;

    return (
        <>
            <style jsx global>{`
        body {
          cursor: none;
        }
        @media (max-width: 768px) {
          body {
            cursor: auto;
          }
          .custom-cursor {
            display: none;
          }
        }
      `}</style>
            <div
                className="custom-cursor fixed pointer-events-none z-[9999] mix-blend-difference transition-transform duration-100 ease-out"
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    transform: `translate(-50%, -50%) scale(${isHovering ? 2.5 : 1})`,
                }}
            >
                <div className={`w-4 h-4 rounded-full border border-[var(--primary-yellow)] ${isHovering ? 'bg-[var(--primary-yellow)] opacity-50' : 'bg-transparent'}`} />
            </div>
            {/* Spotlight effect */}
            <div
                className="fixed pointer-events-none z-[1] transition-opacity duration-300"
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    transform: 'translate(-50%, -50%)',
                    width: '600px',
                    height: '600px',
                    background: 'radial-gradient(circle, rgba(255, 215, 0, 0.03) 0%, rgba(0,0,0,0) 70%)',
                }}
            />
        </>
    );
}
