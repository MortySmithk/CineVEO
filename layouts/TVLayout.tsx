import React, { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Search, Film, Tv, Smile, Drama, Crown, LogIn, UserCircle, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getAuth, signOut } from 'firebase/auth';
import toast from 'react-hot-toast';
import { useTVNavigation } from '../hooks/useTVNavigation';
import { firebaseApp } from '../services/firebase';

interface TVLayoutProps {
    children: ReactNode;
}

const TVLayout: React.FC<TVLayoutProps> = ({ children }) => {
    const { currentUser, isAdmin, loading } = useAuth();
    const navigate = useNavigate();
    useTVNavigation(true);

    const handleLogout = () => {
        const auth = getAuth(firebaseApp);
        signOut(auth)
            .then(() => toast.success('Você saiu da sua conta.'))
            .catch((error) => toast.error(`Erro ao sair: ${error.message}`));
    };

    const openAuthModal = () => {
        navigate({ hash: 'auth' });
    };

    const navLinkClass = "flex items-center gap-4 p-3 rounded-lg font-medium text-gray-400 transition-colors border-2 border-transparent focus:outline-none";
    const activeNavLinkClass = "bg-yellow-500 text-black";

    return (
        <div className="flex w-full h-screen overflow-hidden">
            <aside className="w-60 bg-black h-full fixed left-0 top-0 p-4 flex flex-col border-r border-gray-800 z-50">
                <div className="p-4 mb-4 text-center">
                    <img src="https://i.ibb.co/s91tyczd/Gemini-Generated-Image-ejjiocejjiocejji-1.png" alt="Logo CineVEO" className="w-40 mx-auto" />
                </div>
                <nav className="flex flex-col gap-2">
                    <NavLink to="/" className={({isActive}) => `${navLinkClass} ${isActive ? activeNavLinkClass : ''}`}><Home /> <span>Início</span></NavLink>
                    <NavLink to="/pesquisar" className={({isActive}) => `${navLinkClass} ${isActive ? activeNavLinkClass : ''}`}><Search /> <span>Pesquisar</span></NavLink>
                    <NavLink to="/filmes" className={({isActive}) => `${navLinkClass} ${isActive ? activeNavLinkClass : ''}`}><Film /> <span>Filmes</span></NavLink>
                    <NavLink to="/series" className={({isActive}) => `${navLinkClass} ${isActive ? activeNavLinkClass : ''}`}><Tv /> <span>Séries</span></NavLink>
                    <NavLink to="/animacoes" className={({isActive}) => `${navLinkClass} ${isActive ? activeNavLinkClass : ''}`}><Smile /> <span>Animações</span></NavLink>
                    <NavLink to="/novelas" className={({isActive}) => `${navLinkClass} ${isActive ? activeNavLinkClass : ''}`}><Drama /> <span>Novelas</span></NavLink>
                    <NavLink to="/premium" className={({isActive}) => `${navLinkClass} ${isActive ? activeNavLinkClass : ''}`}><Crown /> <span>Premium</span></NavLink>
                    
                    {!currentUser ? (
                         <button onClick={openAuthModal} className={navLinkClass} data-tv-focusable><LogIn /> <span>Entrar</span></button>
                    ) : (
                        <>
                            <NavLink to="/perfil" className={({isActive}) => `${navLinkClass} ${isActive ? activeNavLinkClass : ''}`}><UserCircle /> <span>Minha Conta</span></NavLink>
                            <button onClick={handleLogout} className={navLinkClass}><LogOut /> <span>Sair</span></button>
                        </>
                    )}
                    {isAdmin && <NavLink to="/admin" className={({isActive}) => `${navLinkClass} ${isActive ? activeNavLinkClass : ''}`}><Shield /> <span>Admin</span></NavLink>}
                </nav>
            </aside>

            <main className="ml-60 w-[calc(100%-15rem)] h-screen overflow-y-auto p-8">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <img src="https://i.ibb.co/PGJ87dN5/cineveo-logo-r.png" alt="Loading Logo" className="w-20 h-auto animate-pulse"/>
                    </div>
                ) : children}
            </main>
        </div>
    );
};

export default TVLayout;
