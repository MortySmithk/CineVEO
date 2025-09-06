import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    updateProfile, 
    sendPasswordResetEmail,
    signInWithPopup,
    GoogleAuthProvider
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseApp } from '../services/firebase';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

type View = 'login' | 'register' | 'forgot';

const AuthModal: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(location.hash === '#auth');
    const [view, setView] = useState<View>('login');
    const [error, setError] = useState('');

    useEffect(() => {
        setIsOpen(location.hash === '#auth');
    }, [location]);

    const closeModal = () => {
        const from = location.state?.from || location.pathname;
        navigate(from, { replace: true });
        setError('');
        setView('login');
    };
    
    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        const auth = getAuth(firebaseApp);
        const firestore = getFirestore(firebaseApp);
        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const name = formData.get('name') as string;

        try {
            let userCredential;
            if (view === 'login') {
                userCredential = await signInWithEmailAndPassword(auth, email, password);
                toast.success('Login bem-sucedido!');
            } else if (view === 'register') {
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                await updateProfile(user, { displayName: name });
                await setDoc(doc(firestore, "users", user.uid), {
                    displayName: name,
                    email,
                    createdAt: serverTimestamp()
                });
                toast.success('Conta criada com sucesso!');
            } else if (view === 'forgot') {
                await sendPasswordResetEmail(auth, email);
                toast.success('Email de redefinição enviado!');
                setView('login');
                return;
            }
            const from = location.state?.from || '/';
            navigate(from, { replace: true });
        } catch (err: any) {
             switch(err.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    setError('Email ou senha inválidos.');
                    break;
                case 'auth/email-already-in-use':
                    setError('Este email já está em uso.');
                    break;
                default:
                    setError('Ocorreu um erro. Tente novamente.');
            }
        }
    };

    if (!isOpen) return null;
    
    const title = view === 'login' ? 'Acessar Conta' : view === 'register' ? 'Criar Conta' : 'Redefinir Senha';

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
            <div className="bg-black w-full max-w-md rounded-lg border border-gray-800 shadow-2xl shadow-yellow-500/10" onClick={e => e.stopPropagation()}>
                <div className="p-8 relative">
                    <button onClick={closeModal} className="absolute top-4 right-4 text-gray-600 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                    <div className="text-center mb-8">
                        <img src="https://i.ibb.co/PGJ87dN5/cineveo-logo-r.png" alt="Logo CineVEO" className="h-10 w-auto mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white">{title}</h2>
                    </div>

                    {error && <p className="text-red-400 text-center text-sm mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-md">{error}</p>}
                    
                    <form onSubmit={handleFormSubmit} className="space-y-5">
                       {view === 'register' && (
                           <input name="name" type="text" className="futuristic-input" placeholder="Nome Completo" required />
                       )}
                       
                       <input name="email" type="email" className="futuristic-input" placeholder="Seu melhor email" required />
                       
                       {view !== 'forgot' && (
                           <input name="password" type="password" className="futuristic-input" placeholder="Senha secreta" required />
                       )}

                       <button type="submit" className="w-full bg-yellow-500 text-black font-bold py-3 rounded-lg hover:bg-yellow-600 transition-all duration-300 transform hover:scale-105">
                           {view === 'login' ? 'Entrar' : view === 'register' ? 'Registrar' : 'Enviar Link'}
                       </button>
                    </form>

                    <div className="text-center mt-6 text-sm">
                        {view === 'login' && (
                           <p className="text-gray-400">Não tem uma conta? <button onClick={() => setView('register')} className="font-semibold text-yellow-400 hover:underline">Cadastre-se</button></p>
                        )}
                        {view === 'register' && (
                           <p className="text-gray-400">Já tem uma conta? <button onClick={() => setView('login')} className="font-semibold text-yellow-400 hover:underline">Faça login</button></p>
                        )}
                         {view === 'login' && (
                           <p className="mt-2"><button onClick={() => setView('forgot')} className="text-gray-400 hover:text-yellow-400 text-xs hover:underline">Esqueceu sua senha?</button></p>
                        )}
                         {view === 'forgot' && (
                           <p className="text-gray-400">Lembrou a senha? <button onClick={() => setView('login')} className="font-semibold text-yellow-400 hover:underline">Faça login</button></p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;