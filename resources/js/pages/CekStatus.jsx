
import { useState } from 'react';
import {
    ArrowLeft,
    Image as ImageIcon,
    X,
    ChevronLeft,
    ChevronRight,
    ClipboardCheck
    // CalendarDays,
    // MapPin,
    // FileText,
    // CheckCircle2
} from 'lucide-react';

import Navbar from '../components/Navbar';
import '../../css/CekStatus.css';

// Data contoh untuk tampilan.
// Nantinya dapat diganti dengan data dari Laravel API.
const dataPengaduan = {
    nomor: 'LP-20250914-001',
    kategori: 'Jalan Rusak',
    lokasi: 'Jl. Melati No. 12, Kel. Sukamaju, Kec. Cibiru',
    tanggal: '14 Sep 2025, 08:32',
    status: 'Dalam Pengerjaan',
    prioritas: 'Sedang',
    deskripsi:
        'Jalan di depan rumah warga sudah berlubang cukup dalam dan membahayakan pengguna jalan, terutama saat malam hari.',

    fotoUtama: '/Assets/pengaduan/jalan-rusak.jpg',

    dokumentasi: [
        {
            id: 1,
            src: '/Assets/pengaduan/jalan-rusak.jpg',
            judul: 'Kondisi jalan sebelum diperbaiki'
        },
        {
            id: 2,
            src: '/Assets/pengaduan/perbaikan-jalan.jpg',
            judul: 'Proses perbaikan jalan'
        }
    ],

    riwayat: [
        {
            id: 1,
            tanggal: '14 Sep 2025',
            jam: '08:32',
            keterangan: 'Laporan diterima oleh sistem',
            status: 'Diajukan',
            warna: 'biru'
        },
        {
            id: 2,
            tanggal: '14 Sep 2025',
            jam: '10:15',
            keterangan: 'Diverifikasi oleh petugas',
            status: 'Diverifikasi',
            warna: 'hijau'
        },
        {
            id: 3,
            tanggal: '14 Sep 2025',
            jam: '13:20',
            keterangan: 'Ditugaskan ke Dinas PUPR',
            status: 'Ditugaskan',
            warna: 'kuning'
        },
        {
            id: 4,
            tanggal: '15 Sep 2025',
            jam: '09:10',
            keterangan: 'Proses perbaikan',
            status: 'Dalam Pengerjaan',
            warna: 'merah'
        },
        {
            id: 5,
            tanggal: '17 Sep 2025',
            jam: '16:45',
            keterangan: 'Perbaikan selesai',
            status: 'Selesai',
            warna: 'hijau'
        }
    ]
};

function FotoLaporan({ src, alt, className = '' }) {
    const [gagal, setGagal] = useState(false);

    return gagal ? (
        <div className={`detail-foto-placeholder ${className}`}>
            <ImageIcon size={28} />
            <span>Foto belum tersedia</span>
        </div>
    ) : (
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
        <span className={`detail-badge detail-badge-${warna}`}>
            {status}
        </span>
    );
}

export default function DetailPengaduan() {
    const [modalTerbuka, setModalTerbuka] = useState(false);
    const [fotoAktif, setFotoAktif] = useState(0);

    const laporan = dataPengaduan;
    const dokumentasi = laporan.dokumentasi;

    const bukaDokumentasi = (index = 0) => {
        setFotoAktif(index);
        setModalTerbuka(true);
    };

    const fotoSebelumnya = () => {
        setFotoAktif(prev =>
            (prev - 1 + dokumentasi.length) % dokumentasi.length
        );
    };

    const fotoBerikutnya = () => {
        setFotoAktif(prev =>
            (prev + 1) % dokumentasi.length
        );
    };

    return (
        <div className="landingpage">
            <Navbar />

            <main className="detail-page">
                <div className="detail-container">

                    {/* HEADER HALAMAN */}
                    <div className="detail-header">
                        <div className="detail-header-title">
                            <div className="detail-header-icon">
                                <ClipboardCheck size={28} />
                            </div>

                            <h1>Cek Status Pelaporan</h1>
                        </div>
                    </div>

                    {/* GRID UTAMA */}
                    <div className="detail-grid">

                        {/* INFORMASI LAPORAN */}
                        <section className="detail-card detail-informasi">
                            <div className="detail-nomor-row">
                                <div className="detail-nomor">
                                    <span>No. Laporan</span>
                                    <strong>#{laporan.nomor}</strong>
                                </div>

                                <BadgeStatus
                                    status={laporan.status}
                                    warna="oranye"
                                />
                            </div>

                            <div className="detail-data-row">
                                <span>Kategori</span>
                                <p>{laporan.kategori}</p>
                            </div>

                            <div className="detail-data-row">
                                <span>Lokasi</span>
                                <p>{laporan.lokasi}</p>
                            </div>

                            <div className="detail-data-row">
                                <span>Tanggal</span>
                                <p>{laporan.tanggal}</p>
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
                                <p>{laporan.deskripsi}</p>
                            </div>
                        </section>

                        {/* FOTO UTAMA */}
                        <section className="detail-card detail-foto-utama">
                            <button
                                type="button"
                                className="detail-main-photo-button"
                                onClick={() => bukaDokumentasi(0)}
                                aria-label="Lihat foto utama"
                            >
                                <FotoLaporan
                                    src={laporan.fotoUtama}
                                    alt="Foto kondisi jalan rusak"
                                    className="detail-main-photo"
                                />
                            </button>
                        </section>

                        {/* TIMELINE TINDAK LANJUT */}
                        <section className="detail-card detail-riwayat">
                            <div className="detail-card-heading">
                                <h2>Riwayat Tindak Lanjut</h2>
                                <span></span>
                            </div>

                            <div className="detail-timeline">
                                {laporan.riwayat.map((item) => (
                                    <div
                                        className="detail-timeline-item"
                                        key={item.id}
                                    >
                                        <div className="detail-timeline-marker">
                                            <span
                                                className={`detail-dot detail-dot-${item.warna}`}
                                            />
                                        </div>

                                        <div className="detail-timeline-date">
                                            {item.tanggal}
                                            <span>{item.jam}</span>
                                        </div>

                                        <p className="detail-timeline-text">
                                            {item.keterangan}
                                        </p>

                                        <BadgeStatus
                                            status={item.status}
                                            warna={item.warna}
                                        />
                                    </div>
                                ))}
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
                                        aria-label={`Lihat ${foto.judul}`}
                                    >
                                        <FotoLaporan
                                            src={foto.src}
                                            alt={foto.judul}
                                            className="detail-gallery-photo"
                                        />
                                    </button>
                                ))}
                            </div>

                            <button
                                type="button"
                                className="detail-gallery-all"
                                onClick={() => bukaDokumentasi(0)}
                            >
                                Lihat Semua Dokumentasi
                            </button>
                        </section>

                    </div>
                </div>
            </main>

            {/* MODAL GALERI FOTO */}
            {modalTerbuka && (
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
                            <button
                                type="button"
                                onClick={fotoSebelumnya}
                                aria-label="Foto sebelumnya"
                            >
                                <ChevronLeft size={24} />
                            </button>

                            <FotoLaporan
                                src={dokumentasi[fotoAktif].src}
                                alt={dokumentasi[fotoAktif].judul}
                            />

                            <button
                                type="button"
                                onClick={fotoBerikutnya}
                                aria-label="Foto berikutnya"
                            >
                                <ChevronRight size={24} />
                            </button>
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
