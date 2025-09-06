import React, { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { useDeviceType } from './hooks/useDeviceType';
import { AuthProvider } from './contexts/AuthContext';

import DesktopMobileLayout from './layouts/DesktopMobileLayout';
import TVLayout from './layouts/TVLayout';

import HomePage from './pages/HomePage';
import DetailPage from './pages/DetailPage';
import CatalogPage from './pages/CatalogPage';
import SearchPage from './pages/SearchPage';
import ProfilePage from './pages/ProfilePage';
import GenrePage from './pages/GenrePage';

export default function App() {
    const deviceType = useDeviceType();

    useEffect(() => {
        document.body.classList.remove('device-desktop', 'device-mobile', 'device-tv');
        document.body.classList.add(`device-${deviceType}`);
        document.body.style.fontFamily = "'Inter', sans-serif";
    }, [deviceType]);

    const routes = (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/filmes" element={<CatalogPage type="movie" title="Todos os Filmes" />} />
            <Route path="/series" element={<CatalogPage type="tv" title="Todas as Séries" />} />
            <Route path="/animacoes" element={<CatalogPage type="movie" genreId="16" title="Animações" />} />
            <Route path="/novelas" element={<CatalogPage type="tv" genreId="10766" title="Novelas" />} />
            <Route path="/media/:type/:id" element={<DetailPage />} />
            <Route path="/media/:type/:id/:season/:episode" element={<DetailPage />} />
            <Route path="/genre/:id/:name" element={<GenrePage />} />
            <Route path="/busca/:query" element={<CatalogPage type="search" />} />
            <Route path="/pesquisar" element={<SearchPage />} />
            <Route path="/perfil" element={<ProfilePage />} />
        </Routes>
    );

    return (
        <AuthProvider>
            <HashRouter>
                {deviceType === 'tv' ? (
                    <TVLayout>{routes}</TVLayout>
                ) : (
                    <DesktopMobileLayout>{routes}</DesktopMobileLayout>
                )}
            </HashRouter>
            <Toaster
                position="top-right"
                toastOptions={{
                    className: 'font-sans',
                    style: {
                        background: '#27272a',
                        color: '#fff',
                    },
                }}
            />
        </AuthProvider>
    );
}