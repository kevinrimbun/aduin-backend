
import React from "react";
import {
  Home,
  FilePlus2,
  Search,
  ClipboardList,
  UserRound,
  LogOut,
  FileText,
  Clock,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Info,
  Bell,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

import "../../css/DashboardMasyarakat.css";

const laporan = [
  {
    id: "ADU-2025-001",
    kategori: "Jalan Rusak",
    lokasi: "Jl. Melati No. 12",
    status: "Dalam Pengerjaan",
    tanggal: "14 Sep 2025",
  },
  {
    id: "ADU-2025-002",
    kategori: "Drainase Tersumbat",
    lokasi: "Jl. Anggrek No. 5",
    status: "Selesai",
    tanggal: "30 Agu 2025",
  },
  {
    id: "ADU-2025-003",
    kategori: "Lampu Mati",
    lokasi: "Jl. Kenanga No. 7",
    status: "Selesai",
    tanggal: "20 Agu 2025",
  },
];

const informasi = [
  {
    judul: "Perbaikan jalan di Jl. Melati sedang dalam proses",
    tanggal: "15 Sep 2025",
  },
  {
    judul: "Penanganan drainase di Jl. Anggrek telah selesai",
    tanggal: "02 Sep 2025",
  },
  {
    judul: "Layanan pengaduan kini dapat diakses melalui aplikasi mobile",
    tanggal: "28 Agu 2025",
  },
];

function DashboardMasyarakat({ userName }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const menu = [
    { label: "Beranda", icon: Home, href: "/" },
    { label: "Buat Pengaduan", icon: FilePlus2, href: "/pengaduan" },
    { label: "Cek Status", icon: Search, href: "/status" },
    { label: "Riwayat Laporan", icon: ClipboardList, href: "/riwayat" },
    { label: "Profil", icon: UserRound, href: "/profil" },
  ];

  return (
    <div className="aduin-dashboard">

      {/* SIDEBAR */}
      <aside className={`aduin-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>

        <div className="sidebar-brand">
          <div className="brand-icon">
            <FileText size={24} />
          </div>
          <span>ADUIN</span>

          <button
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={22} />
          </button>
        </div>

        <nav className="sidebar-menu">
          {menu.map((item, index) => {
            const Icon = item.icon;

            return (
              <a
                href={item.href}
                key={index}
                className={`sidebar-link ${
                  index === 0 ? "active" : ""
                }`}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        <a href="/logout" className="sidebar-logout">
          <LogOut size={19} />
          <span>Keluar</span>
        </a>

      </aside>

      {/* OVERLAY MOBILE */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* MAIN CONTENT */}
      <main className="aduin-main">

        {/* HEADER */}
        <header className="dashboard-header">

          <button
            className="mobile-menu"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={23} />
          </button>

          <div className="header-greeting">
            <h2>Halo, {userName || "Pengguna"}</h2>
            <p>Berikut ringkasan laporan pengaduan Anda.</p>
          </div>

          <div className="header-profile">
            <div className="profile-avatar">
              <UserRound size={19} />
            </div>

            <span>{userName || "Pengguna"}</span>
            <ChevronDown size={16} />
          </div>

        </header>

        {/* STATISTICS */}
        <section className="dashboard-statistics">

          <div className="stat-card">
            <div className="stat-icon blue">
              <FileText size={21} />
            </div>

            <div className="stat-content">
              <p>Total Laporan</p>
              <h2>3</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">
              <Clock size={21} />
            </div>

            <div className="stat-content">
              <p>Dalam Proses</p>
              <h2>1</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <CheckCircle2 size={21} />
            </div>

            <div className="stat-content">
              <p>Disetujui / Selesai</p>
              <h2>2</h2>
            </div>
          </div>

        </section>

        {/* LAPORAN TERBARU */}
        <section className="dashboard-section">

          <div className="section-heading">
            <h3>Laporan Terbaru</h3>
            <a href="/riwayat">
              Lihat Semua <ArrowRight size={16} />
            </a>
          </div>

          <div className="table-wrapper">
            <table className="report-table">
              <thead>
                <tr>
                  <th>No. Laporan</th>
                  <th>Kategori</th>
                  <th>Lokasi</th>
                  <th>Status</th>
                  <th>Tanggal</th>
                </tr>
              </thead>

              <tbody>
                {laporan.map((item) => (
                  <tr key={item.id}>
                    <td className="report-id">{item.id}</td>
                    <td>{item.kategori}</td>
                    <td>{item.lokasi}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          item.status === "Selesai"
                            ? "status-success"
                            : "status-process"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>{item.tanggal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </section>

        {/* BOTTOM CONTENT */}
        <section className="dashboard-bottom">

          {/* MAP */}
          <div className="dashboard-panel map-panel">

            <div className="panel-heading">
              <h3>Peta Pengaduan Saya</h3>
              <a href="/peta">Lihat Peta</a>
            </div>

            <div className="map-content">

              <div className="map-illustration">

                <div className="map-road road-one" />
                <div className="map-road road-two" />
                <div className="map-road road-three" />
                <div className="map-road road-four" />

                <div className="map-green-area area-one" />
                <div className="map-green-area area-two" />

                <MapPin className="map-marker marker-red" size={31} />
                <MapPin className="map-marker marker-blue" size={31} />
                <MapPin className="map-marker marker-orange" size={31} />
                <MapPin className="map-marker marker-purple" size={31} />
                <MapPin className="map-marker marker-green" size={31} />

                <div className="map-label">Kecamatan Balung</div>

              </div>

              <div className="map-legend">
                <div>
                  <span className="legend-dot red" />
                  Jalan Rusak
                </div>

                <div>
                  <span className="legend-dot blue" />
                  Lampu Mati
                </div>

                <div>
                  <span className="legend-dot orange" />
                  Drainase
                </div>

                <div>
                  <span className="legend-dot purple" />
                  Sampah
                </div>

                <div>
                  <span className="legend-dot green" />
                  Fasilitas Umum
                </div>
              </div>

            </div>

          </div>

          {/* INFORMASI */}
          <div className="dashboard-panel information-panel">

            <div className="panel-heading">
              <h3>Informasi Terbaru</h3>
            </div>

            <div className="information-list">

              {informasi.map((item, index) => (
                <div className="information-item" key={index}>
                  <div className="information-icon">
                    <Info size={16} />
                  </div>

                  <div className="information-text">
                    <p>{item.judul}</p>
                    <span>{item.tanggal}</span>
                  </div>
                </div>
              ))}

            </div>

          </div>

        </section>

        <footer className="dashboard-footer">
          © 2025 ADUIN - Aduan Infrastruktur Kecamatan Balung.
          Semua Hak Dilindungi.
        </footer>

      </main>

    </div>
  );
}

export default DashboardMasyarakat;
