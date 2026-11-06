import React, { useEffect, useMemo, useState } from "react";
import {
    FileText,
    CheckCircle2,
    AlertCircle,
    ClipboardList,
    Search,
    Filter,
    RefreshCw,
    MapPin,
    CalendarDays,
    Eye,
    X,
    Image as ImageIcon,
    LogOut,
    Check,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    Wrench,
    Hourglass,
    AlertTriangle,
} from "lucide-react";

import "../../css/DashboardAdmin.css";

const API_URL = "/api/pengaduan";

const STATUS = [
    "Pengaduan Baru",
    "Verifikasi",
    "Ditugaskan",
    "Dalam Pengerjaan",
    "Ajukan Penyelesaian",
    "Selesai",
];

const formatTanggal = (tanggal) => {
    if (!tanggal) return "-";

    return new Date(tanggal).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const normalisasiFoto = (fotos) => {
    if (!fotos) return [];

    if (Array.isArray(fotos)) return fotos;

    if (typeof fotos === "string") {
        try {
            const parsed = JSON.parse(fotos);
            return Array.isArray(parsed) ? parsed : [parsed];
        } catch {
            return [fotos];
        }
    }

    return [];
};

const fotoUrl = (foto) => {
    if (!foto) return "";

    if (typeof foto === "object") {
        foto = foto.url || foto.path || foto.foto || "";
    }

    if (!foto) return "";

    if (foto.startsWith("http://") || foto.startsWith("https://")) {
        return foto;
    }

    if (foto.startsWith("/")) return foto;

    return `/storage/${foto}`;
};

const formatLaporan = (item) => ({
    id: item.id,
    nomor: item.nomor_laporan || "-",
    judul: item.judul || "-",
    kategori: item.kategori || "-",
    kecamatan: item.kecamatan || "-",
    kelurahan: item.kelurahan || "-",
    alamat: item.alamat || "-",
    lokasi: [item.alamat, item.kelurahan, item.kecamatan]
        .filter(Boolean)
        .join(", "),
    deskripsi: item.deskripsi || "-",
    prioritas: item.prioritas || "Rendah",
    status: item.status || "Pengaduan Baru",
    tanggal: item.created_at,
    latitude: item.latitude != null ? Number(item.latitude) : null,
    longitude: item.longitude != null ? Number(item.longitude) : null,
    fotos: normalisasiFoto(item.fotos),
    user: item.user || null,
    petugas: item.petugas || null,
    riwayat: item.riwayat || [],
    totalSkor: item.total_skor ?? 0,
});

function DashboardAdmin({ userName }) {
    const [laporan, setLaporan] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("Semua");
    const [filterPrioritas, setFilterPrioritas] = useState("Semua");
    const [activeTab, setActiveTab] = useState("Semua");

    const [selectedLaporan, setSelectedLaporan] = useState(null);

    // Modal konfirmasi penyelesaian
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingLaporan, setPendingLaporan] = useState(null);
    const [confirmingId, setConfirmingId] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 10;

    // =====================================================
    // AMBIL DATA PENGADUAN
    // =====================================================

    const fetchLaporan = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${API_URL}?per_page=1000`, {
                method: "GET",
                credentials: "same-origin",
                headers: {
                    Accept: "application/json",
                },
            });

            if (response.status === 401) {
                throw new Error("Sesi login berakhir. Silakan login kembali.");
            }

            if (response.status === 403) {
                throw new Error("Akun ini tidak memiliki akses administrator.");
            }

            if (!response.ok) {
                throw new Error("Gagal mengambil data pengaduan.");
            }

            const result = await response.json();

            // Mendukung response array dan Laravel paginator.
            const records = Array.isArray(result.data)
                ? result.data
                : Array.isArray(result.data?.data)
                  ? result.data.data
                  : Array.isArray(result)
                    ? result
                    : [];

            setLaporan(records.map(formatLaporan));
        } catch (err) {
            console.error("Fetch pengaduan:", err);
            setError(err.message || "Terjadi kesalahan saat mengambil data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLaporan();
    }, []);

    // =====================================================
    // STATISTIK
    // =====================================================

    const statistik = useMemo(() => {
        return {
            total: laporan.length,

            baru: laporan.filter((item) => item.status === "Pengaduan Baru")
                .length,

            proses: laporan.filter((item) =>
                ["Verifikasi", "Ditugaskan", "Dalam Pengerjaan"].includes(
                    item.status,
                ),
            ).length,

            konfirmasi: laporan.filter(
                (item) => item.status === "Ajukan Penyelesaian",
            ).length,

            selesai: laporan.filter((item) => item.status === "Selesai").length,
        };
    }, [laporan]);

    // Hanya laporan yang menunggu persetujuan admin.
    const laporanKonfirmasi = useMemo(() => {
        return laporan.filter((item) => item.status === "Ajukan Penyelesaian");
    }, [laporan]);

    // =====================================================
    // FILTER DATA
    // =====================================================

    const filteredLaporan = useMemo(() => {
        return laporan.filter((item) => {
            const keyword = search.toLowerCase();

            const cocokSearch = [
                item.nomor,
                item.judul,
                item.kategori,
                item.lokasi,
                item.status,
            ].some((value) =>
                String(value || "")
                    .toLowerCase()
                    .includes(keyword),
            );

            const cocokStatus =
                filterStatus === "Semua" || item.status === filterStatus;

            const cocokPrioritas =
                filterPrioritas === "Semua" ||
                item.prioritas === filterPrioritas;

            const cocokTab =
                activeTab === "Semua" ||
                (activeTab === "Belum Dikerjakan" &&
                    item.status === "Pengaduan Baru") ||
                (activeTab === "Dalam Proses" &&
                    ["Verifikasi", "Ditugaskan", "Dalam Pengerjaan"].includes(
                        item.status,
                    )) ||
                (activeTab === "Ajukan Penyelesaian" &&
                    item.status === "Ajukan Penyelesaian") ||
                (activeTab === "Selesai" && item.status === "Selesai");

            return cocokSearch && cocokStatus && cocokPrioritas && cocokTab;
        });
    }, [laporan, search, filterStatus, filterPrioritas, activeTab]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, filterStatus, filterPrioritas, activeTab]);

    const totalPages = Math.max(1, Math.ceil(filteredLaporan.length / perPage));

    const paginatedLaporan = filteredLaporan.slice(
        (currentPage - 1) * perPage,
        currentPage * perPage,
    );

    // =====================================================
    // BUKA MODAL KONFIRMASI
    // =====================================================

    const bukaKonfirmasi = (item) => {
        setPendingLaporan(item);
        setShowConfirmModal(true);
        setError("");
        setSuccess("");
    };

    const tutupKonfirmasi = () => {
        if (confirmingId !== null) return;

        setShowConfirmModal(false);
        setPendingLaporan(null);
    };

    // =====================================================
    // KONFIRMASI PENYELESAIAN
    // =====================================================

    const konfirmasiPenyelesaian = async () => {
        if (!pendingLaporan || confirmingId !== null) return;

        const item = pendingLaporan;

        setConfirmingId(item.id);
        setError("");
        setSuccess("");

        try {
            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content");

            const response = await fetch(
                `${API_URL}/${item.id}/konfirmasi-penyelesaian`,
                {
                    method: "POST",
                    credentials: "same-origin",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        ...(csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {}),
                    },
                    body: JSON.stringify({
                        catatan: "Penyelesaian disetujui oleh administrator.",
                    }),
                },
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Gagal mengonfirmasi penyelesaian.",
                );
            }

            setShowConfirmModal(false);
            setPendingLaporan(null);
            setSelectedLaporan(null);

            setSuccess(
                `Laporan ${item.nomor} berhasil disetujui dan dinyatakan selesai.`,
            );

            await fetchLaporan();
        } catch (err) {
            console.error("Konfirmasi penyelesaian:", err);
            setError(err.message || "Terjadi kesalahan.");
        } finally {
            setConfirmingId(null);
        }
    };

    // =====================================================
    // LOGOUT
    // =====================================================

    const handleLogout = async () => {
        try {
            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content");

            const response = await fetch("/logout", {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    "X-CSRF-TOKEN": csrfToken || "",
                    Accept: "application/json",
                },
            });

            if (response.ok) {
                window.location.href = "/login";
            } else {
                alert("Logout gagal. Silakan coba kembali.");
            }
        } catch (err) {
            console.error("Logout:", err);
            alert("Terjadi kesalahan saat logout.");
        }
    };

    // =====================================================
    // BADGE STATUS
    // =====================================================

    const classStatus = (status) => {
        switch (status) {
            case "Pengaduan Baru":
                return "baru";
            case "Verifikasi":
                return "verifikasi";
            case "Ditugaskan":
                return "ditugaskan";
            case "Dalam Pengerjaan":
                return "proses";
            case "Ajukan Penyelesaian":
                return "konfirmasi";
            case "Selesai":
                return "selesai";
            default:
                return "";
        }
    };

    const classPrioritas = (prioritas) => {
        return String(prioritas || "Rendah").toLowerCase();
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="admin-layout">
            <main className="admin-main">
                {/* HEADER */}
                <header className="admin-topbar">
                    <div className="admin-topbar-left">
                        <div>
                            <span className="admin-breadcrumb">
                                ADUIN / Dashboard
                            </span>
                            <h1>Dashboard Administrator</h1>
                        </div>
                    </div>

                    <div className="admin-header-actions">
                        <button
                            className="admin-refresh-button"
                            onClick={fetchLaporan}
                            disabled={loading}
                        >
                            <RefreshCw
                                size={15}
                                className={loading ? "spinning" : ""}
                            />
                            <span>Refresh Data</span>
                        </button>

                        <button
                            className="admin-logout-button"
                            onClick={handleLogout}
                            title="Keluar"
                        >
                            <LogOut size={17} />
                        </button>
                    </div>
                </header>

                {/* WELCOME */}
                <section className="admin-welcome">
                    <div>
                        <span className="admin-welcome-label">
                            ADMINISTRATOR
                        </span>

                        <h2>Selamat Datang, {userName || "Administrator"}!</h2>

                        <p>
                            Pantau pengaduan masyarakat dan proses penanganan
                            infrastruktur Kecamatan Balung melalui dashboard
                            administrator ADUIN.
                        </p>
                    </div>

                    <div className="admin-welcome-icon">
                        <ShieldCheck size={42} />
                    </div>
                </section>

                {/* ERROR */}
                {error && (
                    <div className="admin-alert error">
                        <AlertCircle size={17} />
                        <span>{error}</span>
                        <button onClick={() => setError("")}>
                            <X size={15} />
                        </button>
                    </div>
                )}

                {/* SUCCESS */}
                {success && (
                    <div className="admin-alert success">
                        <CheckCircle2 size={17} />
                        <span>{success}</span>
                        <button onClick={() => setSuccess("")}>
                            <X size={15} />
                        </button>
                    </div>
                )}

                {/* STATISTICS */}
                <section className="admin-stat-grid">
                    <div className="admin-stat-card">
                        <div className="admin-stat-top">
                            <span>Total Pengaduan</span>
                            <div className="admin-stat-icon blue">
                                <FileText size={19} />
                            </div>
                        </div>
                        <h3>{statistik.total}</h3>
                        <p>Seluruh laporan masyarakat</p>
                    </div>

                    <div className="admin-stat-card">
                        <div className="admin-stat-top">
                            <span>Belum Dikerjakan</span>
                            <div className="admin-stat-icon orange">
                                <AlertCircle size={19} />
                            </div>
                        </div>
                        <h3>{statistik.baru}</h3>
                        <p>Pengaduan baru masuk</p>
                    </div>

                    <div className="admin-stat-card">
                        <div className="admin-stat-top">
                            <span>Dalam Proses</span>
                            <div className="admin-stat-icon purple">
                                <Wrench size={19} />
                            </div>
                        </div>
                        <h3>{statistik.proses}</h3>
                        <p>Verifikasi hingga pengerjaan</p>
                    </div>

                    <div className="admin-stat-card">
                        <div className="admin-stat-top">
                            <span>Menunggu Konfirmasi</span>
                            <div className="admin-stat-icon yellow">
                                <Hourglass size={19} />
                            </div>
                        </div>
                        <h3>{statistik.konfirmasi}</h3>
                        <p>Menunggu persetujuan admin</p>
                    </div>

                    <div className="admin-stat-card">
                        <div className="admin-stat-top">
                            <span>Selesai</span>
                            <div className="admin-stat-icon green">
                                <CheckCircle2 size={19} />
                            </div>
                        </div>
                        <h3>{statistik.selesai}</h3>
                        <p>Pengaduan telah disetujui selesai</p>
                    </div>
                </section>

                {/* PENGAJUAN PENYELESAIAN */}
                <section className="admin-section">
                    <div className="admin-section-heading">
                        <div>
                            <h2>Pengajuan Penyelesaian dari Petugas</h2>
                            <p>
                                Periksa hasil pekerjaan petugas sebelum
                                menyetujui penyelesaian pengaduan.
                            </p>
                        </div>

                        <span className="admin-total-label">
                            {laporanKonfirmasi.length} Pengajuan
                        </span>
                    </div>

                    {loading ? (
                        <div className="admin-empty">
                            <RefreshCw className="spinning" size={22} />
                            <p>Memuat pengajuan penyelesaian...</p>
                        </div>
                    ) : laporanKonfirmasi.length === 0 ? (
                        <div className="admin-empty-confirmation">
                            <CheckCircle2 size={27} />
                            <div>
                                <strong>
                                    Tidak ada pengajuan penyelesaian
                                </strong>
                                <p>
                                    Pengajuan dari petugas akan muncul di bagian
                                    ini.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="admin-confirmation-list">
                            {laporanKonfirmasi.map((item) => (
                                <div
                                    className="admin-confirmation-item"
                                    key={item.id}
                                >
                                    <div className="admin-confirmation-icon">
                                        <ClipboardList size={21} />
                                    </div>

                                    <div className="admin-confirmation-info">
                                        <strong>{item.judul}</strong>
                                        <span>
                                            {item.nomor} · {item.kategori}
                                        </span>
                                        <small>{item.lokasi}</small>
                                    </div>

                                    <button
                                        className="admin-detail-button"
                                        onClick={() => setSelectedLaporan(item)}
                                    >
                                        <Eye size={14} />
                                        Periksa
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* SELURUH PENGADUAN */}
                <section className="admin-section admin-table-section">
                    <div className="admin-section-heading">
                        <div>
                            <h2>Seluruh Data Pengaduan</h2>
                            <p>
                                Pantau semua pengaduan, baik yang belum
                                dikerjakan maupun yang sudah selesai.
                            </p>
                        </div>

                        <span className="admin-total-label">
                            {filteredLaporan.length} Laporan
                        </span>
                    </div>

                    {/* TABS */}
                    <div className="admin-tabs">
                        {[
                            "Semua",
                            "Belum Dikerjakan",
                            "Dalam Proses",
                            "Ajukan Penyelesaian",
                            "Selesai",
                        ].map((tab) => (
                            <button
                                key={tab}
                                className={activeTab === tab ? "active" : ""}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* FILTER */}
                    <div className="admin-filter-bar">
                        <div className="admin-search">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder="Cari nomor laporan, judul, kategori, lokasi..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="admin-filter-select">
                            <Filter size={15} />
                            <select
                                value={filterStatus}
                                onChange={(e) =>
                                    setFilterStatus(e.target.value)
                                }
                            >
                                <option value="Semua">Semua Status</option>
                                {STATUS.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <select
                            className="admin-priority-select"
                            value={filterPrioritas}
                            onChange={(e) => setFilterPrioritas(e.target.value)}
                        >
                            <option value="Semua">Semua Prioritas</option>
                            <option value="Tinggi">Prioritas Tinggi</option>
                            <option value="Sedang">Prioritas Sedang</option>
                            <option value="Rendah">Prioritas Rendah</option>
                        </select>
                    </div>

                    {/* TABLE */}
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>NO.</th>
                                    <th>INFORMASI PENGADUAN</th>
                                    <th>LOKASI</th>
                                    <th>PRIORITAS</th>
                                    <th>STATUS</th>
                                    <th>TANGGAL</th>
                                    <th>AKSI</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="admin-table-message"
                                        >
                                            <RefreshCw
                                                size={18}
                                                className="spinning"
                                            />
                                            Memuat data pengaduan...
                                        </td>
                                    </tr>
                                ) : paginatedLaporan.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="admin-table-message"
                                        >
                                            <AlertTriangle size={18} />
                                            Tidak ada data pengaduan ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedLaporan.map((item, index) => (
                                        <tr key={item.id}>
                                            <td>
                                                {(currentPage - 1) * perPage +
                                                    index +
                                                    1}
                                            </td>

                                            <td>
                                                <div className="admin-complaint-cell">
                                                    <strong>
                                                        {item.judul}
                                                    </strong>
                                                    <span>{item.nomor}</span>
                                                    <small>
                                                        {item.kategori}
                                                    </small>
                                                </div>
                                            </td>

                                            <td>
                                                <div className="admin-location-cell">
                                                    <MapPin size={13} />
                                                    <span>{item.lokasi}</span>
                                                </div>
                                            </td>

                                            <td>
                                                <span
                                                    className={`admin-priority ${classPrioritas(item.prioritas)}`}
                                                >
                                                    {item.prioritas}
                                                </span>
                                            </td>

                                            <td>
                                                <span
                                                    className={`admin-status ${classStatus(item.status)}`}
                                                >
                                                    {item.status}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="admin-date-cell">
                                                    <CalendarDays size={13} />
                                                    {formatTanggal(
                                                        item.tanggal,
                                                    )}
                                                </div>
                                            </td>

                                            <td>
                                                <button
                                                    className="admin-icon-button"
                                                    title="Lihat detail"
                                                    onClick={() =>
                                                        setSelectedLaporan(item)
                                                    }
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION */}
                    <div className="admin-pagination">
                        <span>
                            Menampilkan{" "}
                            {filteredLaporan.length === 0
                                ? 0
                                : (currentPage - 1) * perPage + 1}
                            {" - "}
                            {Math.min(
                                currentPage * perPage,
                                filteredLaporan.length,
                            )}{" "}
                            dari {filteredLaporan.length} laporan
                        </span>

                        <div>
                            <button
                                disabled={currentPage <= 1}
                                onClick={() =>
                                    setCurrentPage((page) => page - 1)
                                }
                            >
                                <ChevronLeft size={16} />
                            </button>

                            <span>
                                {currentPage} / {totalPages}
                            </span>

                            <button
                                disabled={currentPage >= totalPages}
                                onClick={() =>
                                    setCurrentPage((page) => page + 1)
                                }
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </section>

                <footer className="admin-footer">
                    © 2026 ADUIN - Aduan Infrastruktur Kecamatan Balung. Semua
                    Hak Dilindungi.
                </footer>
            </main>

            {/* ================================================= */}
            {/* MODAL DETAIL PENGADUAN */}
            {/* ================================================= */}

            {selectedLaporan && (
                <div
                    className="admin-modal-overlay"
                    onClick={() => setSelectedLaporan(null)}
                >
                    <div
                        className="admin-detail-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="admin-modal-header">
                            <div>
                                <span>DETAIL PENGADUAN</span>
                                <h2>{selectedLaporan.nomor}</h2>
                            </div>

                            <button onClick={() => setSelectedLaporan(null)}>
                                <X size={19} />
                            </button>
                        </div>

                        <div className="admin-modal-body">
                            <div className="admin-detail-title">
                                <div>
                                    <h3>{selectedLaporan.judul}</h3>
                                    <p>{selectedLaporan.kategori}</p>
                                </div>

                                <span
                                    className={`admin-status ${classStatus(selectedLaporan.status)}`}
                                >
                                    {selectedLaporan.status}
                                </span>
                            </div>

                            <div className="admin-detail-grid">
                                <div>
                                    <span>Nomor Laporan</span>
                                    <strong>{selectedLaporan.nomor}</strong>
                                </div>

                                <div>
                                    <span>Prioritas</span>
                                    <strong>{selectedLaporan.prioritas}</strong>
                                </div>

                                <div>
                                    <span>Tanggal Pengaduan</span>
                                    <strong>
                                        {formatTanggal(selectedLaporan.tanggal)}
                                    </strong>
                                </div>

                                <div>
                                    <span>Pelapor</span>
                                    <strong>
                                        {selectedLaporan.user?.name || "-"}
                                    </strong>
                                </div>

                                <div className="full">
                                    <span>Lokasi</span>
                                    <strong>{selectedLaporan.lokasi}</strong>
                                </div>

                                <div>
                                    <span>Koordinat Latitude</span>
                                    <strong>
                                        {selectedLaporan.latitude ?? "-"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Koordinat Longitude</span>
                                    <strong>
                                        {selectedLaporan.longitude ?? "-"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Petugas</span>
                                    <strong>
                                        {selectedLaporan.petugas?.name || "-"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Total Skor</span>
                                    <strong>{selectedLaporan.totalSkor}</strong>
                                </div>
                            </div>

                            <div className="admin-detail-description">
                                <span>Deskripsi Pengaduan</span>
                                <p>{selectedLaporan.deskripsi}</p>
                            </div>

                            <div className="admin-detail-photos">
                                <span>
                                    <ImageIcon size={15} />
                                    Foto Pengaduan
                                </span>

                                {selectedLaporan.fotos.length > 0 ? (
                                    <div className="admin-photo-grid">
                                        {selectedLaporan.fotos.map(
                                            (foto, index) => {
                                                const url = fotoUrl(foto);

                                                return url ? (
                                                    <a
                                                        href={url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        key={index}
                                                    >
                                                        <img
                                                            src={url}
                                                            alt={`Foto pengaduan ${index + 1}`}
                                                        />
                                                    </a>
                                                ) : null;
                                            },
                                        )}
                                    </div>
                                ) : (
                                    <p className="admin-no-photo">
                                        Belum ada foto pengaduan.
                                    </p>
                                )}
                            </div>

                            {selectedLaporan.status ===
                                "Ajukan Penyelesaian" && (
                                <div className="admin-pending-note">
                                    <Hourglass size={19} />
                                    <div>
                                        <strong>
                                            Menunggu persetujuan administrator
                                        </strong>
                                        <p>
                                            Petugas telah mengajukan
                                            penyelesaian. Periksa hasil
                                            pekerjaan dan bukti foto sebelum
                                            menyetujui laporan.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="admin-modal-footer">
                            <button
                                className="admin-modal-close"
                                onClick={() => setSelectedLaporan(null)}
                            >
                                Tutup
                            </button>

                            {selectedLaporan.status ===
                                "Ajukan Penyelesaian" && (
                                <button
                                    className="admin-modal-review"
                                    onClick={() =>
                                        bukaKonfirmasi(selectedLaporan)
                                    }
                                    disabled={confirmingId !== null}
                                >
                                    <Check size={15} />
                                    Setujui Penyelesaian
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ================================================= */}
            {/* MODAL KONFIRMASI PENYELESAIAN */}
            {/* ================================================= */}

            {showConfirmModal && pendingLaporan && (
                <div
                    className="admin-modal-overlay admin-confirm-overlay"
                    onClick={tutupKonfirmasi}
                >
                    <div
                        className="admin-confirm-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="admin-confirm-close"
                            disabled={confirmingId !== null}
                            onClick={tutupKonfirmasi}
                        >
                            <X size={19} />
                        </button>

                        <div className="admin-confirm-icon">
                            <ShieldCheck size={34} />
                        </div>

                        <div className="admin-confirm-content">
                            <h2>Setujui Penyelesaian?</h2>
                            <p>
                                Pastikan pekerjaan petugas sudah sesuai sebelum
                                menyetujui laporan ini.
                            </p>
                        </div>

                        <div className="admin-confirm-info">
                            <span>Nomor Laporan</span>
                            <strong>{pendingLaporan.nomor}</strong>

                            <span>Judul Pengaduan</span>
                            <strong>{pendingLaporan.judul}</strong>

                            <span>Status Saat Ini</span>
                            <strong className="admin-confirm-status">
                                {pendingLaporan.status}
                            </strong>
                        </div>

                        <div className="admin-confirm-warning">
                            <AlertTriangle size={17} />
                            <span>
                                Setelah disetujui, status laporan akan berubah
                                menjadi Selesai.
                            </span>
                        </div>

                        <div className="admin-confirm-actions">
                            <button
                                className="admin-confirm-cancel"
                                disabled={confirmingId !== null}
                                onClick={tutupKonfirmasi}
                            >
                                Batal
                            </button>

                            <button
                                className="admin-confirm-submit"
                                disabled={confirmingId !== null}
                                onClick={konfirmasiPenyelesaian}
                            >
                                {confirmingId !== null ? (
                                    <>
                                        <RefreshCw
                                            size={16}
                                            className="spinning"
                                        />
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        <Check size={16} />
                                        Ya, Setujui
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DashboardAdmin;
