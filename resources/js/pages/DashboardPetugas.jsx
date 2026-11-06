
import { useState, useMemo, useEffect } from "react";
import {
    ClipboardList,
    ClipboardCheck,
    Clock3,
    CheckCircle2,
    MapPin,
    X,
    Search,
    Filter,
    Eye,
    Pencil,
    Save,
    ArrowUpRight,
    History,
    RefreshCw,
    AlertCircle,
    LogOut,
} from "lucide-react";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import "../../css/DashboardPetugas.css";

// =====================================================
// KONFIGURASI
// =====================================================

const API_URL = "/api/pengaduan";

const statusOptions = [
    "Pengaduan Baru",
    "Dalam Pengerjaan",
    "Ajukan Penyelesaian",
];

const warnaKategori = {
    "Jalan Rusak": "#2f80ed",
    Drainase: "#ffba36",
    "Lampu Mati": "#ff8552",
    Sampah: "#42b883",
    "Fasilitas Umum": "#f2d04e",
    Lainnya: "#a17bd3",
};

// =====================================================
// MARKER PETA
// =====================================================

const markerIcon = new L.DivIcon({
    className: "petugas-map-pin",
    html: "<span></span>",
    iconSize: [22, 30],
    iconAnchor: [11, 30],
});

// =====================================================
// HELPER
// =====================================================

const kelasLabel = (value) =>
    String(value || "")
        .toLowerCase()
        .replaceAll(" ", "-");

const formatLaporan = (item) => ({
    id: item.id,
    nomor: item.nomor_laporan || "-",
    kategori: item.kategori || "Lainnya",
    lokasi: [item.alamat, item.kelurahan, item.kecamatan]
        .filter(Boolean)
        .join(", "),
    prioritas: item.prioritas || "Rendah",
    status: item.status || "Pengaduan Baru",
    lat: item.latitude != null ? Number(item.latitude) : null,
    lng: item.longitude != null ? Number(item.longitude) : null,
    deskripsi: item.deskripsi || "-",
    riwayat: item.riwayat || [],
});

// =====================================================
// KOMPONEN BADGE
// =====================================================

function Badge({ value, type = "status" }) {
    return (
        <span className={`petugas-badge ${type}-${kelasLabel(value)}`}>
            <span className="petugas-badge-dot" />
            {value}
        </span>
    );
}

// =====================================================
// KOMPONEN UTAMA
// =====================================================

