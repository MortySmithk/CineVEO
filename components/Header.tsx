import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Home, Film, Tv, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getAuth, signOut } from 'firebase/auth';
import { firebaseApp } from '../services/firebase';
import toast from 'react-hot-toast';

const Header: React.FC = () => {
    const { currentUser } = useAuth();
    const location = useLocation();

    const handleLogout = () => {
        const auth = getAuth(firebaseApp);
        signOut(auth).then(() => toast.success('Você saiu da sua conta.'));
    };

    const navLinkClass = "hidden md:flex items-center gap-2 px-4 py-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors font-medium";
    const activeNavLinkClass = "text-white bg-white/10";

    return (
        <header className="fixed top-0 left-0 right-0 z-40 bg-black/50 backdrop-blur-lg border-b border-white/10">
            <nav className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link to="/">
                        <img src="https://i.ibb.co/s91tyczd/Gemini-Generated-Image-ejjiocejjiocejji-1.png" alt="Logo CineVEO" className="h-9 w-auto" />
                    </Link>
                    <div className="flex items-center gap-4">
                       <NavLink to="/" className={({isActive}) => `${navLinkClass} ${isActive && activeNavLinkClass}`}><Home size={20} /> Início</NavLink>
                       <NavLink to="/filmes" className={({isActive}) => `${navLinkClass} ${isActive && activeNavLinkClass}`}><Film size={20} /> Filmes</NavLink>
                       <NavLink to="/series" className={({isActive}) => `${navLinkClass} ${isActive && activeNavLinkClass}`}><Tv size={20} /> Séries</NavLink>
                       <NavLink to="/pesquisar" className={({isActive}) => `${navLinkClass} ${isActive && activeNavLinkClass}`}><Search size={20} /> Buscar</NavLink>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Link to="/pesquisar" className="md:hidden text-gray-400 hover:text-white"><Search size={24} /></Link>
                    {currentUser ? (
                         <div className="relative group">
                            <Link to="/perfil">
                                <img src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName || 'U')}&background=1f2937&color=f3f4f6&size=64`} alt="Perfil" className="w-10 h-10 rounded-full object-cover border-2 border-gray-700 group-hover:border-yellow-500 transition-colors" />
                            </Link>
                            <div className="absolute top-full right-0 mt-2 w-48 bg-gray-900 border border-white/10 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                                <div className="p-2">
                                    <Link to="/perfil" className="block w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded">Minha Conta</Link>
                                    <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-800 rounded">Sair</button>
                                </div>
                            </div>
                        </div>
                    ) : (
                         <Link to="/#auth" state={{ from: location }} className="bg-yellow-500 text-black font-bold py-2 px-5 rounded-lg hover:bg-yellow-600 transition text-sm whitespace-nowrap">Entrar</Link>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Header;