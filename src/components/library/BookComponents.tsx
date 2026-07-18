import React from 'react';
import { 
  Search, BookOpen, Download, Trash, Edit, Star, ExternalLink, Calendar, 
  MapPin, Barcode, Heart, Eye, Shield, Pin, RefreshCw, BookMarked, Sparkle, Upload, CheckCircle
} from 'lucide-react';
import { LibraryBook, LibraryResourceType } from '../../types';

// 1. SearchBar Component
interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search by title, author, or publisher...' }: SearchBarProps) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input
        type="text"
        className="w-full pl-10 pr-4 py-2 border border-gray-350 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-800"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

// 2. CategorySelector Component
interface CategorySelectorProps {
  categories: string[];
  selected: string;
  onSelect: (cat: string) => void;
}

export function CategorySelector({ categories, selected, onSelect }: CategorySelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
            selected === cat
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

// Alias CategoryFilter to CategorySelector for backward compatibility
export const CategoryFilter = CategorySelector;

// 3. BookCard Component
interface BookCardProps {
  book: LibraryBook;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onPreview: (book: LibraryBook) => void;
  onDownload: (book: LibraryBook) => void;
  onEdit?: (book: LibraryBook) => void;
  onDelete?: (id: string) => void;
  currentRole?: string;
}

export function BookCard({
  book,
  isFavorite,
  onToggleFavorite,
  onPreview,
  onDownload,
  onEdit,
  onDelete,
  currentRole = 'student'
}: BookCardProps) {
  const isAdmin = currentRole === 'admin' || currentRole === 'librarian' || currentRole === 'principal';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xxs hover:shadow-md hover:border-slate-350 transition-all flex flex-col group relative">
      {/* Pinned Indicator Ribbon */}
      {book.isPinned && (
        <div className="absolute top-3 left-3 z-20 bg-amber-500 text-white text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
          <Pin className="h-2.5 w-2.5 fill-white" />
          <span>PINNED</span>
        </div>
      )}

      {/* Cover & Header Box */}
      <div className="h-44 w-full relative bg-slate-150 overflow-hidden shrink-0 border-b border-slate-100 flex items-center justify-center">
        {book.coverUrl ? (
          <img 
            src={book.coverUrl} 
            alt={book.title}
            className="h-full w-full object-cover group-hover:scale-103 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-20 h-28 bg-white rounded shadow-md flex flex-col justify-between p-2 text-center select-none border border-indigo-100">
            <span className="text-[9px] font-bold text-indigo-700 truncate block">
              {book.subject || 'LMS'}
            </span>
            <BookOpen className="w-8 h-8 text-indigo-500 mx-auto" />
            <span className="text-[7px] text-slate-400 font-semibold truncate block">
              {book.author}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />
        
        {/* Category Type Badge */}
        <span className="absolute bottom-3 left-3 bg-white text-slate-850 text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md shadow-xs border border-slate-100">
          {book.resourceType}
        </span>

        {/* Document file parameters */}
        <span className="absolute bottom-3 right-3 bg-slate-900/80 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md">
          {book.fileType?.toUpperCase() || 'PDF'} | {book.fileSize || '3.5 MB'}
        </span>

        {/* Favorite Toggle Option */}
        <button
          onClick={() => onToggleFavorite(book.id)}
          className="absolute top-3 right-3 z-20 p-1.5 bg-white/95 hover:bg-white rounded-full text-slate-600 hover:text-rose-600 shadow-sm transition-all cursor-pointer"
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>
      </div>

      {/* Body Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2 text-left">
          {/* Tags line */}
          <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wide">
            <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              {book.subject}
            </span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Class {book.classLevel}
            </span>
            <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              {book.course}
            </span>
          </div>

          {/* Book Title */}
          <h4 className="text-xs font-black text-slate-850 tracking-tight leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
            {book.title}
          </h4>

          {/* Scholar/Author line */}
          <p className="text-[10px] text-slate-400 font-bold truncate">
            By {book.author} • {book.publisher}
          </p>

          {/* Description Text */}
          <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">
            {book.description || "Comprehensive syllabus brief and curated sample notes for active review."}
          </p>
        </div>

        {/* Footer Stats & Actions */}
        <div className="space-y-3 pt-2.5 border-t border-slate-100">
          {/* Version history and analytics */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
            <span className="flex items-center gap-1 font-extrabold text-slate-500">
              <Download className="h-3.5 w-3.5 text-indigo-500" />
              <span>{book.downloadCount || 0} downloads</span>
            </span>
            <span>Edition: <b className="font-mono text-slate-700">{book.version || '1.0'}</b></span>
          </div>

          {/* Access information if Admin/Librarian */}
          {isAdmin && (
            <div className="p-2 bg-slate-50 rounded-xl text-[9px] font-bold text-slate-500 flex items-center justify-between border border-slate-100">
              <span className="flex items-center gap-1 text-slate-600">
                <Shield className="h-3 w-3 text-indigo-500" />
                <span>Scope: <b>{book.accessLevel?.toUpperCase()}</b></span>
              </span>
              {book.downloadRestricted && (
                <span className="text-rose-600 font-black tracking-wider text-[8px]">DOWNLOAD BLOCKED</span>
              )}
            </div>
          )}

          {/* Interaction triggers */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onDownload(book)}
              className="flex items-center justify-center gap-1.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-xxs disabled:opacity-50 cursor-pointer"
              disabled={book.downloadRestricted && currentRole === 'student'}
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </button>

            <button
              onClick={() => onPreview(book)}
              className="flex items-center justify-center gap-1.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Preview</span>
            </button>
          </div>

          {/* Admin Specific Action Toolbar */}
          {isAdmin && (
            <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-100">
              {onEdit && (
                <button
                  onClick={() => onEdit(book)}
                  className="flex items-center justify-center gap-1 py-1 px-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-lg text-[10px] font-bold text-slate-600 hover:text-indigo-600 transition-all cursor-pointer"
                >
                  <Edit className="h-3 w-3" />
                  <span>Edit Details</span>
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(book.id)}
                  className="flex items-center justify-center gap-1 py-1 px-2 border border-rose-200 bg-rose-50/50 hover:bg-rose-100 rounded-lg text-[10px] font-bold text-rose-600 transition-all cursor-pointer"
                >
                  <Trash className="h-3 w-3" />
                  <span>Purge Item</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 4. BookGrid Component
interface BookGridProps {
  books: LibraryBook[];
  favoriteIds: string[];
  onToggleFavorite: (id: string) => void;
  onPreview: (book: LibraryBook) => void;
  onDownload: (book: LibraryBook) => void;
  onEdit?: (book: LibraryBook) => void;
  onDelete?: (id: string) => void;
  currentRole?: string;
}

export function BookGrid({
  books,
  favoriteIds,
  onToggleFavorite,
  onPreview,
  onDownload,
  onEdit,
  onDelete,
  currentRole = 'student'
}: BookGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          isFavorite={favoriteIds.includes(book.id)}
          onToggleFavorite={onToggleFavorite}
          onPreview={onPreview}
          onDownload={onDownload}
          onEdit={onEdit}
          onDelete={onDelete}
          currentRole={currentRole}
        />
      ))}
    </div>
  );
}

// 5. BookFilters Component
interface BookFiltersProps {
  subjects: string[];
  selectedSubject: string;
  onSelectSubject: (subject: string) => void;
  classes: string[];
  selectedClass: string;
  onSelectClass: (cls: string) => void;
  courses: string[];
  selectedCourse: string;
  onSelectCourse: (course: string) => void;
  resourceTypes: string[];
  selectedResourceType: string;
  onSelectResourceType: (type: string) => void;
  sortBy: 'latest' | 'downloads' | 'alpha';
  onSortChange: (sort: 'latest' | 'downloads' | 'alpha') => void;
}

export function BookFilters({
  subjects,
  selectedSubject,
  onSelectSubject,
  classes,
  selectedClass,
  onSelectClass,
  courses,
  selectedCourse,
  onSelectCourse,
  resourceTypes,
  selectedResourceType,
  onSelectResourceType,
  sortBy,
  onSortChange
}: BookFiltersProps) {
  return (
    <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Subject Filter */}
        <div className="w-full sm:w-44 text-left">
          <label className="block text-[9px] font-black text-slate-450 uppercase mb-1">Filter Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => onSelectSubject(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs text-slate-700 font-extrabold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Curriculum</option>
            {subjects.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>

        {/* Class Level Filter */}
        <div className="w-full sm:w-44 text-left">
          <label className="block text-[9px] font-black text-slate-450 uppercase mb-1">Target Standard</label>
          <select
            value={selectedClass}
            onChange={(e) => onSelectClass(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs text-slate-700 font-extrabold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Standards</option>
            {classes.map(cls => (
              <option key={cls} value={cls}>Class {cls}</option>
            ))}
          </select>
        </div>

        {/* Target Course Category */}
        <div className="w-full sm:w-44 text-left">
          <label className="block text-[9px] font-black text-slate-450 uppercase mb-1">Course Stream</label>
          <select
            value={selectedCourse}
            onChange={(e) => onSelectCourse(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs text-slate-700 font-extrabold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Streams</option>
            {courses.map(crs => (
              <option key={crs} value={crs}>{crs} Track</option>
            ))}
          </select>
        </div>

        {/* Resource Format Type */}
        <div className="w-full sm:w-44 text-left">
          <label className="block text-[9px] font-black text-slate-450 uppercase mb-1">Resource Type</label>
          <select
            value={selectedResourceType}
            onChange={(e) => onSelectResourceType(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs text-slate-700 font-extrabold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Media Formats</option>
            {resourceTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Sorting option */}
        <div className="w-full sm:w-44 ml-auto text-left">
          <label className="block text-[9px] font-black text-indigo-400 uppercase mb-1">Sort Catalog</label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as any)}
            className="w-full px-3 py-2 border border-indigo-100 bg-indigo-50/50 rounded-xl text-xs text-indigo-700 font-black focus:outline-none cursor-pointer"
          >
            <option value="latest">Sort: Latest Upload</option>
            <option value="downloads">Sort: Most Downloaded</option>
            <option value="alpha">Sort: Alphabetical</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// 6. EmptyState Component
interface EmptyStateProps {
  title?: string;
  description?: string;
  onClearFilters?: () => void;
}

export function EmptyState({
  title = "No Materials Found in Active Catalog",
  description = "No textbooks match your search query, active filters, or batch enrollment restrictions.",
  onClearFilters
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-2xl text-center p-6 shadow-xxs">
      <div className="bg-slate-100 p-4 rounded-full text-slate-450 mb-4 animate-bounce">
        <BookMarked className="h-8 w-8 text-indigo-500" />
      </div>
      <h4 className="text-sm font-extrabold text-slate-800">{title}</h4>
      <p className="text-xs text-slate-400 max-w-sm mt-1 leading-normal">
        {description}
      </p>
      {onClearFilters && (
        <button
          onClick={onClearFilters}
          className="mt-4 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}

// 7. LoadingState Component
interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Syncing digital library catalog with database..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-200 rounded-2xl gap-3">
      <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
      <span className="text-xs font-extrabold text-slate-500">{message}</span>
    </div>
  );
}

// 8. BookDetails Component (Modal Document Workspace)
interface BookDetailsProps {
  book: LibraryBook;
  onClose: () => void;
  onDownload: (book: LibraryBook) => void;
  currentRole?: string;
}

export function BookDetails({ book, onClose, onDownload, currentRole = 'student' }: BookDetailsProps) {
  const [zoom, setZoom] = React.useState(100);

  return (
    <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-3xl w-full max-w-4xl h-[85vh] border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header toolbar */}
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-indigo-400" />
            <div className="text-left">
              <span className="text-[9px] font-extrabold uppercase text-indigo-300 tracking-widest">Document Workspace</span>
              <h4 className="text-xs font-extrabold truncate max-w-md mt-0.5">{book.title}</h4>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setZoom(z => Math.max(50, z - 25))}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-750 rounded text-[10px] font-bold"
            >
              A-
            </button>
            <span className="text-[10px] font-mono text-slate-400">{zoom}%</span>
            <button 
              onClick={() => setZoom(z => Math.min(200, z + 25))}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-750 rounded text-[10px] font-bold"
            >
              A+
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 rounded-full font-bold ml-2 text-slate-300 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Document Viewer Area */}
        <div className="flex-1 bg-slate-100 overflow-auto p-8 flex justify-center">
          <div 
            className="bg-white shadow-xl rounded-xl border border-slate-200 p-8 text-left transition-all max-w-2xl w-full flex flex-col justify-between h-fit"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          >
            {/* Simulated book contents */}
            <div className="space-y-6">
              <div className="border-b border-indigo-100 pb-4 text-center">
                <span className="text-xxs font-black tracking-widest text-indigo-600 uppercase">Certified Institutional Curriculum Resource</span>
                <h3 className="text-lg font-black text-slate-850 mt-1">{book.title}</h3>
                <p className="text-[10px] font-bold text-slate-400 mt-1">Edited by: {book.author} • Publisher: {book.publisher}</p>
              </div>

              <div className="space-y-3.5 text-xs text-slate-700 leading-relaxed font-sans">
                <p className="font-extrabold text-indigo-900 text-xs flex items-center gap-1.5">
                  <Sparkle className="h-4 w-4 animate-spin text-amber-500" />
                  <span>Chapter Overview & Core Directives</span>
                </p>
                <p>
                  This comprehensive study guide covers intermediate and advance topics tailored to class <b>{book.classLevel}</b> level for <b>{book.course}</b>. Review definitions, fundamental laws, core derivations, and solved mock questions included in this guide carefully.
                </p>
                <p className="font-extrabold text-slate-800 mt-4">Section I: Key Learning Objectives</p>
                <ul className="list-disc list-inside space-y-1.5 text-[11px] pl-1 text-slate-600 font-semibold">
                  <li>Interactive exploration and proof of fundamental curriculum laws.</li>
                  <li>Standardized practice formulas with high yield probability statistics.</li>
                  <li>Detailed analytical solutions to questions from national test patterns.</li>
                </ul>

                {book.fileUrl?.startsWith('blob:') ? (
                  <div className="mt-8 bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-[11px] text-emerald-800">
                    <p className="font-extrabold">✓ Dynamic Object Resource Loaded Successfully</p>
                    <p className="mt-1">This is a local study document. Your browser can review and preview the original PDF bytes instantly from memory by clicking the full window preview button below.</p>
                  </div>
                ) : (
                  <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-xxs font-extrabold text-slate-400 uppercase tracking-widest block">Reference URL Source</span>
                    <a href={book.fileUrl} target="_blank" rel="noreferrer" className="text-[11px] text-indigo-600 font-bold hover:underline break-all block mt-1">
                      {book.fileUrl}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xxs text-slate-400 font-bold mt-12">
              <span>Syllabus Desk Page 1 of 12</span>
              <span>Copyright © {new Date().getFullYear()} Learner's Den ERP</span>
            </div>
          </div>
        </div>

        {/* Bottom toolbar */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-between items-center shrink-0">
          <span className="text-xxs text-slate-500 font-bold">Previews are simulated dynamically.</span>
          <div className="flex gap-2">
            {book.fileUrl?.startsWith('blob:') && (
              <button
                onClick={() => window.open(book.fileUrl, '_blank')}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xxs font-black transition-all cursor-pointer"
              >
                Open Native Browser PDF Preview
              </button>
            )}
            <button
              onClick={() => onDownload(book)}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xxs font-black transition-all cursor-pointer"
              disabled={book.downloadRestricted && currentRole === 'student'}
            >
              Get Offline Document File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 9. BookTable Component (Admin ListView/Inventory view)
interface BookTableProps {
  books: any[];
  onEdit: (book: any) => void;
  onDelete: (id: string) => void;
  onIssue?: (book: any) => void;
}

export function BookTable({ books, onEdit, onDelete, onIssue }: BookTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider font-semibold">
          <tr>
            <th className="px-6 py-3 text-left">Book Title</th>
            <th className="px-6 py-3 text-left">Author</th>
            <th className="px-6 py-3 text-left">Category / Subject</th>
            <th className="px-6 py-3 text-left">Storage Location</th>
            <th className="px-6 py-3 text-center">In Stock</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 text-gray-700">
          {books.map((b) => (
            <tr key={b.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <div className="font-semibold text-gray-900">{b.title}</div>
                <div className="text-xs text-gray-400 font-mono mt-0.5">{b.isbn || 'ISBN Not Recorded'}</div>
              </td>
              <td className="px-6 py-4 text-gray-600">{b.author}</td>
              <td className="px-6 py-4">
                <span className="px-2.5 py-1 text-xs rounded-full bg-violet-50 text-violet-700 font-medium border border-violet-100">
                  {b.category || b.subject}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {b.location || 'Shelf default'}
                </span>
              </td>
              <td className="px-6 py-4 text-center font-bold">
                <span className={`${(b.stock || 0) < 3 ? 'text-red-500' : 'text-gray-700'}`}>
                  {b.stock ?? 5}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-1.5">
                  {onIssue && (
                    <button
                      onClick={() => onIssue(b)}
                      className="px-2.5 py-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-all"
                    >
                      Issue
                    </button>
                  )}
                  <button
                    onClick={() => onEdit(b)}
                    className="p-1 text-gray-400 hover:text-violet-600 hover:bg-gray-100 rounded animate-none"
                    title="Edit Details"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(b.id)}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded animate-none"
                    title="Delete Book"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {books.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-medium">
                No matching library inventory records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// 10. Pagination Control Component
interface PaginationProps {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
}

export function Pagination({ current, total, pageSize, onChange }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6 rounded-lg mt-4">
      <div className="flex justify-between flex-1 sm:hidden">
        <button
          disabled={current === 1}
          onClick={() => onChange(current - 1)}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          disabled={current === totalPages}
          onClick={() => onChange(current + 1)}
          className="relative inline-flex items-center px-4 py-2 ml-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-700">
            Showing <span className="font-medium">{(current - 1) * pageSize + 1}</span> to{' '}
            <span className="font-medium">{Math.min(current * pageSize, total)}</span> of{' '}
            <span className="font-medium">{total}</span> publications
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => onChange(idx + 1)}
                aria-current={current === idx + 1 ? 'page' : undefined}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  current === idx + 1
                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
