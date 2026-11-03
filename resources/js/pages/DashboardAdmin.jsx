
import React from 'react';
import {
    LayoutDashboard,
    ClipboardList,
    ChartNoAxesColumn,
    MapPinned,
    Users,
    Settings,
    LogOut,
    UserRound,
    Bell,
    Menu,
    CheckCircle2,
    Clock3,
    AlertCircle,
    CalendarDays,
    ArrowRight,
    MapPin,
} from 'lucide-react';

import '../../css/DashboardAdmin.css';

const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard/admin', active: true },
    { label: 'Data Pengaduan', icon: ClipboardList, href: '/admin/pengaduan' },
    { label: 'Laporan & Analisis', icon: ChartNoAxesColumn, href: '/admin/laporan' },
    { label: 'Peta & Wilayah', icon: MapPinned, href: '/admin/peta' },
    { label: 'Pengguna', icon: Users, href: '/admin/pengguna' },
    { label: 'Pengaturan', icon: Settings, href: '/admin/pengaturan' },
];

const statistics = [
    {
        label: 'Total Pengaduan',
        value: '124',
        icon: ClipboardList,
        color: 'blue',
        description: 'Seluruh laporan masuk',
    },
    {
        label: 'Selesai',
        value: '98',
        icon: CheckCircle2,
        color: 'green',
        description: 'Pengaduan terselesaikan',
    },
    {
        label: 'Dalam Proses',
        value: '20',
        icon: Clock3,
        color: 'orange',
        description: 'Sedang ditangani',
    },
    {
        label: 'Belum Diproses',
        value: '6',
        icon: AlertCircle,
        color: 'red',
        description: 'Menunggu penanganan',
    },
];

const categoryData = [
    { name: 'Jalan Rusak', value: 38, color: '#3478e5' },
    { name: 'Drainase', value: 28, color: '#46a4c4' },
    { name: 'Lampu', value: 22, color: '#f1bd43' },
    { name: 'Sampah', value: 22, color: '#48b67c' },
    { name: 'Fasilitas Umum', value: 28, color: '#a64fc0' },
    { name: 'Lainnya', value: 18, color: '#a47bd2' },
];

const regionData = [
    { name: 'Kec. Cibiru', percent: '28%', color: '#3478e5' },
    { name: 'Kec. Ujungberung', percent: '22%', color: '#ed806d' },
    { name: 'Kec. Arcamanik', percent: '18%', color: '#54b59a' },
    { name: 'Kec. Antapani', percent: '15%', color: '#e8a34b' },
    { name: 'Kec. Mandalajati', percent: '10%', color: '#a64fc0' },
    { name: 'Lainnya', percent: '7%', color: '#a47bd2' },
];

