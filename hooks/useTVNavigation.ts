
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export const useTVNavigation = (enabled: boolean) => {
    const location = useLocation();
    const focusIndex = useRef<number>(-1);
    const focusableElements = useRef<HTMLElement[]>([]);

    const setFocus = (index: number) => {
        if (focusIndex.current >= 0 && focusableElements.current[focusIndex.current]) {
            focusableElements.current[focusIndex.current].classList.remove('focused');
        }
        
        const newElement = focusableElements.current[index];
        if (newElement) {
            newElement.classList.add('focused');
            focusIndex.current = index;
            newElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        }
    };

    const initializeFocus = () => {
        const selectors = `
            a[href]:not([data-no-focus]), button:not([data-no-focus]), [data-tv-focusable]
        `;
        focusableElements.current = Array.from(document.querySelectorAll<HTMLElement>(selectors)).filter(
            el => el.offsetParent !== null && window.getComputedStyle(el).visibility !== 'hidden'
        );

        if (focusIndex.current !== -1 && focusableElements.current[focusIndex.current]) {
             focusableElements.current[focusIndex.current].classList.remove('focused');
        }

        if (focusableElements.current.length > 0) {
            // Find the first element not in the sidebar to be the initial focus
            const firstContentElementIndex = focusableElements.current.findIndex(el => !el.closest('.tv-sidebar'));
            const initialIndex = firstContentElementIndex !== -1 ? firstContentElementIndex : 0;
            focusIndex.current = -1; // Reset to ensure setFocus works correctly
            setFocus(initialIndex);
        } else {
            focusIndex.current = -1;
        }
    };

    useEffect(() => {
        if (enabled) {
            // Delay to allow page content to render
            const timeoutId = setTimeout(initializeFocus, 200);
            return () => clearTimeout(timeoutId);
        }
         // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, location]);

    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (focusableElements.current.length === 0) return;
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }

            const currentElement = focusableElements.current[focusIndex.current];
            if (!currentElement) {
                initializeFocus();
                return;
            }

            if (e.key === 'Enter') {
                e.preventDefault();
                currentElement.click();
            } else if (e.key === 'Backspace') {
                 e.preventDefault();
                 window.history.back();
            } else {
                findNextFocus(e.key, currentElement);
            }
        };
        
        const findNextFocus = (direction: string, currentElement: HTMLElement) => {
            const currentRect = currentElement.getBoundingClientRect();
            let bestCandidateIndex = -1;
            let minDistance = Infinity;

            for (let i = 0; i < focusableElements.current.length; i++) {
                if (i === focusIndex.current) continue;

                const candidateElement = focusableElements.current[i];
                const candidateRect = candidateElement.getBoundingClientRect();
                
                let isPotential = false;
                let distance = Infinity;

                const dx = (candidateRect.left + candidateRect.width / 2) - (currentRect.left + currentRect.width / 2);
                const dy = (candidateRect.top + candidateRect.height / 2) - (currentRect.top + currentRect.height / 2);
                
                switch (direction) {
                    case 'ArrowRight':
                        if (dx > 5) { isPotential = true; distance = Math.sqrt(dx * dx + dy * dy * 2); }
                        break;
                    case 'ArrowLeft':
                        if (dx < -5) { isPotential = true; distance = Math.sqrt(dx * dx + dy * dy * 2); }
                        break;
                    case 'ArrowDown':
                        if (dy > 5) { isPotential = true; distance = Math.sqrt(dx * dx * 2 + dy * dy); }
                        break;
                    case 'ArrowUp':
                        if (dy < -5) { isPotential = true; distance = Math.sqrt(dx * dx * 2 + dy * dy); }
                        break;
                }

                if (isPotential && distance < minDistance) {
                    minDistance = distance;
                    bestCandidateIndex = i;
                }
            }
            if (bestCandidateIndex !== -1) {
                setFocus(bestCandidateIndex);
            }
        }

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);

    }, [enabled, location]);
};
