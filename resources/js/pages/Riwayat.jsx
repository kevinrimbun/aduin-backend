
import React, { useEffect, useState } from 'react';
import {
    Search,
    Filter,
    FileText,
    Clock,
    CheckCircle2,
    AlertCircle,
    MapPin,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Eye,
    X,
    Image as ImageIcon,
    ClipboardList,
} from 'lucide-react';

import Navbar from '../components/Navbar';
import '../../css/Riwayat.css';

// Konfigurasi status sesuai database Laravel
const statusConfig = {
    'Pengaduan Baru': {
        label: 'Menunggu Verifikasi',
        className: 'waiting',
        icon: Clock,
    },
    'Verifikasi': {
        label: 'Terverifikasi',
        className: 'verified',
        icon: AlertCircle,
    },
    'Ditugaskan': {
        label: 'Ditugaskan',
        className: 'processing',
        icon: Clock,
    },
    'Dalam Pengerjaan': {
        label: 'Sedang Diproses',
        className: 'processing',
        icon: Clock,
    },
    'Selesai': {
        label: 'Selesai',
        className: 'completed',
        icon: CheckCircle2,
    },
    'Ditolak': {
        label: 'Ditolak',
        className: 'rejected',
        icon: X,
    },
};

const defaultStatusConfig = {
    label: 'Status Tidak Diketahui',
    className: 'waiting',
    icon: AlertCircle,
};

// Format tanggal dari database Laravel
const formatDate = (date) => {
    if (!date) return '-';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return '-';
    }

    return parsedDate.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

// Mengambil URL dokumentasi foto
const getImageUrl = (fotos) => {
    if (!fotos) return null;

    let photo = fotos;

    // Jika fotos berbentuk JSON string
    if (typeof photo === 'string') {
        try {
            photo = JSON.parse(photo);
        } catch {
            // Jika bukan JSON, anggap sebagai path foto
        }
    }

    // Ambil foto pertama jika berbentuk array
    if (Array.isArray(photo)) {
        photo = photo[0];
    }

    // Jika tidak ada foto
    if (!photo) return null;

    // Jika struktur foto berbentuk object
    if (typeof photo === 'object') {
        photo = photo.url || photo.path || photo.file;
    }

    if (!photo) return null;

    // Jika URL sudah lengkap
    if (photo.startsWith('http://') || photo.startsWith('https://')) {
        return photo;
    }

    // Jika sudah menggunakan path /storage
    if (photo.startsWith('/')) {
        return photo;
    }

    return `/storage/${photo}`;
};

