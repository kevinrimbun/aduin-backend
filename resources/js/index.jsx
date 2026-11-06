
import React from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import Beranda from './pages/Beranda';
import BuatPengaduan from './pages/BuatPengaduan';
import CekStatus from './pages/CekStatus';
import DashboardMasyarakat from './pages/DashboardMasyarakat';
import DashboardPetugas from './pages/DashboardPetugas';
import DashboardAdmin from './pages/DashboardAdmin';
import Riwayat from './pages/Riwayat';
// import PetaPengaduan from './pages/PetaPengaduan';
import Login from './pages/Login';
import Register from './pages/Register';

const pages = {
    beranda: Beranda,
    pengaduan: BuatPengaduan,
    status: CekStatus,
    dashboard_petugas: DashboardPetugas,
    dashboard_masyarakat: DashboardMasyarakat,
    dashboard_admin: DashboardAdmin,
    riwayat: Riwayat,
    // peta: PetaPengaduan,
    login: Login,
    register: Register,
};

const container = document.getElementById('app');

if (container) {
    const pageName = container.dataset.page;
    const Page = pages[pageName];

    // Mengambil informasi user dari Blade Laravel
    const authUser = {
        isAuthenticated: container.dataset.authenticated === 'true',
        name: container.dataset.userName || '',
        username: container.dataset.username || '',
        role: container.dataset.userRole || '',
    };

    if (Page) {
        createRoot(container).render(
            <React.StrictMode>
                <AuthProvider value={authUser}>
                    <Page userName={authUser.name} />
                </AuthProvider>
            </React.StrictMode>
        );
    }
}