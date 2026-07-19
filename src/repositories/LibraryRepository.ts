import { LibraryBook } from '../types';
import { db, collection, doc, getDocs, setDoc, deleteDoc } from './base';

export const LibraryRepository = {
  async getBooks(): Promise<LibraryBook[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'books'));
      const books: LibraryBook[] = [];
      querySnapshot.forEach((doc) => {
        books.push({ id: doc.id, ...doc.data() } as LibraryBook);
      });
      return books;
    } catch (err) {
      console.error('Firestore getBooks failed:', err);
      throw err;
    }
  },

  async createBook(bookData: Partial<LibraryBook>): Promise<LibraryBook> {
    const id = bookData.id || `book-${Date.now()}`;
    const fullBook = { ...bookData, id } as LibraryBook;

    try {
      await setDoc(doc(db, 'books', id), fullBook);
      return fullBook;
    } catch (err) {
      console.error('Firestore createBook failed:', err);
      throw err;
    }
  },

  async deleteBook(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'books', id));
    } catch (err) {
      console.error('Firestore deleteBook failed:', err);
      throw err;
    }
  },

  async updateBook(id: string, bookData: Partial<LibraryBook>): Promise<LibraryBook> {
    try {
      await setDoc(doc(db, 'books', id), bookData, { merge: true });
      return { ...bookData, id } as LibraryBook;
    } catch (err) {
      console.error('Firestore updateBook failed:', err);
      throw err;
    }
  },

  async replaceBook(id: string, bookData: Partial<LibraryBook>): Promise<LibraryBook> {
    try {
      await setDoc(doc(db, 'books', id), bookData);
      return { ...bookData, id } as LibraryBook;
    } catch (err) {
      console.error('Firestore replaceBook failed:', err);
      throw err;
    }
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

