import { LibraryBook } from '../types';
import { LibraryRepository } from '../repositories/LibraryRepository';

export const libraryService = {
  async getBooks(): Promise<LibraryBook[]> {
    return LibraryRepository.getBooks();
  },

  async createBook(bookData: Partial<LibraryBook>): Promise<LibraryBook> {
    return LibraryRepository.createBook(bookData);
  },

  async deleteBook(id: string): Promise<void> {
    return LibraryRepository.deleteBook(id);
  },

  async updateBook(id: string, bookData: Partial<LibraryBook>): Promise<LibraryBook> {
    return LibraryRepository.updateBook(id, bookData);
  },

  async replaceBook(id: string, bookData: Partial<LibraryBook>): Promise<LibraryBook> {
    return LibraryRepository.replaceBook(id, bookData);
  },

  async downloadBook(id: string, user: any): Promise<any> {
    return LibraryRepository.downloadBook(id, user);
  }
};
