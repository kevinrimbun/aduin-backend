
import React from 'react';

import {
    Home,
    FileText,
    ClipboardCheck,
    History,
    Info,
    UserCircle
} from 'lucide-react';

const logo = "/Assets/aduin-favicon.png";

const Navbar = () => {
    
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

                <a
                    href="/"
                    className={`nav-link ${isActive('/')}`}
                >
                    <Home size={16} />
                    <span>Beranda</span>
                </a>

                <a
                    href="/pengaduan"
                    className={`nav-link ${isActive('/pengaduan')}`}
                >
                    <FileText size={16} />
                    <span>Buat Pengaduan</span>
                </a>

                <a
                    href="/status"
                    className={`nav-link ${isActive('/status')}`}
                >
                    <ClipboardCheck size={16} />
                    <span>Cek Status</span>
                </a>

                  <a
                    href="/dashboard_petugas"
                    className={`nav-link ${isActive('/dashboard_petugas')}`}
                >
                    <History size={16} />
                    <span>Dashboard Petugas</span>
                </a>

                <a
                    href="/riwayat"
                    className={`nav-link ${isActive('/riwayat')}`}
                >
                    <History size={16} />
                    <span>Riwayat</span>
                </a>

                <a
                    href="/informasi"
                    className={`nav-link ${isActive('/informasi')}`}
                >
                    <Info size={16} />
                    <span>Informasi</span>
                </a>

                {/* LOGIN */}
                <a
                    href="/login"
                    className="login-button"
                >
                    <UserCircle size={20} />
                    <span>Masuk / Daftar</span>
                </a>

            </div>

        </nav>
    );
};

export default Navbar;
