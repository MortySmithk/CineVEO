
import { Injectable, computed, inject, signal } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, Auth, onAuthStateChanged, User,
  GoogleAuthProvider, signInWithPopup, 
  createUserWithEmailAndPassword, signInWithEmailAndPassword, 
  updateProfile, signOut, setPersistence, browserLocalPersistence, 
  sendPasswordResetEmail 
} from 'firebase/auth';
import { 
  getFirestore, Firestore, doc, getDoc, setDoc, 
  serverTimestamp, collection, query, where, getDocs, Timestamp
} from 'firebase/firestore';
import { NotificationService } from './notification.service';
import { Router } from '@angular/router';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  username?: string;
  photoURL?: string;
  createdAt: any;
  premium?: {
    plan: 'premium' | 'lifetime';
    grantedAt: any;
    expiresAt: Timestamp | null;
  }
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  private app: FirebaseApp;
  private auth: Auth;
  private firestore: Firestore;

  currentUser = signal<User | null>(null);
  userProfile = signal<UserProfile | null>(null);
  
  private readonly ADMIN_UIDS = ['YHBxowyZv0hzld7hypnEWHvx5K82', 'tMdWtkeZ7PYBk4l4UNKnbrLQ4i32'];
  
  isAdmin = computed(() => {
    const user = this.currentUser();
    return user ? this.ADMIN_UIDS.includes(user.uid) : false;
  });

  isPremium = computed(() => {
    const profile = this.userProfile();
    if (!profile || !profile.premium) return false;
    if (profile.premium.plan === 'lifetime') return true;
    if (profile.premium.expiresAt && profile.premium.expiresAt.toDate() > new Date()) return true;
    return false;
  });

  constructor() {
    const firebaseConfig = {
      apiKey: "AIzaSyCNEGDpDLuWYrxTkoONy4oQujnatx6KIS8",
      authDomain: "cineveok.firebaseapp.com",
      projectId: "cineveok",
      storageBucket: "cineveok.appspot.com",
    };

    this.app = initializeApp(firebaseConfig);
    this.auth = getAuth(this.app);
    this.firestore = getFirestore(this.app);

    setPersistence(this.auth, browserLocalPersistence);

    onAuthStateChanged(this.auth, async (user) => {
      this.currentUser.set(user);
      if (user) {
        await this.fetchUserProfile(user.uid);
      } else {
        this.userProfile.set(null);
      }
    });
  }

  async fetchUserProfile(uid: string): Promise<UserProfile | null> {
    const userDocRef = doc(this.firestore, "users", uid);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      const profile = docSnap.data() as UserProfile;
      this.userProfile.set(profile);
      return profile;
    }
    return null;
  }

  async googleLogin() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      const user = result.user;
      
      const userDocRef = doc(this.firestore, "users", user.uid);
      const docSnap = await getDoc(userDocRef);
      if (!docSnap.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          username: '',
          createdAt: serverTimestamp()
        });
      }
      this.notificationService.show('Login com Google realizado com sucesso!', 'success');
    } catch (error: any) {
      this.notificationService.show(`Erro no login com Google: ${error.message}`, 'error');
    }
  }

  async registerWithEmail(name: string, email: string, password: string) {
    try {
      const cred = await createUserWithEmailAndPassword(this.auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await setDoc(doc(this.firestore, "users", cred.user.uid), {
        uid: cred.user.uid,
        displayName: name,
        email,
        username: '',
        createdAt: serverTimestamp()
      });
      this.notificationService.show('Conta criada com sucesso!', 'success');
    } catch (error: any) {
      const message = error.code === 'auth/email-already-in-use' ? 'Este email já está em uso.' : 'Erro ao criar conta.';
      this.notificationService.show(message, 'error');
    }
  }

  async loginWithEmail(email: string, password: string) {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
      this.notificationService.show('Login realizado com sucesso!', 'success');
    } catch (error: any) {
      this.notificationService.show('Email ou senha inválidos.', 'error');
    }
  }

  async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(this.auth, email);
      this.notificationService.show('Email de redefinição de senha enviado!', 'success');
    } catch(error: any) {
      this.notificationService.show('Erro ao enviar email. Verifique o endereço.', 'error');
    }
  }

  async logout() {
    await signOut(this.auth);
    this.notificationService.show('Você saiu da sua conta.', 'info');
    this.router.navigate(['/']);
  }
  
  async isUsernameTaken(username: string, userId: string): Promise<boolean> {
    const q = query(collection(this.firestore, "users"), where("username", "==", `@${username.toLowerCase()}`));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return false;
    return snapshot.docs[0].id !== userId;
  }

  async updateUserProfile(uid: string, data: { displayName?: string, username?: string, photoURL?: string}) {
    if(!this.currentUser()) return;
    
    // Update auth profile
    if(data.displayName || data.photoURL) {
      await updateProfile(this.currentUser()!, { displayName: data.displayName, photoURL: data.photoURL });
    }
    
    // Update firestore profile
    const userDocRef = doc(this.firestore, "users", uid);
    await setDoc(userDocRef, { 
        ...data, 
        username: data.username ? `@${data.username}`: '' 
    }, { merge: true });

    await this.fetchUserProfile(uid); // Refresh profile
    this.notificationService.show('Perfil atualizado com sucesso!', 'success');
  }

  async grantPremium(uid: string, plan: 'premium' | 'lifetime', days: number = 30) {
    const userDocRef = doc(this.firestore, "users", uid);
    let premiumData = {};

    if (plan === 'lifetime') {
        premiumData = { plan: 'lifetime', grantedAt: serverTimestamp(), expiresAt: null };
    } else {
        const now = new Date();
        const expiryDate = new Date(now.setDate(now.getDate() + days));
        premiumData = { plan: 'premium', grantedAt: serverTimestamp(), expiresAt: Timestamp.fromDate(expiryDate) };
    }
    await setDoc(userDocRef, { premium: premiumData }, { merge: true });
  }

  async getFirestoreMediaData(id: string) {
    const firestoreDocRef = doc(this.firestore, "media", id);
    const docSnap = await getDoc(firestoreDocRef);
    return docSnap.exists() ? docSnap.data() : null;
  }
}