export default function DashboardPetugas() {
    const [laporan, setLaporan] = useState([]);

    const [pencarian, setPencarian] = useState("");
    const [filterStatus, setFilterStatus] = useState("Semua");

    const [modal, setModal] = useState(null);
    const [laporanDipilih, setLaporanDipilih] = useState(null);

    const [statusBaru, setStatusBaru] = useState("");
    const [catatan, setCatatan] = useState("");

    const [notifikasi, setNotifikasi] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    // =====================================================
    // AMBIL DATA PENGADUAN
    // =====================================================

    const fetchLaporan = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(`${API_URL}?per_page=100`, {
                method: "GET",
                credentials: "same-origin",
                headers: {
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error(
                        "Sesi login berakhir. Silakan login kembali.",
                    );
                }

                if (response.status === 403) {
                    throw new Error(
                        "Akun kamu tidak memiliki akses sebagai petugas.",
                    );
                }

                throw new Error("Gagal mengambil data pengaduan.");
            }

            const result = await response.json();

            console.log("RESPONS API:", result);

            // Mendukung array biasa maupun Laravel pagination.
            const data = Array.isArray(result.data?.data)
                ? result.data.data
                : Array.isArray(result.data)
                  ? result.data
                  : Array.isArray(result)
                    ? result
                    : [];

            setLaporan(data.map(formatLaporan));
        } catch (err) {
            console.error("Gagal mengambil laporan:", err);
            setError(err.message || "Terjadi kesalahan.");
        } finally {
            setLoading(false);
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
    // LOAD DATA PERTAMA KALI
    // =====================================================

    useEffect(() => {
        fetchLaporan();
    }, []);

    // =====================================================
    // STATISTIK
    // =====================================================

    const statistik = useMemo(
        () => [
            {
                label: "Pengaduan Baru",
                jumlah: laporan.filter(
                    (x) => x.status === "Pengaduan Baru",
                ).length,
                icon: ClipboardList,
                tipe: "biru",
            },
            {
                label: "Dalam Pengerjaan",
                jumlah: laporan.filter(
                    (x) => x.status === "Dalam Pengerjaan",
                ).length,
                icon: Clock3,
                tipe: "oranye",
            },
            {
                label: "Ajukan Penyelesaian",
                jumlah: laporan.filter(
                    (x) => x.status === "Ajukan Penyelesaian",
                ).length,
                icon: CheckCircle2,
                tipe: "hijau",
            },
        ],
        [laporan],
    );

    // =====================================================
    // FILTER DAN PENCARIAN
    // =====================================================

    const laporanFilter = useMemo(() => {
        return laporan
            .filter((item) => {
                const cocokCari = [
                    item.nomor,
                    item.kategori,
                    item.lokasi,
                ].some((teks) =>
                    String(teks || "")
                        .toLowerCase()
                        .includes(pencarian.toLowerCase()),
                );

                const cocokStatus =
                    filterStatus === "Semua" ||
                    item.status === filterStatus;

                return cocokCari && cocokStatus;
            })
            .sort((a, b) => {
                const urutan = {
                    Tinggi: 0,
                    Sedang: 1,
                    Rendah: 2,
                };

                return (
                    (urutan[a.prioritas] ?? 3) -
                    (urutan[b.prioritas] ?? 3)
                );
            });
    }, [laporan, pencarian, filterStatus]);

    // =====================================================
    // GRAFIK KATEGORI
    // =====================================================

    const kategoriData = useMemo(() => {
        const hasil = {};

        laporan.forEach((item) => {
            const kategori = item.kategori || "Lainnya";
            hasil[kategori] = (hasil[kategori] || 0) + 1;
        });

        return Object.entries(hasil).map(([name, value]) => ({
            name,
            value,
            color: warnaKategori[name] || warnaKategori.Lainnya,
        }));
    }, [laporan]);

    const totalLaporan = laporan.length;

    // =====================================================
    // MODAL DETAIL
    // =====================================================

    const bukaDetail = (item) => {
        setLaporanDipilih(item);
        setModal("detail");
    };

    // =====================================================
    // MODAL EDIT
    // =====================================================

    const bukaEdit = (item) => {
        setLaporanDipilih(item);
        setStatusBaru(item.status);
        setCatatan("");
        setModal("edit");
    };

    const tutupModal = () => {
        if (saving) return;

        setModal(null);
        setLaporanDipilih(null);
    };

    // Mengambil data terbaru dari state laporan.
    const laporanAktif = laporanDipilih
        ? laporan.find((x) => x.id === laporanDipilih.id) ||
          laporanDipilih
        : null;

    // =====================================================
    // SIMPAN PERUBAHAN STATUS
    // =====================================================

    const simpanStatus = async (e) => {
        e.preventDefault();

        if (!laporanAktif || !statusBaru || saving) return;

        if (statusBaru === laporanAktif.status) {
            setNotifikasi("Tidak ada perubahan status.");
            setModal(null);
            setLaporanDipilih(null);
            return;
        }

        try {
            setSaving(true);
            setError("");

            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content");

            const response = await fetch(
                `${API_URL}/${laporanAktif.id}/status`,
                {
                    method: "PATCH",
                    credentials: "same-origin",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        ...(csrfToken
                            ? { "X-CSRF-TOKEN": csrfToken }
                            : {}),
                    },
                    body: JSON.stringify({
                        status: statusBaru,
                        catatan: catatan,
                    }),
                },
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Gagal memperbarui status.",
                );
            }

            const nomorLaporan = laporanAktif.nomor;

            await fetchLaporan();

            setNotifikasi(
                `Status laporan ${nomorLaporan} berhasil diperbarui.`,
            );

            setModal(null);
            setLaporanDipilih(null);
        } catch (err) {
            console.error("Gagal memperbarui status:", err);
            setNotifikasi(err.message || "Terjadi kesalahan.");
        } finally {
            setSaving(false);
        }
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="petugas-layout">
            <main className="petugas-page">
                <div className="petugas-container">

                    {/* HEADER DASHBOARD */}

                    <header className="petugas-heading">
                        <div className="petugas-heading-left">
                            <div className="petugas-heading-icon">
                                <ClipboardCheck size={27} />
                            </div>

                            <div>
                                <h1>Dashboard Petugas</h1>
                                <p>
                                    Kelola dan tindak lanjuti pengaduan
                                    masyarakat.
                                </p>
                            </div>
                        </div>

                        {/* TOMBOL REFRESH DAN LOGOUT */}

                        <div className="petugas-header-actions">
                            <button
                                type="button"
                                className="petugas-refresh-button"
                                onClick={fetchLaporan}
                                disabled={loading}
                            >
                                <RefreshCw
                                    size={16}
                                    className={
                                        loading ? "petugas-spin" : ""
                                    }
                                />
                                <span>Refresh Data</span>
                            </button>

                            <button
                                type="button"
                                className="petugas-logout-button"
                                onClick={handleLogout}
                                title="Keluar"
                                aria-label="Logout"
                            >
                                <LogOut size={17} />
                            </button>
                        </div>
                    </header>

                    {/* ERROR */}

                    {error && (
                        <div className="petugas-error">
                            <AlertCircle size={17} />
                            <span>{error}</span>

                            <button
                                type="button"
                                onClick={() => setError("")}
                            >
                                <X size={15} />
                            </button>
                        </div>
                    )}

                    {/* STATISTIK */}

                    <section className="petugas-stats">
                        {statistik.map(
                            ({ label, jumlah, icon: Icon, tipe }) => (
                                <article
                                    className="petugas-stat-card"
                                    key={label}
                                >
                                    <div className="petugas-stat-top">
                                        <div
                                            className={`petugas-stat-icon ${tipe}`}
                                        >
                                            <Icon size={22} />
                                        </div>

                                        <ArrowUpRight
                                            size={17}
                                            className="petugas-stat-arrow"
                                        />
                                    </div>

                                    <strong className="petugas-stat-number">
                                        {jumlah}
                                    </strong>

                                    <span className="petugas-stat-label">
                                        {label}
                                    </span>

                                    <div
                                        className={`petugas-stat-line ${tipe}`}
                                    />
                                </article>
                            ),
                        )}
                    </section>

                    {/* DAFTAR PRIORITAS */}

                    <section className="petugas-priority-section">
                        <div className="petugas-section-header">
                            <div>
                                <h2>Daftar Prioritas Pengaduan</h2>
                                <p>
                                    Daftar laporan berdasarkan tingkat
                                    prioritas penanganan.
                                </p>
                            </div>

                            <span className="petugas-total-label">
                                {laporanFilter.length} Laporan
                            </span>
                        </div>

                        {/* PENCARIAN DAN FILTER */}

                        <div className="petugas-toolbar">
                            <div className="petugas-search">
                                <Search size={18} />

                                <input
                                    type="text"
                                    placeholder="Cari nomor laporan, kategori, atau lokasi..."
                                    value={pencarian}
                                    onChange={(e) =>
                                        setPencarian(e.target.value)
                                    }
                                />
                            </div>

                            <div className="petugas-filter">
                                <Filter size={17} />

                                <select
                                    value={filterStatus}
                                    onChange={(e) =>
                                        setFilterStatus(e.target.value)
                                    }
                                >
                                    <option value="Semua">
                                        Semua Status
                                    </option>

                                    {statusOptions.map((status) => (
                                        <option
                                            key={status}
                                            value={status}
                                        >
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* TABEL PENGADUAN */}

                        <div className="petugas-table-scroll">
                            <table className="petugas-table">
                                <thead>
                                    <tr>
                                        <th>No. Laporan</th>
                                        <th>Kategori</th>
                                        <th>Lokasi</th>
                                        <th>Prioritas</th>
                                        <th>Status</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td
                                                colSpan="6"
                                                className="petugas-empty"
                                            >
                                                Memuat data pengaduan...
                                            </td>
                                        </tr>
                                    ) : error ? (
                                        <tr>
                                            <td
                                                colSpan="6"
                                                className="petugas-empty"
                                            >
                                                {error}
                                                <br />

                                                <button
                                                    type="button"
                                                    onClick={fetchLaporan}
                                                >
                                                    Coba Lagi
                                                </button>
                                            </td>
                                        </tr>
                                    ) : laporanFilter.length > 0 ? (
                                        laporanFilter.map((item) => (
                                            <tr key={item.id}>
                                                <td>
                                                    <strong>
                                                        {item.nomor}
                                                    </strong>
                                                </td>

                                                <td>{item.kategori}</td>

                                                <td>
                                                    {item.lokasi || "-"}
                                                </td>

                                                <td>
                                                    <Badge
                                                        value={item.prioritas}
                                                        type="prioritas"
                                                    />
                                                </td>

                                                <td>
                                                    <Badge
                                                        value={item.status}
                                                    />
                                                </td>

                                                <td>
                                                    <div className="petugas-action-group">
                                                        <button
                                                            type="button"
                                                            className="petugas-action-btn"
                                                            title="Lihat Detail"
                                                            onClick={() =>
                                                                bukaDetail(item)
                                                            }
                                                        >
                                                            <Eye size={17} />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="petugas-action-btn"
                                                            title="Edit Status"
                                                            onClick={() =>
                                                                bukaEdit(item)
                                                            }
                                                        >
                                                            <Pencil size={17} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="6"
                                                className="petugas-empty"
                                            >
                                                Tidak ada pengaduan yang sesuai.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* GRAFIK DAN PETA */}

                    <section className="petugas-bottom-grid">

                        {/* GRAFIK */}

                        <article className="petugas-panel">
                            <div className="petugas-panel-header">
                                <div>
                                    <h2>Grafik Kategori Pengaduan</h2>
                                    <p>
                                        Distribusi berdasarkan jenis laporan
                                    </p>
                                </div>
                            </div>

                            <div className="petugas-chart-body">
                                <div className="petugas-chart-wrap">
                                    <ResponsiveContainer
                                        width="100%"
                                        height={220}
                                    >
                                        <PieChart>
                                            <Pie
                                                data={kategoriData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={85}
                                                paddingAngle={0}
                                                stroke="#ffffff"
                                                strokeWidth={1}
                                            >
                                                {kategoriData.map((item) => (
                                                    <Cell
                                                        key={item.name}
                                                        fill={item.color}
                                                    />
                                                ))}
                                            </Pie>

                                            <Tooltip
                                                formatter={(value, name) => [
                                                    `${value} laporan`,
                                                    name,
                                                ]}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* LEGENDA */}

                                <div className="petugas-legend">
                                    {kategoriData.map((item) => (
                                        <div key={item.name}>
                                            <i
                                                style={{
                                                    backgroundColor:
                                                        item.color,
                                                }}
                                            />

                                            <span>{item.name}</span>

                                            <strong>
                                                {totalLaporan
                                                    ? Math.round(
                                                          (item.value /
                                                              totalLaporan) *
                                                              100,
                                                      )
                                                    : 0}
                                                %
                                            </strong>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </article>

                        {/* PETA */}

                        <article className="petugas-panel petugas-map-panel">
                            <div className="petugas-panel-header">
                                <div>
                                    <h2>Peta Pengaduan</h2>
                                    <p>
                                        Persebaran lokasi laporan masyarakat
                                    </p>
                                </div>

                                <span className="petugas-map-count">
                                    <MapPin size={14} />

                                    {
                                        laporan.filter(
                                            (item) =>
                                                Number.isFinite(item.lat) &&
                                                Number.isFinite(item.lng),
                                        ).length
                                    }{" "}
                                    Lokasi
                                </span>
                            </div>

                            <div className="petugas-map-wrap">
                                <MapContainer
                                    center={[-8.28, 113.54]}
                                    zoom={13}
                                    scrollWheelZoom={false}
                                    className="petugas-map"
                                >
                                    <TileLayer
                                        attribution="&copy; OpenStreetMap contributors"
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />

                                    {laporan
                                        .filter(
                                            (item) =>
                                                Number.isFinite(item.lat) &&
                                                Number.isFinite(item.lng),
                                        )
                                        .map((item) => (
                                            <Marker
                                                key={item.id}
                                                position={[
                                                    item.lat,
                                                    item.lng,
                                                ]}
                                                icon={markerIcon}
                                            >
                                                <Popup>
                                                    <strong>
                                                        {item.kategori}
                                                    </strong>

                                                    <p>{item.lokasi}</p>

                                                    <span>
                                                        {item.status}
                                                    </span>
                                                </Popup>
                                            </Marker>
                                        ))}
                                </MapContainer>
                            </div>
                        </article>
                    </section>
                </div>
            </main>

            {/* ================================================= */}
            {/* NOTIFIKASI */}
            {/* ================================================= */}

            {notifikasi && (
                <div className="petugas-toast" role="status">
                    <CheckCircle2 size={19} />

                    <span>{notifikasi}</span>

                    <button
                        type="button"
                        onClick={() => setNotifikasi("")}
                        aria-label="Tutup notifikasi"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* ================================================= */}
            {/* MODAL DETAIL PENGADUAN */}
            {/* ================================================= */}

            {modal === "detail" && laporanAktif && (
                <div
                    className="petugas-modal-overlay"
                    onClick={tutupModal}
                >
                    <div
                        className="petugas-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Detail pengaduan"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="petugas-modal-header">
                            <div>
                                <small>INFORMASI LAPORAN</small>
                                <h2>Detail Pengaduan</h2>
                            </div>

                            <button
                                type="button"
                                className="petugas-modal-close"
                                onClick={tutupModal}
                                aria-label="Tutup"
                            >
                                <X size={21} />
                            </button>
                        </div>

                        <div className="petugas-modal-content">
                            <div className="petugas-detail-row">
                                <span>No. Laporan</span>
                                <strong>{laporanAktif.nomor}</strong>
                            </div>

                            <div className="petugas-detail-row">
                                <span>Kategori</span>
                                <strong>{laporanAktif.kategori}</strong>
                            </div>

                            <div className="petugas-detail-row">
                                <span>Lokasi</span>
                                <strong>{laporanAktif.lokasi}</strong>
                            </div>

                            <div className="petugas-detail-row">
                                <span>Prioritas</span>
                                <Badge
                                    value={laporanAktif.prioritas}
                                    type="prioritas"
                                />
                            </div>

                            <div className="petugas-detail-row">
                                <span>Status</span>
                                <Badge value={laporanAktif.status} />
                            </div>

                            <div className="petugas-detail-description">
                                <strong>Deskripsi Pengaduan</strong>
                                <p>{laporanAktif.deskripsi}</p>
                            </div>

                            {/* RIWAYAT PERUBAHAN */}

                            <div className="petugas-history">
                                <h3>
                                    <History size={17} />
                                    Riwayat Perubahan Status
                                </h3>

                                {laporanAktif.riwayat.length > 0 ? (
                                    laporanAktif.riwayat.map((r, i) => (
                                        <div
                                            className="petugas-history-item"
                                            key={i}
                                        >
                                            <small>
                                                {r.tanggal ||
                                                    r.created_at ||
                                                    "-"}
                                            </small>

                                            <p>
                                                {r.statusLama ||
                                                    r.status_lama ||
                                                    "-"}
                                                {" → "}
                                                {r.statusBaru ||
                                                    r.status_baru ||
                                                    "-"}
                                            </p>

                                            <span>{r.catatan || "-"}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="petugas-history-empty">
                                        Belum ada riwayat perubahan status.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="petugas-modal-footer">
                            <button
                                type="button"
                                className="petugas-btn-secondary"
                                onClick={tutupModal}
                            >
                                Tutup
                            </button>

                            {laporanAktif.status !==
                                "Ajukan Penyelesaian" &&
                                laporanAktif.status !== "Selesai" && (
                                    <button
                                        type="button"
                                        className="petugas-btn-primary"
                                        onClick={() =>
                                            bukaEdit(laporanAktif)
                                        }
                                    >
                                        <Pencil size={16} />
                                        Edit Status
                                    </button>
                                )}
                        </div>
                    </div>
                </div>
            )}

            {/* ================================================= */}
            {/* MODAL EDIT STATUS */}
            {/* ================================================= */}

            {modal === "edit" && laporanAktif && (
                <div
                    className="petugas-modal-overlay"
                    onClick={tutupModal}
                >
                    <div
                        className="petugas-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Edit status pengaduan"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <form onSubmit={simpanStatus}>
                            <div className="petugas-modal-header">
                                <div>
                                    <small>PENGELOLAAN PENGADUAN</small>
                                    <h2>Edit Status Pengaduan</h2>
                                </div>

                                <button
                                    type="button"
                                    className="petugas-modal-close"
                                    onClick={tutupModal}
                                    aria-label="Tutup"
                                >
                                    <X size={21} />
                                </button>
                            </div>

                            <div className="petugas-modal-content">
                                <div className="petugas-edit-info">
                                    <span>Nomor Laporan</span>
                                    <strong>{laporanAktif.nomor}</strong>

                                    <p>
                                        {laporanAktif.kategori}
                                        {" — "}
                                        {laporanAktif.lokasi}
                                    </p>
                                </div>

                                <div className="petugas-form-group">
                                    <label>Status Saat Ini</label>

                                    <div>
                                        <Badge value={laporanAktif.status} />
                                    </div>
                                </div>

                                <div className="petugas-form-group">
                                    <label htmlFor="statusBaru">
                                        Ubah Status Menjadi
                                    </label>

                                    <select
                                        id="statusBaru"
                                        value={statusBaru}
                                        onChange={(e) =>
                                            setStatusBaru(e.target.value)
                                        }
                                        required
                                    >
                                        {statusOptions.map((status) => (
                                            <option
                                                key={status}
                                                value={status}
                                            >
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="petugas-form-group">
                                    <label htmlFor="catatanPetugas">
                                        Catatan Petugas
                                    </label>

                                    <textarea
                                        id="catatanPetugas"
                                        rows="4"
                                        placeholder="Tuliskan keterangan tindak lanjut..."
                                        value={catatan}
                                        onChange={(e) =>
                                            setCatatan(e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <div className="petugas-modal-footer">
                                <button
                                    type="button"
                                    className="petugas-btn-secondary"
                                    onClick={tutupModal}
                                    disabled={saving}
                                >
                                    Batal
                                </button>

                                <button
                                    type="submit"
                                    className="petugas-btn-primary"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <RefreshCw
                                                size={17}
                                                className="petugas-spin"
                                            />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={17} />
                                            Simpan Perubahan
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
