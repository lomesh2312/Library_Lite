import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Book as BookIcon, Trash2 } from 'lucide-react';

const Books = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');


    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        authorName: '',
        isbn: '',
        price: '',
        totalCopies: 5,
        coverUrl: '',
        description: ''
    });


    const [showDetailModal, setShowDetailModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [editFormData, setEditFormData] = useState({
        price: '',
        totalCopies: '',
        coverUrl: ''
    });

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async (search = '') => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:4000/api/books?search=${search}`);
            setBooks(response.data);
        } catch (error) {
            console.error('Error fetching books:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        if (e.key === 'Enter') {
            fetchBooks(term);
        }
    };

    const handleAddBook = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:4000/api/books', formData);
            setShowAddModal(false);
            fetchBooks();
            setFormData({
                title: '',
                authorName: '',
                isbn: '',
                price: '',
                totalCopies: 5,
                coverUrl: '',
                description: ''
            });
        } catch (error) {
            console.error('Error adding book:', error);
            alert('Failed to add book');
        }
    };

    const handleDeleteBook = async (id) => {
        if (!window.confirm('Are you sure you want to delete this book? This action cannot be undone.')) return;
        try {
            await axios.delete(`http://localhost:4000/api/books/${id}`);
            fetchBooks();
        } catch (error) {
            console.error('Error deleting book:', error);
            alert(error.response?.data?.error || 'Failed to delete book');
        }
    };

    const openDetailModal = async (book) => {
        setSelectedBook(book);
        setIsEditing(false); 
        setShowDetailModal(true);


        try {
            const response = await axios.get(`http://localhost:4000/api/books/${book.id}`);
            setSelectedBook(response.data);
            setEditFormData({
                price: response.data.price || '',
                totalCopies: response.data.totalCopies || '',
                coverUrl: response.data.coverUrl || ''
            });
        } catch (error) {
            console.error('Error fetching book details:', error);
        }
    };

    const handleUpdateBook = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = {
                price: editFormData.price,
                totalCopies: editFormData.totalCopies,
                coverUrl: editFormData.coverUrl
            };

            await axios.put(`http://localhost:4000/api/books/${selectedBook.id}`, dataToSend);
            setIsEditing(false);

            fetchBooks();

            const response = await axios.get(`http://localhost:4000/api/books/${selectedBook.id}`);
            setSelectedBook(response.data);
        } catch (error) {
            console.error('Error updating book:', error);
            alert('Failed to update book');
        }
    };

    const calculateFine = (loan) => {
        if (loan.returned) return 0; 

        const loanDate = new Date(loan.loanedAt);
        const currentDate = new Date();
        const diffTime = Math.abs(currentDate - loanDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 7) {
            return (diffDays - 7) * 10;
        }
        return 0;
    };

    return (
        <div className="space-y-6">

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Books Library</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and browse the entire collection.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium flex items-center"
                >
                    <BookIcon className="w-4 h-4 mr-2" />
                    Add New Book
                </button>
            </div>


            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row gap-4 transition-colors duration-200">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by title, author, or ISBN..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                </div>
                <button
                    onClick={() => fetchBooks(searchTerm)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium"
                >
                    Search
                </button>
            </div>


            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                        <div key={n} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 animate-pulse">
                            <div className="h-48 bg-slate-100 dark:bg-slate-700 rounded-lg mb-4"></div>
                            <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {books.map((book) => (
                        <div key={book.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all duration-200 group flex flex-col">
                            <div className="relative aspect-[2/3] mb-4 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-700">
                                <img
                                    src={book.coverUrl || 'https://placehold.co/400x600?text=No+Cover'}
                                    alt={book.title}
                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-slate-800 shadow-sm">
                                    {book.availableCopies} / {book.totalCopies}
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteBook(book.id); }}
                                    className="absolute top-2 left-2 bg-red-500/90 hover:bg-red-600 text-white p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Delete Book"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                            <h3 className="font-bold text-slate-800 dark:text-white line-clamp-1" title={book.title}>{book.title}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{book.author?.name || 'Unknown Author'}</p>
                            <div className="mt-auto pt-3 flex items-center justify-between">
                                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                    ₹{book.price || 'N/A'}
                                </span>
                                <button
                                    onClick={() => openDetailModal(book)}
                                    className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}


            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Add New Book</h2>
                        <form onSubmit={handleAddBook} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Book Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Author Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    value={formData.authorName}
                                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                                    placeholder="e.g. J.K. Rowling"
                                />
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">If author doesn't exist, they will be created automatically.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ISBN</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        value={formData.isbn}
                                        onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Price (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Total Copies</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        value={formData.totalCopies}
                                        onChange={(e) => setFormData({ ...formData, totalCopies: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cover Image URL</label>
                                    <input
                                        type="url"
                                        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        value={formData.coverUrl}
                                        onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                                <textarea
                                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                    Add Book
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            {showDetailModal && selectedBook && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full p-6 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                                {isEditing ? 'Edit Book Details' : 'Book Details'}
                            </h2>
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
                                >
                                    Edit
                                </button>
                            )}
                        </div>

                        {isEditing ? (
                            <form onSubmit={handleUpdateBook} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Price (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        value={editFormData.price}
                                        onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Total Copies</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        value={editFormData.totalCopies}
                                        onChange={(e) => setEditFormData({ ...editFormData, totalCopies: e.target.value })}
                                    />
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Note: Reducing copies below currently loaned amount may cause issues.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cover Image URL (Optional)</label>
                                    <input
                                        type="url"
                                        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        value={editFormData.coverUrl}
                                        onChange={(e) => setEditFormData({ ...editFormData, coverUrl: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="w-full md:w-1/3">
                                        <div className="aspect-[2/3] bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden">
                                            <img
                                                src={selectedBook.coverUrl || 'https://placehold.co/400x600?text=No+Cover'}
                                                alt={selectedBook.title}
                                                className="object-cover w-full h-full"
                                            />
                                        </div>
                                    </div>
                                    <div className="w-full md:w-2/3 space-y-4">
                                        <div>
                                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{selectedBook.title}</h3>
                                            <p className="text-lg text-slate-500 dark:text-slate-400">{selectedBook.author?.name}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
                                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Price</p>
                                                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">₹{selectedBook.price}</p>
                                            </div>
                                            <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
                                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Availability</p>
                                                <p className="text-lg font-bold text-slate-800 dark:text-white">
                                                    {selectedBook.availableCopies} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">/ {selectedBook.totalCopies}</span>
                                                </p>
                                            </div>
                                            <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg col-span-2">
                                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">ISBN</p>
                                                <p className="text-base font-medium text-slate-800 dark:text-white">{selectedBook.isbn}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                                {selectedBook.description || 'No description available.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>


                                <div className="border-t border-slate-100 dark:border-slate-700 pt-6">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Loan History</h3>
                                    {selectedBook.loans && selectedBook.loans.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                                                <thead className="bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white font-semibold">
                                                    <tr>
                                                        <th className="px-4 py-2">Member</th>
                                                        <th className="px-4 py-2">Issued</th>
                                                        <th className="px-4 py-2">Due (7 Days)</th>
                                                        <th className="px-4 py-2">Returned</th>
                                                        <th className="px-4 py-2">Fine</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                                    {selectedBook.loans.map((loan) => {
                                                        const fine = calculateFine(loan);

                                                        const issueDate = new Date(loan.loanedAt);
                                                        const strictDueDate = new Date(issueDate);
                                                        strictDueDate.setDate(strictDueDate.getDate() + 7);

                                                        return (
                                                            <tr key={loan.id}>
                                                                <td className="px-4 py-2 font-medium text-slate-900 dark:text-white">{loan.user?.name || 'Unknown'}</td>
                                                                <td className="px-4 py-2">{new Date(loan.loanedAt).toLocaleDateString()}</td>
                                                                <td className="px-4 py-2">{strictDueDate.toLocaleDateString()}</td>
                                                                <td className="px-4 py-2">
                                                                    {loan.returned ? (
                                                                        <span className="text-emerald-600 dark:text-emerald-400">{new Date(loan.returnedAt).toLocaleDateString()}</span>
                                                                    ) : (
                                                                        <span className="text-amber-600 dark:text-amber-400">Pending</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-2">
                                                                    {fine > 0 ? (
                                                                        <span className="text-red-600 dark:text-red-400 font-bold">₹{fine}</span>
                                                                    ) : (
                                                                        <span className="text-slate-400">-</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-slate-500 dark:text-slate-400 text-sm italic">No history available for this book.</p>
                                    )}
                                </div>

                                <div className="flex justify-end mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowDetailModal(false)}
                                        className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Books;