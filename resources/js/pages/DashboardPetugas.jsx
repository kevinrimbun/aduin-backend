
import { useState, useMemo } from 'react';
import {
  ClipboardList,
  ClipboardCheck,
  Clock3,
  CheckCircle2,
  UserRound,
  MapPin,
  X,
  Search,
  Filter,
  Eye,
  Pencil,
  Save,
  ArrowUpRight,
  History
} from 'lucide-react';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup
} from 'react-leaflet';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import Navbar from '../components/Navbar';
import '../../css/DashboardPetugas.css';

// PILIHAN STATUS
const statusOptions = [
  'Pengaduan Baru',
  'Verifikasi',
  'Ditugaskan',
  'Dalam Pengerjaan',
  'Selesai'
];

// DATA CONTOH PENGADUAN
const laporanAwal = [
  {
    nomor: 'LP-20250914-017',
    kategori: 'Sampah',
    lokasi: 'Jl. Flamboyan',
    prioritas: 'Tinggi',
    status: 'Pengaduan Baru',
    lat: -6.9147,
    lng: 107.6098,
    deskripsi: 'Penumpukan sampah yang mengganggu lingkungan.',
    riwayat: []
  },
  {
    nomor: 'LP-20250914-016',
    kategori: 'Drainase',
    lokasi: 'Jl. Melati',
    prioritas: 'Tinggi',
    status: 'Verifikasi',
    lat: -6.9200,
    lng: 107.6160,
    deskripsi: 'Saluran drainase tersumbat dan menyebabkan genangan.',
    riwayat: []
  },
  {
    nomor: 'LP-20250914-015',
    kategori: 'Jalan Rusak',
    lokasi: 'Jl. Kenanga',
    prioritas: 'Sedang',
    status: 'Ditugaskan',
    lat: -6.9080,
    lng: 107.6030,
    deskripsi: 'Permukaan jalan berlubang dan perlu diperbaiki.',
    riwayat: []
  },
  {
    nomor: 'LP-20250914-014',
    kategori: 'Lampu Mati',
    lokasi: 'Jl. Anggrek',
    prioritas: 'Sedang',
    status: 'Dalam Pengerjaan',
    lat: -6.9250,
    lng: 107.6220,
    deskripsi: 'Lampu penerangan jalan tidak berfungsi.',
    riwayat: []
  },
  {
    nomor: 'LP-20250914-013',
    kategori: 'Fasilitas Umum',
    lokasi: 'Taman Kota',
    prioritas: 'Rendah',
    status: 'Selesai',
    lat: -6.9170,
    lng: 107.6270,
    deskripsi: 'Fasilitas taman mengalami kerusakan ringan.',
    riwayat: []
  }
];

// WARNA GRAFIK
const warnaKategori = {
  'Jalan Rusak': '#2f80ed',
  'Drainase': '#ffba36',
  'Lampu Mati': '#ff8552',
  'Sampah': '#42b883',
  'Fasilitas Umum': '#f2d04e',
  'Lainnya': '#a17bd3'
};

// MARKER PETA
const markerIcon = new L.DivIcon({
  className: 'petugas-map-pin',
  html: '<span></span>',
  iconSize: [22, 30],
  iconAnchor: [11, 30]
});

// CLASS LABEL
const kelasLabel = (value) =>
  value.toLowerCase().replaceAll(' ', '-');

// KOMPONEN BADGE
function Badge({ value, type = 'status' }) {
  return (
    <span
      className={`petugas-badge ${type}-${kelasLabel(value)}`}
    >
      <span className="petugas-badge-dot" />
      {value}
    </span>
  );
}

