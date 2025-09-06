import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Film, Tv, Smile, Drama, UserCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Footer: React.FC = () => {
    const { currentUser } = useAuth();
    
    const navLinkClass = "flex flex-col items-center justify-center w-full p-1 transition-colors";
    const activeNavLinkClass = "text-yellow-400";
    const inactiveNavLinkClass = "text-gray-400";
    
    return (
        <>
            {/* Desktop Footer */}
            <footer className="hidden md:block text-gray-400 text-sm border-t border-white/10 mt-16">
                <div className="container mx-auto px-4 md:px-8 py-12">
                    
                    {/* Yellow disclaimer box */}
                    <div className="bg-yellow-300 text-red-700 p-4 rounded-lg text-center mb-10">
                        <p className="font-semibold">Este Site Não Hospeda Nada e Não Existe Nenhum Servidor Em Seu Nome, Apenas Pegamos Players De Plataformas Que Disponibilizam Os Embeds Dos Players.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                        {/* Column 1: Também do CineVEO */}
                        <div>
                            <h3 className="font-bold text-lg text-white mb-4">Também Do CineVEO</h3>
                            <ul className="space-y-2">
                                <li><a href="https://streetflix.pro/" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 underline transition-colors">StreetFlix</a></li>
                                <li><a href="https://www.pipocine.site/" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 underline transition-colors">PipoCine</a></li>
                            </ul>
                        </div>

                        {/* Column 2: Nosso Parceiro */}
                        <div>
                            <h3 className="font-bold text-lg text-white mb-4">Nosso Parceiro</h3>
                            <ul className="space-y-2">
                                <li><a href="https://playmax-ten.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 transition-colors">PlayMax</a></li>
                            </ul>
                        </div>

                        {/* Column 3: Navigation */}
                        <div>
                            <h3 className="font-bold text-lg text-white mb-4">Navegação</h3>
                            <ul className="space-y-2">
                                <li><NavLink to="/filmes" className="hover:text-yellow-400 transition-colors">Filmes</NavLink></li>
                                <li><NavLink to="/series" className="hover:text-yellow-400 transition-colors">Séries</NavLink></li>
                                <li><NavLink to="/animacoes" className="hover:text-yellow-400 transition-colors">Animações</NavLink></li>
                                <li><NavLink to="/novelas" className="hover:text-yellow-400 transition-colors">Novelas</NavLink></li>
                            </ul>
                        </div>
                    </div>

                    <div className="text-center text-gray-500 border-t border-gray-800 pt-8 mt-12">
                        <p>&copy; {new Date().getFullYear()} CineVEO. Todos os Direitos Reservados.</p>
                        <p>Email para contato: <a href="mailto:cineveok@gmail.com" className="text-gray-400 hover:text-yellow-500 transition-colors">cineveok@gmail.com</a></p>
                    </div>
                </div>
            </footer>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-white/10 z-40 flex pb-safe">
                <NavLink to="/" className={({isActive}) => `${navLinkClass} ${isActive ? activeNavLinkClass : inactiveNavLinkClass}`}><Home className="w-6 h-6 mb-1" /><span className="text-xs font-semibold">Início</span></NavLink>
                <NavLink to="/filmes" className={({isActive}) => `${navLinkClass} ${isActive ? activeNavLinkClass : inactiveNavLinkClass}`}><Film className="w-6 h-6 mb-1" /><span className="text-xs font-semibold">Filmes</span></NavLink>
                <NavLink to="/series" className={({isActive}) => `${navLinkClass} ${isActive ? activeNavLinkClass : inactiveNavLinkClass}`}><Tv className="w-6 h-6 mb-1" /><span className="text-xs font-semibold">Séries</span></NavLink>
                <NavLink to="/animacoes" className={({isActive}) => `${navLinkClass} ${isActive ? activeNavLinkClass : inactiveNavLinkClass}`}><Smile className="w-6 h-6 mb-1" /><span className="text-xs font-semibold">Animações</span></NavLink>
                <NavLink to="/novelas" className={({isActive}) => `${navLinkClass} ${isActive ? activeNavLinkClass : inactiveNavLinkClass}`}><Drama className="w-6 h-6 mb-1" /><span className="text-xs font-semibold">Novelas</span></NavLink>
                {currentUser && <NavLink to="/perfil" className={({isActive}) => `${navLinkClass} ${isActive ? activeNavLinkClass : inactiveNavLinkClass}`}><UserCircle2 className="w-6 h-6 mb-1" /><span className="text-xs font-semibold">Minha Conta</span></NavLink>}
            </nav>
            <div className="md:hidden h-20"></div>
        </>
    );
};

export default Footer;