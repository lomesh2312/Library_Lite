import React, { useState, useEffect, useEffectEvent } from 'react';
import axios from 'axios';
import { Users, BookOpen, X, Trash2 } from 'lucide-react';

const Authors = () => {
    const [authors, setAuthors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedAuthor, setSelectedAuthor] = useState(null);

    useEffect(()=>{
        fetchAuthors();
    },[]);

    const fetchAuthors = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:4000/api/authors');
            setAuthors(response.data);
        } catch (error) {
            console.error('Error fetching authors:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAuthorDetails = async (id) => {
        try{
            const response = await axios.get(`http://localhost:4000/api/authors/${id}`);
        setSelectedAuthor(response.data);}catch(error){
            console.error('Error fetching author details:', error);
        }
    }
    const handleDeleteAuthor = async (e, id) => {
        e.stopPropagation(); 
        if (!window.confirm('Are you sure you want to delete this author? This action cannot be undone.')) return;

        try {
            await axios.delete(`http://localhost:4000/api/authors/${id}`);
            setAuthors(authors.filter(author => author.id !== id));
            if (selectedAuthor && selectedAuthor.id === id) {
                setSelectedAuthor(null);
            }
        } catch (error) {
            console.error('Error deleting author:', error);
            alert('Failed to delete author. They may have associated books.');
        }
    };

    return (
        <div className="space-y-6 relative">
            
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Authors</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Meet the minds behind the masterpieces.</p>
            </div>

            
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                        <div key={n} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 animate-pulse">
                            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-full mx-auto mb-4"></div>
                            <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-1/2 mx-auto mb-2"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {authors.map((author) => (
                        <div
                            key={author.id}
                            onClick={() => fetchAuthorDetails(author.id)}
                            className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all cursor-pointer group text-center relative"
                        >
                            <button
                                onClick={(e) => handleDeleteAuthor(e, author.id)}
                                className="absolute top-2 right-2 p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 dark:hover:bg-red-900/40"
                                title="Delete Author"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-slate-50 dark:border-slate-700 group-hover:border-primary-50 dark:group-hover:border-slate-600 transition-colors">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}&background=random&size=128`}
                                    alt={author.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h3 className="font-bold text-slate-800 dark:text-white text-lg">{author.name}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center">
                                <BookOpen className="w-4 h-4 mr-1" />
                                {author._count?.books || 0} Books
                            </p>
                        </div>
                    ))}
                </div>
            )}

           
            {selectedAuthor && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-full overflow-hidden">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedAuthor.name)}&background=random`}
                                        alt={selectedAuthor.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">{selectedAuthor.name}</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Bibliography</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedAuthor(null)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <h3 className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Books by {selectedAuthor.name}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {selectedAuthor.books.map((book) => (
                                    <div key={book.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                        <div className="w-12 h-16 bg-slate-200 dark:bg-slate-700 rounded flex-shrink-0 overflow-hidden">
                                            <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-slate-800 dark:text-white line-clamp-2">{book.title}</h4>
                                            <span className={`text-xs px-2 py-0.5 rounded-full mt-2 inline-block ${book.availableCopies > 0 ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                                                {book.availableCopies > 0 ? 'Available' : 'Out of Stock'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Authors;