import React, { useState } from 'react';
import {
  Library, BookOpen, BookMarked, Calendar, Coins, Search, Plus, X, Barcode, MapPin, Download, Check
} from 'lucide-react';
import { Student } from '../types';
import DigitalLibrary from './DigitalLibrary';

interface LibraryManagementProps {
  students: Student[];
  showToast: (title: string, desc: string, type?: 'success' | 'info') => void;
}

const INITIAL_BOOKS = [
  { id: 'b1', title: 'Concepts of Physics (Vol 1)', author: 'H.C. Verma', stock: 14, category: 'Physics', isbn: '978-8177091809', barcode: 'BAR-PH1', location: 'Shelf A1', price: 450 },
  { id: 'b2', title: 'Organic Chemistry (7th Ed)', author: 'Morrison & Boyd', stock: 5, category: 'Chemistry', isbn: '978-8131704813', barcode: 'BAR-CH1', location: 'Shelf B2', price: 850 },
  { id: 'b3', title: 'Advanced Problems in Mathematics', author: 'Vikas Gupta', stock: 8, category: 'Maths', isbn: '978-9381223456', barcode: 'BAR-MA1', location: 'Shelf C3', price: 650 },
];

export default function LibraryManagement({ students = [], showToast }: LibraryManagementProps) {
  const [books, setBooks] = useState(INITIAL_BOOKS);
  const [libraryActiveSubTab, setLibraryActiveSubTab] = useState<'catalog' | 'logs' | 'fines' | 'digital'>('catalog');
  const [librarySearchQuery, setLibrarySearchQuery] = useState('');
  const [libraryCategoryFilter, setLibraryCategoryFilter] = useState('All');
  const [libraryStatusFilter, setLibraryStatusFilter] = useState('All');
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [newBookForm, setNewBookForm] = useState({
    title: '',
    author: '',
    stock: 5,
    category: 'Physics',
    isbn: '',
    barcode: '',
    location: '',
    price: 350
  });

  const [libraryLogs, setLibraryLogs] = useState([
    { 
      id: 'libl1', 
      bookId: 'b1',
      bookTitle: 'Concepts of Physics (Vol 1)', 
      studentId: students[0]?.id || 's1',
      studentName: students[0]?.name || 'Aarav Sharma', 
      issueDate: '2026-06-20', 
      dueDate: '2026-07-04', 
      fine: 50, 
      finePaid: 0,
      status: 'Issued' 
    },
    { 
      id: 'libl2', 
      bookId: 'b2',
      bookTitle: 'Organic Chemistry (7th Ed)', 
      studentId: students[1]?.id || 's2',
      studentName: students[1]?.name || 'Priya Patel', 
      issueDate: '2026-06-10', 
      dueDate: '2026-06-24', 
      fine: 150, 
      finePaid: 50,
      status: 'Issued' 
    },
    { 
      id: 'libl3', 
      bookId: 'b3',
      bookTitle: 'Advanced Problems in Mathematics', 
      studentId: students[0]?.id || 's1',
      studentName: students[0]?.name || 'Aarav Sharma', 
      issueDate: '2026-05-01', 
      dueDate: '2026-05-15', 
      fine: 200, 
      finePaid: 200,
      status: 'Returned' 
    }
  ]);
  const [issueBook, setIssueBook] = useState({ bookId: 'b1', studentId: students[0]?.id || '' });

  const [barcodeScannerInput, setBarcodeScannerInput] = useState('');
  const [scannerMatchedBook, setScannerMatchedBook] = useState<any | null>(null);

  type DigitalBookType = {
    id: string;
    title: string;
    author: string;
    resourceType: 'E-Book' | 'PDF Notes' | 'Practice Worksheet' | 'Previous Year Paper';
    fileUrl: string;
    downloadCount: number;
    addedDate: string;
    fileSize: string;
  };

  const [digitalBooks, setDigitalBooks] = useState<DigitalBookType[]>([
    { id: 'db1', title: 'Concepts of Physics - High-Yield Notes', author: 'H.C. Verma', resourceType: 'PDF Notes', fileUrl: 'https://learnersden.com/files/hcverma_physics_notes.pdf', downloadCount: 145, addedDate: '2026-06-12', fileSize: '12.4 MB' },
    { id: 'db2', title: 'Organic Reaction Mechanism Step-by-Step Guide', author: 'Morrison Verma', resourceType: 'PDF Notes', fileUrl: 'https://learnersden.com/files/organic_mechanisms.pdf', downloadCount: 88, addedDate: '2026-06-20', fileSize: '8.1 MB' },
    { id: 'db3', title: 'IIT JEE Advanced Maths 2025 Mock Test Series', author: 'Vikas Gupta', resourceType: 'Practice Worksheet', fileUrl: 'https://learnersden.com/files/jee_maths_mock2025.pdf', downloadCount: 210, addedDate: '2026-07-02', fileSize: '5.6 MB' }
  ]);
  const [isAddingDigitalBook, setIsAddingDigitalBook] = useState(false);
  const [newDigitalBookForm, setNewDigitalBookForm] = useState({
    title: '',
    author: '',
    resourceType: 'PDF Notes' as 'E-Book' | 'PDF Notes' | 'Practice Worksheet' | 'Previous Year Paper',
    fileUrl: '',
    fileSize: '4.5 MB'
  });

  const [activePayingFineLog, setActivePayingFineLog] = useState<any | null>(null);
  const [finePaymentForm, setFinePaymentForm] = useState({
    amountToPay: 0,
    paymentMode: 'UPI' as 'Cash' | 'Card' | 'UPI',
    transactionId: ''
  });

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Library className="h-6 w-6 text-indigo-600 font-bold" />
            Learner's Den Institutional Library
          </h2>
          <p className="text-xs text-slate-400 mt-1">Manage textbook inventories, track issue/returns, calculate late penalties, collect fines, and offer digital learning resources.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-[11px] font-black bg-slate-100 text-slate-600 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5">
            🗓️ System Date: <strong className="text-slate-800">2026-07-09</strong>
          </span>
        </div>
      </div>

      {/* Library Stats Indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Catalog Size</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-slate-800">{books.length}</span>
            <span className="text-xxs text-slate-400 font-bold">titles</span>
            <span className="text-xs font-bold text-slate-500 ml-1">({books.reduce((acc, b) => acc + b.stock, 0)} units)</span>
          </div>
        </div>

        <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Active Borrows</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-indigo-600">
              {libraryLogs.filter(l => l.status === 'Issued').length}
            </span>
            <span className="text-xxs text-slate-400 font-bold">books lent</span>
          </div>
        </div>

        <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-1">
          <span className="text-[10px] font-extrabold text-rose-500 uppercase tracking-wider block">Overdue Borrows</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-rose-600">
              {libraryLogs.filter(l => {
                if (l.status !== 'Issued') return false;
                return new Date(l.dueDate) < new Date('2026-07-09');
              }).length}
            </span>
            <span className="text-xxs text-slate-400 font-bold">books late</span>
          </div>
        </div>

        <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-1">
          <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider block">Unpaid Dues</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-amber-600">
              ₹{libraryLogs.reduce((acc, l) => acc + (l.fine - l.finePaid), 0)}
            </span>
            <span className="text-xxs text-slate-400 font-bold">outstanding</span>
          </div>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto scrollbar-none pb-px">
        {[
          { id: 'catalog', label: 'Books Catalog', icon: BookMarked },
          { id: 'logs', label: 'Issue & Returns', icon: Calendar },
          { id: 'fines', label: 'Fines Ledger', icon: Coins },
          { id: 'digital', label: 'Digital Library', icon: BookOpen }
        ].map(tab => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setLibraryActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                libraryActiveSubTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <TabIcon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Sub-Tab 1: Books Catalog */}
      {libraryActiveSubTab === 'catalog' && (
        <div className="space-y-6 text-left">
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-4 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title, author, ISBN..."
                value={librarySearchQuery}
                onChange={(e) => setLibrarySearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-250 rounded-xl text-xs text-slate-800 font-semibold focus:outline-indigo-500 focus:bg-white"
              />
            </div>

            <div className="md:col-span-3">
              <select
                value={libraryCategoryFilter}
                onChange={(e) => setLibraryCategoryFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-250 rounded-xl p-2 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
              >
                <option value="All">All Categories</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Maths">Mathematics</option>
                <option value="Biology">Biology</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <select
                value={libraryStatusFilter}
                onChange={(e) => setLibraryStatusFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-250 rounded-xl p-2 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
              >
                <option value="All">All Statuses</option>
                <option value="Available">Available (&gt; 0)</option>
                <option value="Low Stock">Low Stock (1 - 3)</option>
                <option value="Out of Stock">Out of Stock (0)</option>
              </select>
            </div>

            <button
              onClick={() => setIsAddingBook(!isAddingBook)}
              className="md:col-span-2 flex items-center justify-center gap-1.5 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add New Book
            </button>
          </div>

          {/* Barcode Scanner Simulator */}
          <div className="border border-indigo-100 rounded-2xl p-4 bg-indigo-50/30 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-black text-indigo-900 flex items-center gap-1.5">
                  <Barcode className="h-4 w-4 text-indigo-600" />
                  Barcode Scanner Simulator
                </h4>
                <p className="text-[10px] text-slate-400 font-medium">Type ISBN, Barcode ID or click a demo chip below to simulate scanning a book instantly.</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Simulate barcode swipe..."
                  value={barcodeScannerInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBarcodeScannerInput(val);
                    const found = books.find(b => b.barcode.toLowerCase() === val.toLowerCase() || b.isbn.replace(/-/g, '').toLowerCase() === val.replace(/-/g, '').toLowerCase());
                    if (found) {
                      setScannerMatchedBook(found);
                      setBarcodeScannerInput('');
                      showToast("Scan Success", `Instantly loaded "${found.title}" via scanner code!`);
                    }
                  }}
                  className="bg-white border border-indigo-200 rounded-lg px-2.5 py-1 text-xs text-indigo-900 font-bold focus:outline-indigo-500 placeholder:text-slate-300 w-48"
                />
              </div>
            </div>

            {/* Quick Chips */}
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase mr-1">Demo Codes:</span>
              {books.map(b => (
                <button
                  key={b.id}
                  onClick={() => {
                    setScannerMatchedBook(b);
                    showToast("Scan Simulated", `Scanned barcode: ${b.barcode}`);
                  }}
                  className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-extrabold text-indigo-600 hover:bg-indigo-50 cursor-pointer transition-all flex items-center gap-1"
                >
                  📟 {b.barcode} ({b.category})
                </button>
              ))}
            </div>

            {/* Scanner Match Modal View */}
            {scannerMatchedBook && (
              <div className="mt-3 bg-white border border-indigo-200 rounded-xl p-4 space-y-3 shadow-xs relative">
                <button
                  onClick={() => setScannerMatchedBook(null)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-150 rounded text-[9px] font-black uppercase tracking-wider">
                      Scanned Match Info
                    </span>
                    <h4 className="text-sm font-black text-slate-800 mt-1">{scannerMatchedBook.title}</h4>
                    <p className="text-xs text-slate-500 font-bold">Author: {scannerMatchedBook.author} | Shelf: <span className="text-slate-800 font-black">{scannerMatchedBook.location}</span></p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xxs text-slate-400 font-bold">Visual Barcode</span>
                    <div className="flex gap-0.5 h-6 bg-slate-100 p-1 border border-slate-200 rounded">
                      {[2, 4, 1, 3, 1, 4, 2, 3, 1].map((width, i) => (
                        <div key={i} className="bg-black h-full" style={{ width: `${width}px` }} />
                      ))}
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 font-bold">{scannerMatchedBook.barcode}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-100 pt-3">
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Available Stock</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-black text-slate-800">{scannerMatchedBook.stock} units</span>
                      <button
                        onClick={() => {
                          const updated = books.map(b => b.id === scannerMatchedBook.id ? { ...b, stock: b.stock + 1 } : b);
                          setBooks(updated);
                          setScannerMatchedBook({ ...scannerMatchedBook, stock: scannerMatchedBook.stock + 1 });
                          showToast("Stock Updated", "Stock incremented successfully!");
                        }}
                        className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded font-black text-xs cursor-pointer"
                      >
                        +
                      </button>
                      <button
                        onClick={() => {
                          if (scannerMatchedBook.stock <= 0) return;
                          const updated = books.map(b => b.id === scannerMatchedBook.id ? { ...b, stock: b.stock - 1 } : b);
                          setBooks(updated);
                          setScannerMatchedBook({ ...scannerMatchedBook, stock: scannerMatchedBook.stock - 1 });
                          showToast("Stock Updated", "Stock decremented successfully!");
                        }}
                        className="p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded font-black text-xs cursor-pointer"
                      >
                        -
                      </button>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Reference ISBN</span>
                    <span className="text-xs font-black text-slate-700 block mt-1">{scannerMatchedBook.isbn}</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-center">
                    <button
                      onClick={() => {
                        setIssueBook({ ...issueBook, bookId: scannerMatchedBook.id });
                        setLibraryActiveSubTab('logs');
                        setScannerMatchedBook(null);
                        showToast("Redirected to Checkout", `Ready to issue "${scannerMatchedBook.title}"!`);
                      }}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-black cursor-pointer transition-all"
                    >
                      Rent / Issue Book
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Add New Book Form */}
          {isAddingBook && (
            <div className="border border-slate-250 rounded-2xl p-5 bg-slate-50/50 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Register Reference Textbook</h3>
                <button onClick={() => setIsAddingBook(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Book Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Inorganic Chemistry Part II"
                    value={newBookForm.title}
                    onChange={(e) => setNewBookForm({...newBookForm, title: e.target.value})}
                    className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Author Name</label>
                  <input
                    type="text"
                    placeholder="e.g. J.D. Lee"
                    value={newBookForm.author}
                    onChange={(e) => setNewBookForm({...newBookForm, author: e.target.value})}
                    className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Academic Category</label>
                  <select
                    value={newBookForm.category}
                    onChange={(e) => setNewBookForm({...newBookForm, category: e.target.value})}
                    className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Maths">Mathematics</option>
                    <option value="Biology">Biology</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Shelving Stock Count</label>
                  <input
                    type="number"
                    min="1"
                    value={newBookForm.stock}
                    onChange={(e) => setNewBookForm({...newBookForm, stock: parseInt(e.target.value) || 0})}
                    className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">ISBN 13 Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 978-0131402836"
                    value={newBookForm.isbn}
                    onChange={(e) => setNewBookForm({...newBookForm, isbn: e.target.value})}
                    className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Custom Barcode ID</label>
                  <input
                    type="text"
                    placeholder="e.g. BAR-CH5"
                    value={newBookForm.barcode}
                    onChange={(e) => setNewBookForm({...newBookForm, barcode: e.target.value})}
                    className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Shelf Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Shelf C4"
                    value={newBookForm.location}
                    onChange={(e) => setNewBookForm({...newBookForm, location: e.target.value})}
                    className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Book Unit Price (₹)</label>
                  <input
                    type="number"
                    value={newBookForm.price}
                    onChange={(e) => setNewBookForm({...newBookForm, price: parseInt(e.target.value) || 0})}
                    className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsAddingBook(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!newBookForm.title || !newBookForm.author) {
                      showToast("Invalid Form", "Title and Author are required!", "info");
                      return;
                    }
                    const newBook = {
                      id: `b${books.length + 1}`,
                      title: newBookForm.title,
                      author: newBookForm.author,
                      stock: newBookForm.stock,
                      category: newBookForm.category,
                      isbn: newBookForm.isbn || 'N/A',
                      barcode: newBookForm.barcode || `BAR-NEW${books.length + 1}`,
                      location: newBookForm.location || 'Unassigned',
                      price: newBookForm.price || 300
                    };
                    setBooks([...books, newBook]);
                    setIsAddingBook(false);
                    setNewBookForm({
                      title: '',
                      author: '',
                      stock: 5,
                      category: 'Physics',
                      isbn: '',
                      barcode: '',
                      location: '',
                      price: 350
                    });
                    showToast("Book Saved", `"${newBook.title}" successfully indexed into Reference catalog!`);
                  }}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Save to Catalog
                </button>
              </div>
            </div>
          )}

          {/* Books Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {books
              .filter(b => {
                const matchSearch = 
                  b.title.toLowerCase().includes(librarySearchQuery.toLowerCase()) ||
                  b.author.toLowerCase().includes(librarySearchQuery.toLowerCase()) ||
                  b.isbn.toLowerCase().includes(librarySearchQuery.toLowerCase()) ||
                  b.barcode.toLowerCase().includes(librarySearchQuery.toLowerCase());
                const matchCat = libraryCategoryFilter === 'All' || b.category === libraryCategoryFilter;
                const matchStatus = 
                  libraryStatusFilter === 'All' ||
                  (libraryStatusFilter === 'Available' && b.stock > 0) ||
                  (libraryStatusFilter === 'Low Stock' && b.stock > 0 && b.stock <= 3) ||
                  (libraryStatusFilter === 'Out of Stock' && b.stock === 0);
                return matchSearch && matchCat && matchStatus;
              })
              .map(b => (
                <div key={b.id} className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4 hover:shadow-xs transition-all relative overflow-hidden flex flex-col justify-between">
                  <div className="space-y-2 text-left">
                    {/* Tags */}
                    <div className="flex justify-between items-start gap-2">
                      <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        b.category === 'Physics' ? 'bg-cyan-50 text-cyan-600 border border-cyan-150' :
                        b.category === 'Chemistry' ? 'bg-amber-50 text-amber-600 border border-amber-150' :
                        b.category === 'Maths' ? 'bg-indigo-50 text-indigo-600 border border-indigo-150' :
                        'bg-slate-50 text-slate-600 border border-slate-150'
                      }`}>
                        {b.category}
                      </span>

                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                        b.stock === 0 ? 'bg-rose-50 text-rose-600 border border-rose-150' :
                        b.stock <= 3 ? 'bg-amber-50 text-amber-600 border border-amber-150' :
                        'bg-emerald-50 text-emerald-600 border border-emerald-150'
                      }`}>
                        {b.stock === 0 ? 'Out of Stock' : b.stock <= 3 ? `Low Stock (${b.stock})` : `In Stock (${b.stock})`}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-black text-slate-800 line-clamp-1">{b.title}</h4>
                      <p className="text-[11px] text-slate-400 font-bold">by {b.author}</p>
                    </div>

                    {/* Shelf & Location */}
                    <div className="flex items-center gap-4 text-xxs font-bold text-slate-450 pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-indigo-500" />
                        {b.location}
                      </span>
                      <span>Price: ₹{b.price}</span>
                    </div>

                    <div className="text-[10px] text-slate-400 font-mono">
                      ISBN: {b.isbn}
                    </div>
                  </div>

                  {/* Mock Visual Barcode Representation */}
                  <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-xl flex flex-col items-center gap-1 mt-2">
                    <div className="flex gap-0.5 h-7 w-full justify-center">
                      {Array.from({ length: 24 }).map((_, i) => {
                        const val = (b.barcode.charCodeAt(i % b.barcode.length) || 3) % 4;
                        const widths = [1, 2, 3, 1];
                        const w = widths[val];
                        return (
                          <div 
                            key={i} 
                            className="h-full bg-slate-800" 
                            style={{ width: `${w}px` }}
                          />
                        );
                      })}
                    </div>
                    <span className="text-[8px] font-mono font-extrabold text-slate-455 uppercase tracking-widest">{b.barcode}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 mt-3 border-t border-slate-100 justify-end">
                    <button
                      onClick={() => {
                        const updated = books.map(book => book.id === b.id ? { ...book, stock: book.stock + 5 } : book);
                        setBooks(updated);
                        showToast("Stock Replenished", `Added 5 copies to "${b.title}" shelf inventory!`);
                      }}
                      className="px-2 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-[10px] font-black cursor-pointer"
                    >
                      +5 Stock
                    </button>
                    <button
                      onClick={() => {
                        setBooks(books.filter(book => book.id !== b.id));
                        showToast("Book Deindexed", "Textbook removed from library database system!");
                      }}
                      className="px-2 py-1.5 border border-rose-100 hover:bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Issue & Return Center */}
      {libraryActiveSubTab === 'logs' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel: Issue Book Form */}
          <div className="lg:col-span-4 border border-slate-200 rounded-2xl p-5 bg-slate-50/30 space-y-4 text-left h-fit">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
              <span>📝</span> Issue reference rental
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Select Textbook</label>
                <select
                  className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                  value={issueBook.bookId}
                  onChange={(e) => setIssueBook({...issueBook, bookId: e.target.value})}
                >
                  {books.map(b => (
                    <option key={b.id} value={b.id} disabled={b.stock === 0}>
                      {b.title} (Stock: {b.stock}) {b.stock === 0 ? '[OUT OF STOCK]' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Select Student Borrower</label>
                <select
                  className="w-full bg-white border border-slate-250 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                  value={issueBook.studentId}
                  onChange={(e) => setIssueBook({...issueBook, studentId: e.target.value})}
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.email || s.phone || s.id})</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  const bookObj = books.find(b => b.id === issueBook.bookId);
                  const studObj = students.find(s => s.id === issueBook.studentId);
                  
                  if (!bookObj) {
                    showToast("Failed", "Please select a valid textbook", "info");
                    return;
                  }
                  if (bookObj.stock <= 0) {
                    showToast("Out of Stock", `"${bookObj.title}" is currently out of stock.`, "info");
                    return;
                  }

                  // Decrement Stock
                  setBooks(books.map(b => b.id === bookObj.id ? { ...b, stock: b.stock - 1 } : b));

                  // Append Log
                  const newLog = {
                    id: `libl${libraryLogs.length + 1}`,
                    bookId: bookObj.id,
                    bookTitle: bookObj.title,
                    studentId: studObj?.id || 's1',
                    studentName: studObj?.name || 'Walk-in Student',
                    issueDate: '2026-07-09',
                    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days later
                    fine: 0,
                    finePaid: 0,
                    status: 'Issued'
                  };

                  setLibraryLogs([newLog, ...libraryLogs]);
                  showToast("Textbook Issued", `"${bookObj.title}" assigned to ${studObj?.name || 'Student borrower'}! Due on ${newLog.dueDate}`);
                }}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-xs text-white cursor-pointer transition-all flex items-center justify-center gap-1"
              >
                Confirm Issue Check-Out
              </button>
            </div>
          </div>

          {/* Right Panel: Transaction Logs List */}
          <div className="lg:col-span-8 border border-slate-200 rounded-2xl p-5 space-y-4 text-left">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Active Book Borrow Registry</h3>
              <span className="text-[10px] font-bold text-slate-450">{libraryLogs.length} Transactions</span>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {libraryLogs.map((log) => {
                const isOverdue = log.status === 'Issued' && new Date(log.dueDate) < new Date('2026-07-09');
                let diffDays = 0;
                let calcFine = 0;
                if (isOverdue) {
                  const due = new Date(log.dueDate);
                  const today = new Date('2026-07-09');
                  const diffTime = today.getTime() - due.getTime();
                  diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  calcFine = diffDays * 10; // ₹10 per day
                }

                return (
                  <div key={log.id} className="border border-slate-150 rounded-2xl p-4 bg-white hover:bg-slate-50/40 transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-slate-800">{log.bookTitle}</h4>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                          log.status === 'Returned' ? 'bg-emerald-50 text-emerald-600 border border-emerald-150' :
                          isOverdue ? 'bg-rose-50 text-rose-600 border border-rose-150 animate-pulse' :
                          'bg-amber-50 text-amber-600 border border-amber-150'
                        }`}>
                          {log.status === 'Returned' ? 'Returned' : isOverdue ? 'Overdue' : 'Active'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-1 gap-x-4 pt-1">
                        <p className="text-[10px] text-slate-450 font-bold">Borrower: <span className="text-slate-700 font-extrabold">{log.studentName}</span></p>
                        <p className="text-[10px] text-slate-450 font-bold">Issued: <span className="text-slate-700 font-extrabold">{log.issueDate}</span></p>
                        <p className="text-[10px] text-slate-450 font-bold">Due Date: <span className={`${isOverdue ? 'text-rose-500 font-black' : 'text-slate-700 font-extrabold'}`}>{log.dueDate}</span></p>
                      </div>

                      {isOverdue && (
                        <p className="text-[10px] text-rose-600 font-black flex items-center gap-1 mt-1">
                          ⚠️ Overdue by {diffDays} days. Accumulated Fine: ₹{calcFine} (₹10/day)
                        </p>
                      )}
                    </div>

                    <div>
                      {log.status === 'Issued' ? (
                        <button
                          onClick={() => {
                            // Calculate real fine
                            const finalFine = isOverdue ? calcFine : 0;
                            const updatedLogs = libraryLogs.map(l => {
                              if (l.id === log.id) {
                                return { 
                                  ...l, 
                                  status: 'Returned' as const, 
                                  fine: finalFine,
                                  finePaid: 0 // Will pay on checkout
                                };
                              }
                              return l;
                            });
                            setLibraryLogs(updatedLogs);

                            // Return book stock
                            const bk = books.find(b => b.id === log.bookId || b.title === log.bookTitle);
                            if (bk) {
                              setBooks(books.map(b => b.id === bk.id ? { ...b, stock: b.stock + 1 } : b));
                            }

                            if (finalFine > 0) {
                              showToast("Book Returned", `Returned late! ₹${finalFine} fine applied to ledger.`);
                            } else {
                              showToast("Book Restored", `"${log.bookTitle}" returned back into library shelving!`);
                            }
                          }}
                          className="w-full sm:w-auto px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-black cursor-pointer transition-all"
                        >
                          Receive Return
                        </button>
                      ) : (
                        <div className="text-right">
                          <span className="text-[10px] font-extrabold text-slate-400 block">Restored Shelves</span>
                          {log.fine > 0 && (
                            <span className="text-[9px] font-bold text-amber-600 block">
                              Fine: ₹{log.fine} ({log.finePaid >= log.fine ? 'Cleared' : `Unpaid: ₹${log.fine - log.finePaid}`})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Fines Ledger */}
      {libraryActiveSubTab === 'fines' && (
        <div className="space-y-6 text-left">
          <div className="p-4 bg-amber-50/40 border border-amber-200/50 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h4 className="text-xs font-black text-amber-800 uppercase tracking-wider">Late Penalty Fine registry</h4>
              <p className="text-xxs text-slate-500 mt-0.5">Track, collect, and print custom receipts for student late fees computed at ₹10/day overdue rate.</p>
            </div>
            <div className="bg-amber-100/50 px-4 py-2 rounded-xl border border-amber-200 text-right">
              <span className="text-[10px] font-black text-amber-800 block uppercase">Outstanding Fines Balance</span>
              <span className="text-lg font-black text-amber-700">
                ₹{libraryLogs.reduce((acc, log) => acc + (log.fine - log.finePaid), 0)}
              </span>
            </div>
          </div>

          {/* Fines Logs Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
            <table className="w-full text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-450">
                <tr>
                  <th className="p-3 text-left">Student Borrower</th>
                  <th className="p-3 text-left">Book Title</th>
                  <th className="p-3 text-left">Dues Status</th>
                  <th className="p-3 text-right">Fine Owed</th>
                  <th className="p-3 text-right">Fine Paid</th>
                  <th className="p-3 text-right">Remaining Balance</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {libraryLogs.filter(log => log.fine > 0).map(log => {
                  const remaining = log.fine - log.finePaid;
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-black text-slate-800">{log.studentName}</td>
                      <td className="p-3 font-semibold text-slate-700">{log.bookTitle}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                          remaining === 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-150' : 'bg-rose-50 text-rose-600 border border-rose-150'
                        }`}>
                          {remaining === 0 ? 'Fully Paid' : 'Pending payment'}
                        </span>
                      </td>
                      <td className="p-3 text-right font-bold text-slate-700">₹{log.fine}</td>
                      <td className="p-3 text-right font-bold text-emerald-600">₹{log.finePaid}</td>
                      <td className="p-3 text-right font-black text-slate-800">₹{remaining}</td>
                      <td className="p-3 text-center">
                        {remaining > 0 ? (
                          <button
                            onClick={() => {
                              setActivePayingFineLog(log);
                              setFinePaymentForm({
                                amountToPay: remaining,
                                paymentMode: 'UPI',
                                transactionId: `TXN-LIB${Math.floor(100000 + Math.random() * 900000)}`
                              });
                            }}
                            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-black cursor-pointer transition-all"
                          >
                            Collect Fine
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setActivePayingFineLog({ ...log, isReceiptOnly: true });
                            }}
                            className="px-3 py-1 border border-slate-200 text-slate-600 hover:bg-slate-150 rounded-lg text-[10px] font-black cursor-pointer transition-all"
                          >
                            View Receipt
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {libraryLogs.filter(log => log.fine > 0).length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-400 font-semibold">
                      No fines recorded. All accounts in perfect standing!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Fine Collection Receipt/Modal */}
          {activePayingFineLog && (
            <div className="border border-indigo-200 rounded-3xl p-6 bg-slate-50 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-250 pb-3">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🧾</span> {activePayingFineLog.isReceiptOnly ? "Visual Fine Payment Receipt" : "Collect Late Penalty Fine"}
                </h3>
                <button
                  onClick={() => setActivePayingFineLog(null)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {!activePayingFineLog.isReceiptOnly ? (
                // Payment Form
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Book / Student Details</label>
                      <div className="p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700">
                        {activePayingFineLog.bookTitle}
                        <span className="block text-[9px] text-slate-400 font-medium">Borrower: {activePayingFineLog.studentName}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Amount to Collect (₹)</label>
                      <input
                        type="number"
                        value={finePaymentForm.amountToPay}
                        max={activePayingFineLog.fine - activePayingFineLog.finePaid}
                        onChange={(e) => setFinePaymentForm({ ...finePaymentForm, amountToPay: parseInt(e.target.value) || 0 })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:outline-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Payment Mode</label>
                      <select
                        value={finePaymentForm.paymentMode}
                        onChange={(e) => setFinePaymentForm({ ...finePaymentForm, paymentMode: e.target.value as any })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 focus:outline-indigo-500"
                      >
                        <option value="UPI">UPI (GPay / PhonePe)</option>
                        <option value="Cash">Cash Handover</option>
                        <option value="Card">Debit/Credit Card</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Transaction Ref / Note</label>
                    <input
                      type="text"
                      placeholder="e.g. UPI Ref #671239"
                      value={finePaymentForm.transactionId}
                      onChange={(e) => setFinePaymentForm({ ...finePaymentForm, transactionId: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-indigo-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setActivePayingFineLog(null)}
                      className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (finePaymentForm.amountToPay <= 0) {
                          showToast("Invalid Amount", "Please enter a valid fine amount to pay.");
                          return;
                        }
                        const updated = libraryLogs.map(log => {
                          if (log.id === activePayingFineLog.id) {
                            return {
                              ...log,
                              finePaid: log.finePaid + finePaymentForm.amountToPay
                            };
                          }
                          return log;
                        });
                        setLibraryLogs(updated);
                        showToast("Fine Cleared", `Successfully received payment of ₹${finePaymentForm.amountToPay} via ${finePaymentForm.paymentMode}!`);
                        // Keep in state but toggle to receipt mode
                        setActivePayingFineLog({
                          ...activePayingFineLog,
                          finePaid: activePayingFineLog.finePaid + finePaymentForm.amountToPay,
                          isReceiptOnly: true,
                          paymentModeUsed: finePaymentForm.paymentMode,
                          paymentTxnUsed: finePaymentForm.transactionId
                        });
                      }}
                      className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Record Payment
                    </button>
                  </div>
                </div>
              ) : (
                // Receipt Mode Visual Card
                <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md mx-auto space-y-4 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-50 rounded-bl-full -z-0" />
                  
                  <div className="text-center pb-3 border-b border-dashed border-slate-200">
                    <h4 className="text-sm font-black text-indigo-900 tracking-tight">LEARNER'S DEN COACHING CENTER</h4>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">OFFICIAL LIBRARY RECEIPT</p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold">Student:</span>
                      <span className="text-slate-800 font-extrabold">{activePayingFineLog.studentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold">Textbook:</span>
                      <span className="text-slate-800 font-extrabold text-right max-w-[200px] line-clamp-1">{activePayingFineLog.bookTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold">Due Date:</span>
                      <span className="text-slate-800 font-extrabold">{activePayingFineLog.dueDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold">Payment Method:</span>
                      <span className="text-indigo-600 font-black">{activePayingFineLog.paymentModeUsed || 'UPI'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold">Txn Reference:</span>
                      <span className="text-slate-600 font-mono text-[10px] font-bold">{activePayingFineLog.paymentTxnUsed || 'TXN-DIRECT'}</span>
                    </div>

                    <div className="border-t border-slate-100 my-2 pt-2 space-y-1">
                      <div className="flex justify-between text-slate-500">
                        <span>Computed Fine:</span>
                        <span>₹{activePayingFineLog.fine}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Accumulated Paid:</span>
                        <span className="text-emerald-600 font-bold">₹{activePayingFineLog.finePaid}</span>
                      </div>
                      <div className="flex justify-between text-slate-800 font-black text-sm pt-1 border-t border-dashed border-slate-100">
                        <span>Remaining Balance:</span>
                        <span className="text-indigo-600">₹{Math.max(0, activePayingFineLog.fine - activePayingFineLog.finePaid)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        showToast("Simulating Print", "Sending copy to connected printer...");
                      }}
                      className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-[10px] font-black cursor-pointer transition-all text-center"
                    >
                      🖨️ Print Receipt
                    </button>
                    <button
                      onClick={() => setActivePayingFineLog(null)}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-[10px] font-black cursor-pointer transition-all text-center"
                    >
                      Close Receipt
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Sub-Tab 4: Digital Library */}
      {libraryActiveSubTab === 'digital' && (
        <DigitalLibrary 
          currentRole="admin" 
          studentId="admin" 
          batches={[]} 
        />
      )}
    </div>
  );
}
