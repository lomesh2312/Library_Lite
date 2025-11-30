import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    Repeat,
    FileText,
    Settings,
    LogOut,
    Library
} from 'lucide-react';
import clsx from 'clsx';

const Sidebar = () => {
    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Books', path: '/books', icon: BookOpen },
        { name: 'Authors', path: '/authors', icon: Users },
        { name: 'Loans', path: '/loans', icon: Repeat },
        { name: 'Members', path: '/members', icon: Users },
        { name: 'Reports', path: '/reports', icon: FileText },
    ];

    return (
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 h-screen fixed left-0 top-0 flex flex-col z-10 hidden md:flex transition-colors duration-200">
            <div className="h-16 flex items-center px-6 border-b border-gray-100 dark:border-slate-800">
                <Library className="w-8 h-8 text-black dark:text-white mr-3" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">Library Lite</span>
            </div>


            <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            clsx(
                                'flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-black dark:bg-white text-white dark:text-black'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                            )
                        }
                    >
                        <item.icon className="w-5 h-5 mr-3" />
                        {item.name}
                    </NavLink>
                ))}
            </nav>


            <div className="p-4 border-t border-gray-100 dark:border-slate-800">
                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        clsx(
                            'flex items-center w-full px-3 py-2.5 mb-1 rounded-lg text-sm font-medium transition-colors',
                            isActive
                                ? 'bg-black dark:bg-white text-white dark:text-black'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                        )
                    }
                >
                    <Settings className="w-5 h-5 mr-3" />
                    Settings
                </NavLink>
                <button
                    onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.href = '/login';
                    }}
                    className="flex items-center w-full px-3 py-2.5 mt-1 text-sm font-medium text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