function DashboardAdmin({ userName = 'Admin' }) {
    return (
        <div className="admin-dashboard">
            <aside className="admin-sidebar">
                <div className="admin-brand">
                    <div className="admin-brand-logo">A</div>
                    <span>ADUIN</span>
                </div>

                <nav className="admin-navigation">
                    <p className="admin-sidebar-caption">MENU UTAMA</p>

                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <a
                                key={item.label}
                                href={item.href}
                                className={`admin-menu-item ${item.active ? 'active' : ''}`}
                            >
                                <Icon size={19} />
                                <span>{item.label}</span>
                            </a>
                        );
                    })}
                </nav>

                <a href="/logout" className="admin-logout">
                    <LogOut size={19} />
                    <span>Keluar</span>
                </a>
            </aside>

            <main className="admin-main">
                <header className="admin-topbar">
                    <button className="admin-mobile-menu" aria-label="Menu">
                        <Menu size={22} />
                    </button>

                    <div className="admin-topbar-spacer" />

                    <button className="admin-notification" aria-label="Notifikasi">
                        <Bell size={20} />
                        <span className="admin-notification-dot" />
                    </button>

                    <div className="admin-account">
                        <div className="admin-avatar">
                            <UserRound size={19} />
                        </div>
                        <div>
                            <strong>{userName}</strong>
                            <small>Admin / Pimpinan</small>
                        </div>
                    </div>
                </header>

                <div className="admin-content">
                    <section className="admin-heading">
                        <div>
                            <h1>Dashboard Admin / Pimpinan</h1>
                            <p>Ringkasan data pengaduan dan kinerja penanganan.</p>
                        </div>

                        <div className="admin-period">
                            <CalendarDays size={15} />
                            <span>Ringkasan Keseluruhan</span>
                        </div>
                    </section>

                    {/* STATISTIK UTAMA */}
                    <section className="admin-statistics">
                        {statistics.map((item) => {
                            const Icon = item.icon;

                            return (
                                <article className="admin-stat-card" key={item.label}>
                                    <div className={`admin-stat-icon ${item.color}`}>
                                        <Icon size={20} />
                                    </div>

                                    <div className="admin-stat-info">
                                        <span>{item.label}</span>
                                        <strong>{item.value}</strong>
                                        <small>{item.description}</small>
                                    </div>
                                </article>
                            );
                        })}
                    </section>

                    {/* GRAFIK KATEGORI DAN WILAYAH */}
                    <section className="admin-chart-grid">
                        <article className="admin-panel">
                            <div className="admin-panel-heading">
                                <div>
                                    <h2>Pengaduan Berdasarkan Kategori</h2>
                                    <p>Jumlah laporan untuk setiap kategori.</p>
                                </div>
                            </div>

                            <div className="admin-bar-chart">
                                <div className="bar-chart-y-axis">
                                    <span>50</span>
                                    <span>40</span>
                                    <span>30</span>
                                    <span>20</span>
                                    <span>10</span>
                                    <span>0</span>
                                </div>

                                <div className="bar-chart-area">
                                    <div className="bar-chart-grid-lines">
                                        {[0, 1, 2, 3, 4, 5].map((line) => (
                                            <span key={line} />
                                        ))}
                                    </div>

                                    <div className="bar-chart-columns">
                                        {categoryData.map((item) => (
                                            <div className="bar-chart-column" key={item.name}>
                                                <div className="bar-value">{item.value}</div>
                                                <div
                                                    className="bar"
                                                    style={{
                                                        height: `${(item.value / 50) * 100}%`,
                                                        backgroundColor: item.color,
                                                    }}
                                                />
                                                <span className="bar-label">{item.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </article>

                        <article className="admin-panel">
                            <div className="admin-panel-heading">
                                <div>
                                    <h2>Pengaduan Berdasarkan Wilayah</h2>
                                    <p>Persentase laporan berdasarkan wilayah.</p>
                                </div>
                            </div>

                            <div className="admin-region-content">
                                <div
                                    className="admin-region-pie"
                                    role="img"
                                    aria-label="Grafik pie pengaduan berdasarkan wilayah"
                                />

                                <div className="admin-region-legend">
                                    {regionData.map((region) => (
                                        <div className="admin-legend-item" key={region.name}>
                                            <span
                                                className="admin-legend-dot"
                                                style={{ backgroundColor: region.color }}
                                            />
                                            <span>{region.name}</span>
                                            <strong>{region.percent}</strong>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </article>
                    </section>

                    {/* PENYELESAIAN, WAKTU, DAN PETA */}
                    <section className="admin-bottom-grid">
                        <article className="admin-panel admin-completion-panel">
                            <div className="admin-panel-heading">
                                <div>
                                    <h2>Persentase Penyelesaian</h2>
                                    <p>Progres penyelesaian pengaduan.</p>
                                </div>
                            </div>

                            <div className="admin-completion-content">
                                <div className="admin-donut">
                                    <div className="admin-donut-inner">
                                        <strong>79%</strong>
                                    </div>
                                </div>

                                <div className="admin-completion-legend">
                                    <div>
                                        <span className="completion-dot completed" />
                                        <span>Selesai</span>
                                        <strong>98</strong>
                                    </div>
                                    <div>
                                        <span className="completion-dot processing" />
                                        <span>Dalam Proses</span>
                                        <strong>20</strong>
                                    </div>
                                    <div>
                                        <span className="completion-dot pending" />
                                        <span>Belum Diproses</span>
                                        <strong>6</strong>
                                    </div>
                                </div>
                            </div>
                        </article>

                        <article className="admin-panel admin-time-panel">
                            <div className="admin-panel-heading">
                                <div>
                                    <h2>Rata-rata Waktu Penyelesaian</h2>
                                    <p>Durasi rata-rata penanganan laporan.</p>
                                </div>
                            </div>

                            <div className="admin-time-content">
                                <div className="admin-calendar-icon">
                                    <CalendarDays size={39} />
                                </div>

                                <div className="admin-time-value">
                                    <strong>2,8</strong>
                                    <span>Hari</span>
                                </div>

                                <p>Target penyelesaian: 3 hari</p>
                                <span className="admin-time-indicator">
                                    <CheckCircle2 size={13} />
                                    Sesuai target
                                </span>
                            </div>
                        </article>

                        <article className="admin-panel admin-map-panel">
                            <div className="admin-panel-heading">
                                <div>
                                    <h2>Peta Persebaran Pengaduan</h2>
                                    <p>Lokasi pengaduan masyarakat.</p>
                                </div>
                            </div>

                            <div className="admin-complaint-map">
                                <div className="admin-map-road map-road-one" />
                                <div className="admin-map-road map-road-two" />
                                <div className="admin-map-road map-road-three" />
                                <div className="admin-map-road map-road-four" />

                                <div className="admin-map-park map-park-one" />
                                <div className="admin-map-park map-park-two" />

                                <span className="admin-map-marker map-marker-one">
                                    <MapPin size={23} fill="currentColor" />
                                </span>
                                <span className="admin-map-marker map-marker-two">
                                    <MapPin size={23} fill="currentColor" />
                                </span>
                                <span className="admin-map-marker map-marker-three">
                                    <MapPin size={23} fill="currentColor" />
                                </span>
                                <span className="admin-map-marker map-marker-four">
                                    <MapPin size={23} fill="currentColor" />
                                </span>
                                <span className="admin-map-marker map-marker-five">
                                    <MapPin size={23} fill="currentColor" />
                                </span>
                                <span className="admin-map-marker map-marker-six">
                                    <MapPin size={23} fill="currentColor" />
                                </span>
                                <span className="admin-map-marker map-marker-seven">
                                    <MapPin size={23} fill="currentColor" />
                                </span>

                                <a href="/admin/peta" className="admin-map-detail">
                                    Lihat Detail <ArrowRight size={14} />
                                </a>
                            </div>
                        </article>
                    </section>

                    <footer className="admin-footer">
                        <span>© 2026 ADUIN - Aduan Infrastruktur</span>
                        <span>Sistem Informasi Pengaduan Infrastruktur</span>
                    </footer>
                </div>
            </main>
        </div>
    );
}

export default DashboardAdmin;