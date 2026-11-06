
import React from 'react';
import { useAuth } from '../context/AuthContext';

import {
    Home,
    FileText,
    ClipboardCheck,
    History,
    UserCircle,
} from 'lucide-react';

const logo = "/Assets/aduin-favicon.png";

const Navbar = () => {
    const { isAuthenticated, name, username } = useAuth();

    const currentPath = window.location.pathname;

    const isActive = (path) => {
        return currentPath === path ? 'active' : '';
    };

    return (
        <nav className="navbar">

            {/* LOGO */}
            <div className="navbar-logo">
                <div className="logo-icon">
                    <img
                        src={logo}
                        alt="ADUIN"
                        className="logo"
                    />
                </div>

                <div className="logo-text">
                    <h2>ADUIN</h2>
                    <p>ADUAN INFRASTRUKTUR</p>
                </div>
            </div>

            {/* MENU NAVIGASI */}
            <div className="navbar-menu">

                {/* BERANDA */}
                <a
                    href="/"
                    className={`nav-link ${isActive('/')}`}
                >
                    <Home size={16} />
                    <span>Beranda</span>
                </a>

                {/* BUAT PENGADUAN */}
                <a
                    href="/pengaduan"
                    className={`nav-link ${isActive('/pengaduan')}`}
                >
                    <FileText size={16} />
                    <span>Buat Pengaduan</span>
                </a>

                {/* CEK STATUS */}
                <a
                    href="/status"
                    className={`nav-link ${isActive('/status')}`}
                >
                    <ClipboardCheck size={16} />
                    <span>Cek Status</span>
                </a>

                {/* RIWAYAT */}
                <a
                    href="/riwayat"
                    className={`nav-link ${isActive('/riwayat')}`}
                >
                    <History size={16} />
                    <span>Riwayat</span>
                </a>

                {/* JIKA SUDAH LOGIN */}
                {isAuthenticated ? (
                    <a
                        href="/dashboard"
                        className="login-button navbar-user-button"
                    >
                        <UserCircle size={20} />

                        <span>
                            {name || username || 'Pengguna'}
                        </span>
                    </a>
                ) : (

                    /* JIKA BELUM LOGIN */
                    <a
                        href="/login"
                        className="login-button"
                    >
                        <UserCircle size={20} />
                        <span>Masuk / Daftar</span>
                    </a>
                )}

            </div>

        </nav>
    );
};

export default Navbar;
