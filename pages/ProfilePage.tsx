import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { getAuth, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { firebaseApp } from '../services/firebase';
import toast from 'react-hot-toast';

const ProfilePage: React.FC = () => {
    const { currentUser, userProfile, isAdmin, loading } = useAuth();
    const [displayName, setDisplayName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (currentUser) {
            setDisplayName(currentUser.displayName || '');
        }
    }, [currentUser]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><div className="w-12 h-12 border-4 border-t-yellow-500 border-gray-800 rounded-full animate-spin"></div></div>;
    }

    if (!currentUser) {
        return <Navigate to="/" />;
    }

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        setIsSaving(true);
        const firestore = getFirestore(firebaseApp);
        
        try {
            if (displayName !== currentUser.displayName) {
                await updateProfile(currentUser, { displayName });
            }
            const userDocRef = doc(firestore, "users", currentUser.uid);
            await setDoc(userDocRef, {
                displayName: displayName
            }, { merge: true });
            
            toast.success('Perfil atualizado com sucesso!');
            // A atualização do contexto será tratada pelo onAuthStateChanged
        } catch (error: any) {
            toast.error(`Erro ao atualizar perfil: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleResetPassword = () => {
        if (!currentUser?.email) return;
        const auth = getAuth(firebaseApp);
        sendPasswordResetEmail(auth, currentUser.email)
            .then(() => {
                toast.success('Email de redefinição de senha enviado!');
            })
            .catch((error) => {
                toast.error(`Erro: ${error.message}`);
            });
    };

    const profilePic = userProfile?.photoURL || currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName || 'U')}&background=1f2937&color=f3f4f6&size=128`;

    return (
        <div className="container mx-auto px-4 sm:px-6 py-24 md:py-32">
            <div className="max-w-2xl mx-auto bg-gray-900 rounded-lg p-6 md:p-8 shadow-lg border border-white/10">
                <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-8 border-b border-white/10">
                     <img src={profilePic} alt="Foto de Perfil" className="w-24 h-24 rounded-full object-cover border-4 border-gray-800" />
                     <div className="text-center sm:text-left">
                        <h1 className="text-3xl font-bold text-white inline-flex items-center">
                            {currentUser.displayName}
                            {isAdmin && <img src="https://i.ibb.co/mr16xgYy/Chat-GPT-Image-18-de-ago-de-2025-01-35-17-removebg-preview.png" alt="Admin" className="w-5 h-5 ml-2" />}
                        </h1>
                        <p className="text-gray-400">{userProfile?.username || 'Sem nome de usuário'}</p>
                        <p className="text-yellow-400/80 text-sm mt-1">{currentUser.email}</p>
                    </div>
                </div>
                <h2 className="text-xl font-bold text-white mb-6">Editar Perfil</h2>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div>
                        <label htmlFor="profile-displayname" className="block mb-2 text-sm font-medium text-gray-400">Nome de Exibição</label>
                        <input
                            type="text"
                            id="profile-displayname"
                            className="bg-black border border-white/20 text-white text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-3"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button type="submit" disabled={isSaving} className="w-full sm:w-auto text-black bg-yellow-500 hover:bg-yellow-600 font-bold rounded-lg text-sm px-6 py-3 text-center disabled:opacity-50">
                            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                        <button type="button" onClick={handleResetPassword} className="w-full sm:w-auto text-white bg-gray-700 hover:bg-gray-600 font-bold rounded-lg text-sm px-6 py-3 text-center">
                            Redefinir Senha
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;