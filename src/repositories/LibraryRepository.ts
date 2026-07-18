import { LibraryBook } from '../types';
import { isFirestoreActive, db, collection, doc, getDocs, setDoc, deleteDoc } from './base';

export const LibraryRepository = {
  async getBooks(): Promise<LibraryBook[]> {
    if (await isFirestoreActive()) {
      try {
        const querySnapshot = await getDocs(collection(db, 'books'));
        const books: LibraryBook[] = [];
        querySnapshot.forEach((doc) => {
          books.push({ id: doc.id, ...doc.data() } as LibraryBook);
        });
        return books;
      } catch (err) {
        console.warn('Firestore getBooks failed, falling back to API:', err);
      }
    }

    const res = await fetch('/api/books');
    if (!res.ok) throw new Error('Failed to fetch library books');
    return res.json();
  },

  async createBook(bookData: Partial<LibraryBook>): Promise<LibraryBook> {
    const id = bookData.id || `book-${Date.now()}`;
    const fullBook = { ...bookData, id } as LibraryBook;

    if (await isFirestoreActive()) {
      try {
        await setDoc(doc(db, 'books', id), fullBook);
      } catch (err) {
        console.warn('Firestore createBook failed:', err);
      }
    }

    const res = await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullBook),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add book');
    }
    return res.json();
  },

  async deleteBook(id: string): Promise<void> {
    if (await isFirestoreActive()) {
      try {
        await deleteDoc(doc(db, 'books', id));
      } catch (err) {
        console.warn('Firestore deleteBook failed:', err);
      }
    }

    const res = await fetch(`/api/books/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete book');
    }
  },

  async updateBook(id: string, bookData: Partial<LibraryBook>): Promise<LibraryBook> {
    if (await isFirestoreActive()) {
      try {
        await setDoc(doc(db, 'books', id), bookData, { merge: true });
      } catch (err) {
        console.warn('Firestore updateBook failed:', err);
      }
    }

    const res = await fetch(`/api/books/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update book');
    }
    return res.json();
  },

  async replaceBook(id: string, bookData: Partial<LibraryBook>): Promise<LibraryBook> {
    if (await isFirestoreActive()) {
      try {
        await setDoc(doc(db, 'books', id), bookData);
      } catch (err) {
        console.warn('Firestore replaceBook failed:', err);
      }
    }

    const res = await fetch(`/api/books/${id}/replace`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to replace book');
    }
    return res.json();
  },

  async downloadBook(id: string, user: any): Promise<any> {
    const res = await fetch(`/api/books/${id}/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user }),
    });
    if (!res.ok) {
      throw new Error('Download failed');
    }
    return res;
  }
};
