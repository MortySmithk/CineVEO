
import React, { ReactNode } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../contexts/AuthContext';

interface DesktopMobileLayoutProps {
    children: ReactNode;
}

const DesktopMobileLayout: React.FC<DesktopMobileLayoutProps> = ({ children }) => {
    const { loading } = useAuth();
    
    return (
        <div className="bg-black text-gray-200 min-h-screen flex flex-col">
            <Header />
            <main id="main-content" className="flex-grow">
                {loading ? (
                     <div className="flex justify-center items-center h-screen">
                        <img src="https://i.ibb.co/PGJ87dN5/cineveo-logo-r.png" alt="Loading Logo" className="w-20 h-auto animate-pulse"/>
                    </div>
                ) : children}
            </main>
            <Footer />
            <AuthModal />
        </div>
    );
};

export default DesktopMobileLayout;
