
import { useEffect, useState } from 'react';
import {
    ArrowLeft,
    Image as ImageIcon,
    X,
    ChevronLeft,
    ChevronRight,
    ClipboardCheck,
    Search,
    MapPin,
    CalendarDays,
    FileText,
} from 'lucide-react';

import Navbar from '../components/Navbar';
import '../../css/CekStatus.css';

const API_URL = '/api/pengaduan';

function formatTanggal(tanggal) {
    if (!tanggal) return '-';

    return new Date(tanggal).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function getFotoUrl(path) {
    if (!path) return null;

    // Jika Laravel sudah mengirim URL lengkap.
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    // Jika yang dikirim adalah path file dari storage Laravel.
    return `/storage/${path.replace(/^\/?storage\//, '')}`;
}

function warnaStatus(status) {
    const value = (status || '').toLowerCase();

    if (value.includes('selesai')) return 'hijau';
    if (value.includes('pengerjaan')) return 'merah';
    if (value.includes('tugas')) return 'kuning';
    if (value.includes('verifikasi')) return 'oranye';

    return 'biru';
}

function FotoLaporan({ src, alt, className = '' }) {
    const [gagal, setGagal] = useState(false);

    useEffect(() => {
        setGagal(false);
    }, [src]);

    if (!src || gagal) {
        return (
            <div className={`detail-foto-placeholder ${className}`}>
                <ImageIcon size={28} />
                <span>Foto belum tersedia</span>
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            onError={() => setGagal(true)}
        />
    );
}

function BadgeStatus({ status, warna }) {
    return (
        <span className={`detail-badge detail-badge-${warna || warnaStatus(status)}`}>
            {status || '-'}
        </span>
    );
}

export default function CekStatus() {
    const [daftarLaporan, setDaftarLaporan] = useState([]);
    const [laporan, setLaporan] = useState(null);

    const [loading, setLoading] = useState(true);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [error, setError] = useState('');

    const [keyword, setKeyword] = useState('');

    const [modalTerbuka, setModalTerbuka] = useState(false);
    const [fotoAktif, setFotoAktif] = useState(0);

    // Mengambil daftar pengaduan milik user yang sedang login.
    const ambilDaftarLaporan = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await fetch(API_URL, {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Gagal mengambil daftar pengaduan.');
            }

            // index() menggunakan pagination Laravel.
            setDaftarLaporan(result.data?.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        ambilDaftarLaporan();
    }, []);

    // Mengambil detail laporan berdasarkan ID yang diklik.
    const bukaDetail = async (id) => {
        try {
            setLoadingDetail(true);
            setError('');

            const response = await fetch(`${API_URL}/${id}`, {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Gagal mengambil detail pengaduan.');
            }

            setLaporan(result.data);
            setFotoAktif(0);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingDetail(false);
        }
    };

    const kembaliKeDaftar = () => {
        setLaporan(null);
        setModalTerbuka(false);
        setError('');
    };

    // Data foto dari kolom JSON fotos.
    const dokumentasi = (laporan?.fotos || []).map((foto, index) => {
        // Mendukung format array string maupun array object.
        const path = typeof foto === 'string' ? foto : foto.path || foto.url;

        return {
            id: foto.id || index,
            src: getFotoUrl(path),
            judul: foto.judul || `Dokumentasi ${index + 1}`,
        };
    });

    const bukaDokumentasi = (index = 0) => {
        if (!dokumentasi.length) return;

        setFotoAktif(index);
        setModalTerbuka(true);
    };

    const fotoSebelumnya = () => {
        setFotoAktif((prev) =>
            (prev - 1 + dokumentasi.length) % dokumentasi.length
        );
    };

    const fotoBerikutnya = () => {
        setFotoAktif((prev) =>
            (prev + 1) % dokumentasi.length
        );
    };

    const daftarTerfilter = daftarLaporan.filter((item) => {
        const cari = keyword.toLowerCase();

        return (
            (item.nomor_laporan || '').toLowerCase().includes(cari) ||
            (item.judul || '').toLowerCase().includes(cari) ||
            (item.kategori || '').toLowerCase().includes(cari) ||
            (item.alamat || '').toLowerCase().includes(cari)
        );
    });

    return (
        <div className="landingpage">
            <Navbar />

            <main className="detail-page">
                <div className="detail-container">

                    <div className="detail-header">
                        <div className="detail-header-title">
                            <div className="detail-header-icon">
                                <ClipboardCheck size={28} />
                            </div>

                            <h1>Cek Status Pelaporan</h1>
                        </div>
                    </div>

                    {error && (
                        <div className="cek-status-error">
                            {error}
                        </div>
                    )}

                    {/* TAMPILAN DAFTAR PENGADUAN */}
                    {!laporan && (
                        <section className="cek-status-list">
                            <div className="cek-status-list-heading">
                                <div>
                                    <h2>Pengaduan Saya</h2>
                                    <p>Pantau status laporan infrastruktur yang telah kamu kirim.</p>
                                </div>

                                <span>
                                    {daftarLaporan.length} Laporan
                                </span>
                            </div>

                            <div className="cek-status-search">
                                <Search size={19} />

                                <input
                                    type="text"
                                    placeholder="Cari nomor laporan, judul, kategori, atau lokasi..."
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                />
                            </div>

                            {loading ? (
                                <p className="cek-status-message">
                                    Memuat daftar pengaduan...
                                </p>
                            ) : daftarTerfilter.length === 0 ? (
                                <div className="cek-status-empty">
                                    <FileText size={38} />
                                    <h3>Belum ada pengaduan</h3>
                                    <p>
                                        {keyword
                                            ? 'Tidak ada laporan yang sesuai dengan pencarian.'
                                            : 'Kamu belum memiliki laporan pengaduan.'}
                                    </p>
                                </div>
                            ) : (
                                <div className="cek-status-cards">
                                    {daftarTerfilter.map((item) => (
                                        <button
                                            type="button"
                                            className="cek-status-card"
                                            key={item.id}
                                            onClick={() => bukaDetail(item.id)}
                                        >
                                            <div className="cek-status-card-top">
                                                <strong>
                                                    #{item.nomor_laporan}
                                                </strong>

                                                <BadgeStatus
                                                    status={item.status}
                                                />
                                            </div>

                                            <h3>{item.judul}</h3>

                                            <div className="cek-status-card-info">
                                                <span>
                                                    <FileText size={15} />
                                                    {item.kategori}
                                                </span>

                                                <span>
                                                    <MapPin size={15} />
                                                    {item.alamat}
                                                </span>

                                                <span>
                                                    <CalendarDays size={15} />
                                                    {formatTanggal(item.created_at)}
                                                </span>
                                            </div>

                                            <div className="cek-status-card-bottom">
                                                <span>
                                                    Prioritas: {item.prioritas}
                                                </span>
                                                <span>Lihat Detail →</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </section>
                    )}

                    {/* LOADING DETAIL */}
                    {loadingDetail && (
                        <p className="cek-status-message">
                            Memuat detail pengaduan...
                        </p>
                    )}

                    {/* TAMPILAN DETAIL PENGADUAN */}
                    {laporan && !loadingDetail && (
                        <>
                            <button
                                type="button"
                                className="detail-back-button"
                                onClick={kembaliKeDaftar}
                            >
                                <ArrowLeft size={18} />
                                Kembali ke Daftar Pengaduan
                            </button>

                            <div className="detail-grid">

                                {/* INFORMASI LAPORAN */}
                                <section className="detail-card detail-informasi">
                                    <div className="detail-nomor-row">
                                        <div className="detail-nomor">
                                            <span>No. Laporan</span>
                                            <strong>#{laporan.nomor_laporan}</strong>
                                        </div>

                                        <BadgeStatus status={laporan.status} />
                                    </div>

                                    <div className="detail-data-row">
                                        <span>Judul</span>
                                        <p>{laporan.judul || '-'}</p>
                                    </div>

                                    <div className="detail-data-row">
                                        <span>Kategori</span>
                                        <p>{laporan.kategori || '-'}</p>
                                    </div>

                                    <div className="detail-data-row">
                                        <span>Lokasi</span>
                                        <p>
                                            {[
                                                laporan.alamat,
                                                laporan.kelurahan,
                                                laporan.kecamatan,
                                            ].filter(Boolean).join(', ') || '-'}
                                        </p>
                                    </div>

                                    <div className="detail-data-row">
                                        <span>Tanggal</span>
                                        <p>{formatTanggal(laporan.created_at)}</p>
                                    </div>

                                    <div className="detail-data-row">
                                        <span>Prioritas</span>
                                        <div>
                                            <BadgeStatus
                                                status={laporan.prioritas}
                                                warna="kuning"
                                            />
                                        </div>
                                    </div>

                                    <div className="detail-description">
                                        <div className="detail-description-title">
                                            <strong>Deskripsi</strong>
                                            <span></span>
                                        </div>
                                        <p>{laporan.deskripsi || '-'}</p>
                                    </div>
                                </section>

                                {/* FOTO UTAMA */}
                                <section className="detail-card detail-foto-utama">
                                    <button
                                        type="button"
                                        className="detail-main-photo-button"
                                        onClick={() => bukaDokumentasi(0)}
                                        disabled={!dokumentasi.length}
                                    >
                                        <FotoLaporan
                                            src={dokumentasi[0]?.src}
                                            alt="Foto utama pengaduan"
                                            className="detail-main-photo"
                                        />
                                    </button>
                                </section>

                                {/* RIWAYAT TINDAK LANJUT */}
                                <section className="detail-card detail-riwayat">
                                    <div className="detail-card-heading">
                                        <h2>Riwayat Tindak Lanjut</h2>
                                        <span></span>
                                    </div>

                                    <div className="detail-timeline">
                                        {(laporan.riwayat || []).length === 0 ? (
                                            <p>Belum ada riwayat tindak lanjut.</p>
                                        ) : (
                                            laporan.riwayat.map((item) => (
                                                <div
                                                    className="detail-timeline-item"
                                                    key={item.id}
                                                >
                                                    <div className="detail-timeline-marker">
                                                        <span
                                                            className={`detail-dot detail-dot-${warnaStatus(item.status)}`}
                                                        />
                                                    </div>

                                                    <div className="detail-timeline-date">
                                                        {formatTanggal(item.created_at)}
                                                    </div>

                                                    <p className="detail-timeline-text">
                                                        {item.keterangan || item.catatan || '-'}
                                                    </p>

                                                    <BadgeStatus
                                                        status={item.status}
                                                    />
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </section>

                                {/* DOKUMENTASI */}
                                <section className="detail-card detail-dokumentasi">
                                    <div className="detail-card-heading">
                                        <h2>Dokumentasi</h2>
                                        <span></span>
                                    </div>

                                    <div className="detail-gallery">
                                        {dokumentasi.map((foto, index) => (
                                            <button
                                                type="button"
                                                key={foto.id}
                                                className="detail-gallery-button"
                                                onClick={() => bukaDokumentasi(index)}
                                            >
                                                <FotoLaporan
                                                    src={foto.src}
                                                    alt={foto.judul}
                                                    className="detail-gallery-photo"
                                                />
                                            </button>
                                        ))}
                                    </div>

                                    {dokumentasi.length > 0 && (
                                        <button
                                            type="button"
                                            className="detail-gallery-all"
                                            onClick={() => bukaDokumentasi(0)}
                                        >
                                            Lihat Semua Dokumentasi
                                        </button>
                                    )}
                                </section>
                            </div>
                        </>
                    )}
                </div>
            </main>

            {/* MODAL GALERI FOTO */}
            {modalTerbuka && dokumentasi[fotoAktif] && (
                <div
                    className="detail-modal-backdrop"
                    onClick={() => setModalTerbuka(false)}
                >
                    <div
                        className="detail-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Galeri dokumentasi pengaduan"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="detail-modal-header">
                            <h2>Dokumentasi Pengaduan</h2>
                            <button
                                type="button"
                                onClick={() => setModalTerbuka(false)}
                                aria-label="Tutup galeri"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <div className="detail-modal-image">
                            {dokumentasi.length > 1 && (
                                <button
                                    type="button"
                                    onClick={fotoSebelumnya}
                                    aria-label="Foto sebelumnya"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                            )}

                            <FotoLaporan
                                src={dokumentasi[fotoAktif].src}
                                alt={dokumentasi[fotoAktif].judul}
                            />

                            {dokumentasi.length > 1 && (
                                <button
                                    type="button"
                                    onClick={fotoBerikutnya}
                                    aria-label="Foto berikutnya"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            )}
                        </div>

                        <p className="detail-modal-caption">
                            {dokumentasi[fotoAktif].judul}
                        </p>

                        <div className="detail-modal-counter">
                            {fotoAktif + 1} / {dokumentasi.length}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