// KOMPONEN UTAMA
export default function DashboardPetugas() {
  const [laporan, setLaporan] = useState(laporanAwal);
  const [pencarian, setPencarian] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');

  const [modal, setModal] = useState(null);
  const [laporanDipilih, setLaporanDipilih] = useState(null);

  const [statusBaru, setStatusBaru] = useState('');
  const [catatan, setCatatan] = useState('');
  const [notifikasi, setNotifikasi] = useState('');

  // STATISTIK
  const statistik = useMemo(() => [
    {
      label: 'Pengaduan Baru',
      jumlah: laporan.filter(
        x => x.status === 'Pengaduan Baru'
      ).length,
      icon: ClipboardList,
      tipe: 'biru'
    },
    {
      label: 'Verifikasi',
      jumlah: laporan.filter(
        x => x.status === 'Verifikasi'
      ).length,
      icon: ClipboardCheck,
      tipe: 'kuning'
    },
    {
      label: 'Dalam Pengerjaan',
      jumlah: laporan.filter(
        x => x.status === 'Dalam Pengerjaan'
      ).length,
      icon: Clock3,
      tipe: 'oranye'
    },
    {
      label: 'Selesai',
      jumlah: laporan.filter(
        x => x.status === 'Selesai'
      ).length,
      icon: CheckCircle2,
      tipe: 'hijau'
    }
  ], [laporan]);

  // FILTER DAN PENCARIAN
  const laporanFilter = useMemo(() => {
    return laporan
      .filter(item => {
        const cocokCari = [
          item.nomor,
          item.kategori,
          item.lokasi
        ].some(teks =>
          teks.toLowerCase().includes(
            pencarian.toLowerCase()
          )
        );

        const cocokStatus =
          filterStatus === 'Semua' ||
          item.status === filterStatus;

        return cocokCari && cocokStatus;
      })
      .sort((a, b) => {
        const urutan = {
          Tinggi: 0,
          Sedang: 1,
          Rendah: 2
        };

        return (
          urutan[a.prioritas] -
          urutan[b.prioritas]
        );
      });
  }, [laporan, pencarian, filterStatus]);

  // DATA GRAFIK KATEGORI
  const kategoriData = useMemo(() => {
    const hasil = {};

    laporan.forEach(item => {
      hasil[item.kategori] =
        (hasil[item.kategori] || 0) + 1;
    });

    return Object.entries(hasil).map(
      ([name, value]) => ({
        name,
        value,
        color:
          warnaKategori[name] ||
          warnaKategori.Lainnya
      })
    );
  }, [laporan]);

  const totalLaporan = laporan.length;

  // MODAL DETAIL
  const bukaDetail = (item) => {
    setLaporanDipilih(item);
    setModal('detail');
  };

  // MODAL EDIT
  const bukaEdit = (item) => {
    setLaporanDipilih(item);
    setStatusBaru(item.status);
    setCatatan('');
    setModal('edit');
  };

  const tutupModal = () => {
    setModal(null);
    setLaporanDipilih(null);
  };

  // SIMPAN PERUBAHAN STATUS
  const simpanStatus = (e) => {
    e.preventDefault();

    if (!laporanDipilih || !statusBaru) return;

    if (statusBaru === laporanDipilih.status) {
      setNotifikasi('Tidak ada perubahan status.');
      tutupModal();
      return;
    }

    const waktu = new Date().toLocaleString('id-ID');

    setLaporan(prev =>
      prev.map(item => {
        if (item.nomor !== laporanDipilih.nomor) {
          return item;
        }

        return {
          ...item,
          status: statusBaru,
          riwayat: [
            ...(item.riwayat || []),
            {
              tanggal: waktu,
              statusLama: item.status,
              statusBaru: statusBaru,
              catatan: catatan.trim() || '-'
            }
          ]
        };
      })
    );

    setNotifikasi(
      `Status laporan ${laporanDipilih.nomor} berhasil diperbarui.`
    );

    tutupModal();
  };

  const laporanAktif = laporanDipilih
    ? laporan.find(
        x => x.nomor === laporanDipilih.nomor
      )
    : null;

  return (
    <div className="landingpage">
      <Navbar />

      <main className="petugas-page">
        <div className="petugas-container">

          {/* HEADER SEPERTI CEK STATUS PELAPORAN */}
          <header className="petugas-heading">
            <div className="petugas-heading-left">
              <div className="petugas-heading-icon">
                <ClipboardCheck size={27} />
              </div>

              <div>
                <h1>Dashboard Petugas</h1>
                <p>
                  Kelola dan tindak lanjuti
                  pengaduan masyarakat.
                </p>
              </div>
            </div>
          </header>

          {/* KARTU STATISTIK */}
          <section className="petugas-stats">
            {statistik.map(({
              label,
              jumlah,
              icon: Icon,
              tipe
            }) => (
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
            ))}
          </section>

          {/* DAFTAR PRIORITAS */}
          <section className="petugas-priority-section">
            <div className="petugas-section-header">
              <div>
                <h2>Daftar Prioritas Pengaduan</h2>
                <p>
                  Daftar laporan berdasarkan
                  tingkat prioritas penanganan.
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
                  onChange={e =>
                    setPencarian(e.target.value)
                  }
                />
              </div>

              <div className="petugas-filter">
                <Filter size={17} />

                <select
                  value={filterStatus}
                  onChange={e =>
                    setFilterStatus(e.target.value)
                  }
                >
                  <option value="Semua">
                    Semua Status
                  </option>

                  {statusOptions.map(status => (
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

            {/* TABEL */}
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
                  {laporanFilter.length > 0 ? (
                    laporanFilter.map(item => (
                      <tr key={item.nomor}>
                        <td className="petugas-report-number">
                          {item.nomor}
                        </td>

                        <td>{item.kategori}</td>

                        <td>
                          <span className="petugas-location">
                            <MapPin size={15} />
                            {item.lokasi}
                          </span>
                        </td>

                        <td>
                          <Badge
                            value={item.prioritas}
                            type="prioritas"
                          />
                        </td>

                        <td>
                          <Badge value={item.status} />
                        </td>

                        <td>
                          <div className="petugas-actions">
                            <button
                              type="button"
                              className="petugas-detail-btn"
                              onClick={() =>
                                bukaDetail(item)
                              }
                            >
                              <Eye size={15} />
                              Detail
                            </button>

                            <button
                              type="button"
                              className="petugas-edit-btn"
                              onClick={() =>
                                bukaEdit(item)
                              }
                            >
                              <Pencil size={15} />
                              Edit Status
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
                        Tidak ada pengaduan
                        yang sesuai.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* GRAFIK DAN PETA */}
          <section className="petugas-bottom-grid">

            {/* GRAFIK SOLID PIE CHART */}
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
                        {kategoriData.map(item => (
                          <Cell
                            key={item.name}
                            fill={item.color}
                          />
                        ))}
                      </Pie>

                      <Tooltip
                        formatter={(value, name) => [
                          `${value} laporan`,
                          name
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* LEGENDA GRAFIK */}
                <div className="petugas-legend">
                  {kategoriData.map(item => (
                    <div key={item.name}>
                      <i
                        style={{
                          backgroundColor: item.color
                        }}
                      />

                      <span>{item.name}</span>

                      <strong>
                        {totalLaporan
                          ? Math.round(
                              item.value /
                              totalLaporan * 100
                            )
                          : 0}%
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            {/* PETA PENGADUAN */}
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
                  {totalLaporan} Lokasi
                </span>
              </div>

              <div className="petugas-map-wrap">
                <MapContainer
                  center={[-6.9175, 107.614]}
                  zoom={13}
                  scrollWheelZoom={false}
                  className="petugas-map"
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {laporan.map(item => (
                    <Marker
                      key={item.nomor}
                      position={[item.lat, item.lng]}
                      icon={markerIcon}
                    >
                      <Popup>
                        <strong>{item.kategori}</strong>
                        <p>{item.lokasi}</p>
                        <span>{item.status}</span>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </article>
          </section>
        </div>
      </main>

      {/* NOTIFIKASI */}
      {notifikasi && (
        <div className="petugas-toast" role="status">
          <CheckCircle2 size={19} />

          <span>{notifikasi}</span>

          <button
            type="button"
            onClick={() => setNotifikasi('')}
            aria-label="Tutup notifikasi"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* MODAL DETAIL PENGADUAN */}
      {modal === 'detail' && laporanAktif && (
        <div
          className="petugas-modal-overlay"
          onClick={tutupModal}
        >
          <div
            className="petugas-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Detail pengaduan"
            onClick={e => e.stopPropagation()}
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
                      <small>{r.tanggal}</small>

                      <p>
                        {r.statusLama}
                        {' → '}
                        {r.statusBaru}
                      </p>

                      <span>{r.catatan}</span>
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

              <button
                type="button"
                className="petugas-btn-primary"
                onClick={() => bukaEdit(laporanAktif)}
              >
                <Pencil size={16} />
                Edit Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT STATUS */}
      {modal === 'edit' && laporanAktif && (
        <div
          className="petugas-modal-overlay"
          onClick={tutupModal}
        >
          <div
            className="petugas-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Edit status pengaduan"
            onClick={e => e.stopPropagation()}
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
                    {' — '}
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
                    onChange={e =>
                      setStatusBaru(e.target.value)
                    }
                    required
                  >
                    {statusOptions.map(status => (
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
                    onChange={e =>
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
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="petugas-btn-primary"
                >
                  <Save size={17} />
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
