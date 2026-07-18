import { db, auth } from '../lib/firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

let useFirestoreCached: boolean | null = null;

export async function isFirestoreActive(): Promise<boolean> {
  if (useFirestoreCached !== null) {
    return useFirestoreCached;
  }
  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      const data = await res.json();
      useFirestoreCached = data.useFirestore === true;
    } else {
      useFirestoreCached = false;
    }
  } catch (err) {
    console.warn('Could not fetch active config status, falling back to false:', err);
    useFirestoreCached = false;
  }
  return useFirestoreCached;
}

export { db, auth, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where };