const Riwayat = () => {
    // STATE FILTER
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('semua');
    const [status, setStatus] = useState('semua');

    // STATE DATA API
    const [complaints, setComplaints] = useState([]);

    const [statistics, setStatistics] = useState({
        total: 0,
        menunggu: 0,
        diproses: 0,
        selesai: 0,
    });

    // STATE PAGINATION
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalData, setTotalData] = useState(0);
    const [fromData, setFromData] = useState(0);
    const [toData, setToData] = useState(0);

    const itemsPerPage = 5;

    // STATE LOADING DAN ERROR
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // STATE MODAL
    const [selectedComplaint, setSelectedComplaint] = useState(null);

    // MENGAMBIL DATA DARI API
    useEffect(() => {
        const controller = new AbortController();

        const fetchRiwayat = async () => {
            try {
                setLoading(true);
                setError('');

                const params = new URLSearchParams();

                params.append('page', currentPage);
                params.append('per_page', itemsPerPage);

                if (search.trim()) {
                    params.append('search', search.trim());
                }

                if (category !== 'semua') {
                    params.append('kategori', category);
                }

                if (status !== 'semua') {
                    params.append('status', status);
                }

                const response = await fetch(
                    `/api/riwayat-publik?${params.toString()}`,
                    {
                        method: 'GET',
                        headers: {
                            Accept: 'application/json',
                        },
                        signal: controller.signal,
                    }
                );

                if (!response.ok) {
                    throw new Error('Gagal mengambil data pengaduan.');
                }

                const result = await response.json();

                if (!result.success) {
                    throw new Error(
                        result.message || 'Data pengaduan gagal dimuat.'
                    );
                }

                // Data pagination dari Laravel
                const pagination = result.data;

                // Konversi data database ke format React
                const formattedData = (pagination.data || []).map((item) => ({
                    id: item.id,
                    ticket: item.nomor_laporan,
                    title: item.judul,
                    category: item.kategori,

                    location: [
                        item.alamat,
                        item.kelurahan,
                        item.kecamatan,
                    ]
                        .filter(Boolean)
                        .join(', '),

                    date: item.created_at,
                    status: item.status,
                    description: item.deskripsi,
                    priority: item.prioritas,
                    image: getImageUrl(item.fotos),
                }));

                setComplaints(formattedData);

                // Statistik dari API
                if (result.statistics) {
                    setStatistics({
                        total: result.statistics.total ?? 0,
                        menunggu: result.statistics.menunggu ?? 0,
                        diproses: result.statistics.diproses ?? 0,
                        selesai: result.statistics.selesai ?? 0,
                    });
                }

                // Pagination Laravel
                setCurrentPage(pagination.current_page || 1);
                setLastPage(pagination.last_page || 1);
                setTotalData(pagination.total || 0);
                setFromData(pagination.from || 0);
                setToData(pagination.to || 0);

            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Error mengambil riwayat:', err);
                    setError(err.message || 'Terjadi kesalahan.');
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchRiwayat();

        return () => {
            controller.abort();
        };
    }, [search, category, status, currentPage]);

    // HANDLER PENCARIAN
    const handleSearch = (value) => {
        setSearch(value);
        setCurrentPage(1);
    };

    // HANDLER FILTER
    const handleFilter = (setter, value) => {
        setter(value);
        setCurrentPage(1);
    };

    // RESET FILTER
    const resetFilter = () => {
        setSearch('');
        setCategory('semua');
        setStatus('semua');
        setCurrentPage(1);
    };

    return (
        <div className="landingpage riwayat-page">

            <Navbar />

            <main className="riwayat-container">

                {/* PAGE HEADER */}
                <section className="riwayat-header">

                    <div>
                        <div className="riwayat-breadcrumb">
                            <span>Beranda</span>
                            <ChevronRight size={14} />
                            <span className="breadcrumb-active">
                                Riwayat Pengaduan
                            </span>
                        </div>

                        <h1>Riwayat Pengaduan</h1>

                        <p>
                            Lihat dan pantau seluruh pengaduan infrastruktur
                            yang telah disampaikan masyarakat Kecamatan Balung.
                        </p>
                    </div>

                    <div className="riwayat-header-icon">
                        <ClipboardList size={36} />
                    </div>

                </section>


                {/* STATISTIK */}
                <section className="riwayat-statistics">

                    <div className="stat-card">
                        <div className="stat-icon blue">
                            <FileText size={23} />
                        </div>

                        <div>
                            <span>Total Pengaduan</span>
                            <h2>{statistics.total}</h2>
                            <small>Seluruh laporan masyarakat</small>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon orange">
                            <Clock size={23} />
                        </div>

                        <div>
                            <span>Menunggu Verifikasi</span>
                            <h2>{statistics.menunggu}</h2>
                            <small>Menunggu pemeriksaan petugas</small>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon purple">
                            <AlertCircle size={23} />
                        </div>

                        <div>
                            <span>Sedang Diproses</span>
                            <h2>{statistics.diproses}</h2>
                            <small>Dalam penanganan petugas</small>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon green">
                            <CheckCircle2 size={23} />
                        </div>

                        <div>
                            <span>Selesai Ditangani</span>
                            <h2>{statistics.selesai}</h2>
                            <small>Pengaduan telah diselesaikan</small>
                        </div>
                    </div>

                </section>


                {/* DAFTAR PENGADUAN */}
                <section className="riwayat-content">

                    <div className="riwayat-section-heading">
                        <div>
                            <h2>Daftar Pengaduan Masyarakat</h2>
                            <p>
                                Informasi seluruh laporan yang masuk ke ADUIN.
                            </p>
                        </div>

                        <span className="total-label">
                            {totalData} Pengaduan
                        </span>
                    </div>


                    {/* SEARCH & FILTER */}
                    <div className="riwayat-filter">

                        <div className="riwayat-search">
                            <Search size={19} />

                            <input
                                type="text"
                                placeholder="Cari judul, nomor tiket, atau lokasi..."
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>

                        <div className="riwayat-select">
                            <Filter size={17} />

                            <select
                                value={category}
                                onChange={(e) =>
                                    handleFilter(setCategory, e.target.value)
                                }
                            >
                                <option value="semua">Semua Kategori</option>
                                <option value="Jalan">Jalan</option>
                                <option value="Drainase">Drainase</option>
                                <option value="Jembatan">Jembatan</option>
                                <option value="Penerangan Jalan">
                                    Penerangan Jalan
                                </option>
                            </select>
                        </div>

                        <div className="riwayat-select">

                            <select
                                value={status}
                                onChange={(e) =>
                                    handleFilter(setStatus, e.target.value)
                                }
                            >
                                <option value="semua">Semua Status</option>
                                <option value="Pengaduan Baru">
                                    Menunggu Verifikasi
                                </option>
                                <option value="Verifikasi">
                                    Terverifikasi
                                </option>
                                <option value="Ditugaskan">
                                    Ditugaskan
                                </option>
                                <option value="Dalam Pengerjaan">
                                    Sedang Diproses
                                </option>
                                <option value="Selesai">
                                    Selesai
                                </option>
                                <option value="Ditolak">
                                    Ditolak
                                </option>
                            </select>

                        </div>

                    </div>


                    {/* LIST PENGADUAN */}
                    <div className="riwayat-list">

                        {loading ? (

                            <div className="riwayat-empty">
                                <p>Memuat data pengaduan...</p>
                            </div>

                        ) : error ? (

                            <div className="riwayat-empty">
                                <div>
                                    <AlertCircle size={35} />
                                </div>

                                <h3>Gagal Memuat Pengaduan</h3>

                                <p>{error}</p>

                                <button
                                    onClick={() => {
                                        setCurrentPage(1);
                                        setSearch(value => value);
                                    }}
                                >
                                    Coba Lagi
                                </button>
                            </div>

                        ) : complaints.length > 0 ? (

                            complaints.map((item) => {

                                const config =
                                    statusConfig[item.status] ||
                                    defaultStatusConfig;

                                const StatusIcon = config.icon;

                                return (
                                    <article
                                        className="riwayat-card"
                                        key={item.id}
                                    >

                                        <div className="riwayat-card-icon">
                                            <FileText size={26} />
                                        </div>

                                        <div className="riwayat-card-main">

                                            <div className="riwayat-card-top">

                                                <span className="ticket-number">
                                                    {item.ticket}
                                                </span>

                                                <span className={`status-badge ${config.className}`}>
                                                    <StatusIcon size={13} />
                                                    {config.label}
                                                </span>

                                            </div>

                                            <h3>{item.title}</h3>

                                            <p className="riwayat-description">
                                                {item.description}
                                            </p>

                                            <div className="riwayat-meta">

                                                <span>
                                                    <ClipboardList size={15} />
                                                    {item.category}
                                                </span>

                                                <span>
                                                    <MapPin size={15} />
                                                    {item.location || '-'}
                                                </span>

                                                <span>
                                                    <CalendarDays size={15} />
                                                    {formatDate(item.date)}
                                                </span>

                                            </div>

                                        </div>

                                        <div className="riwayat-card-action">

                                            <button
                                                className="detail-button"
                                                onClick={() => setSelectedComplaint(item)}
                                            >
                                                <Eye size={16} />
                                                Detail
                                            </button>

                                        </div>

                                    </article>
                                );
                            })

                        ) : (

                            <div className="riwayat-empty">
                                <div>
                                    <Search size={35} />
                                </div>

                                <h3>Pengaduan Tidak Ditemukan</h3>

                                <p>
                                    Tidak ada pengaduan yang sesuai dengan
                                    pencarian atau filter kamu.
                                </p>

                                <button onClick={resetFilter}>
                                    Reset Filter
                                </button>
                            </div>

                        )}

                    </div>


                    {/* PAGINATION */}
                    {!loading && !error && totalData > 0 && (

                        <div className="riwayat-pagination">

                            <span>
                                Menampilkan {fromData} - {toData}
                                {' dari '}
                                {totalData} pengaduan
                            </span>

                            <div className="pagination-buttons">

                                <button
                                    disabled={currentPage <= 1}
                                    onClick={() => setCurrentPage(p => p - 1)}
                                >
                                    <ChevronLeft size={17} />
                                </button>

                                <span className="page-number">
                                    {currentPage} / {lastPage}
                                </span>

                                <button
                                    disabled={currentPage >= lastPage}
                                    onClick={() => setCurrentPage(p => p + 1)}
                                >
                                    <ChevronRight size={17} />
                                </button>

                            </div>

                        </div>

                    )}

                </section>


                {/* MODAL DETAIL */}
                {selectedComplaint && (

                    <div
                        className="riwayat-modal-overlay"
                        onClick={() => setSelectedComplaint(null)}
                    >

                        <div
                            className="riwayat-modal"
                            onClick={(e) => e.stopPropagation()}
                        >

                            <div className="riwayat-modal-header">
                                <div>
                                    <span>DETAIL PENGADUAN</span>
                                    <h2>Informasi Pengaduan</h2>
                                </div>

                                <button
                                    onClick={() => setSelectedComplaint(null)}
                                >
                                    <X size={21} />
                                </button>
                            </div>

                            <div className="riwayat-modal-body">

                                <span className="ticket-number">
                                    {selectedComplaint.ticket}
                                </span>

                                <h3>{selectedComplaint.title}</h3>

                                <div className="modal-detail-status">

                                    {(() => {
                                        const config =
                                            statusConfig[selectedComplaint.status] ||
                                            defaultStatusConfig;

                                        const StatusIcon = config.icon;

                                        return (
                                            <span className={`status-badge ${config.className}`}>
                                                <StatusIcon size={13} />
                                                {config.label}
                                            </span>
                                        );
                                    })()}

                                </div>

                                <div className="modal-detail-grid">

                                    <div>
                                        <label>Kategori</label>
                                        <p>{selectedComplaint.category}</p>
                                    </div>

                                    <div>
                                        <label>Prioritas</label>
                                        <p>{selectedComplaint.priority || '-'}</p>
                                    </div>

                                    <div>
                                        <label>Tanggal Laporan</label>
                                        <p>{formatDate(selectedComplaint.date)}</p>
                                    </div>

                                    <div className="full">
                                        <label>Lokasi Pengaduan</label>
                                        <p>
                                            <MapPin size={15} />
                                            {selectedComplaint.location || '-'}
                                        </p>
                                    </div>

                                    <div className="full">
                                        <label>Deskripsi Pengaduan</label>
                                        <p className="modal-description">
                                            {selectedComplaint.description || '-'}
                                        </p>
                                    </div>

                                    <div className="full">
                                        <label>Dokumentasi</label>

                                        {selectedComplaint.image ? (

                                            <img
                                                src={selectedComplaint.image}
                                                alt="Dokumentasi pengaduan"
                                                className="modal-detail-image"
                                            />

                                        ) : (

                                            <div className="modal-image-placeholder">
                                                <ImageIcon size={30} />

                                                <span>
                                                    Belum ada dokumentasi ditampilkan
                                                </span>
                                            </div>

                                        )}

                                    </div>

                                </div>

                            </div>

                            <div className="riwayat-modal-footer">
                                <button
                                    onClick={() => setSelectedComplaint(null)}
                                >
                                    Tutup
                                </button>
                            </div>

                        </div>

                    </div>

                )}

            </main>

        </div>
    );
};

export default Riwayat;
