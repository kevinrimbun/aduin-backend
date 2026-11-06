import { useEffect, useState } from 'react';
import {
    FilePenLine,
    MapPin,
    Map,
    UploadCloud,
    Plus,
    X,
    AlertCircle,
    Users,
    Clock3,
    Info,
    Image as ImageIcon,
    Send,
    FileText,
    Navigation
} from 'lucide-react';


import Navbar from '../components/Navbar';
import '../../css/BuatPengaduan.css';

const kategoriList = [
    'Jalan Rusak',
    'Drainase / Saluran Air',
    'Penerangan Jalan',
    'Sampah dan Kebersihan',
    'Jembatan Rusak',
    'Fasilitas Umum',
    'Lainnya'
];


// Nilai contoh. Sesuaikan dengan metode prioritas penelitian.
const pilihanPrioritas = {
    dampak: [
        { label: 'Gangguan ringan', skor: 10 },
        { label: 'Mengganggu aktivitas masyarakat', skor: 25 },
        { label: 'Membahayakan keselamatan', skor: 40 }
    ],
    terdampak: [
        { label: '<50 orang', skor: 10 },
        { label: '50-100 orang', skor: 20 },
        { label: '>100 orang', skor: 30 }
    ],
    urgensi: [
        { label: 'Tidak mendesak', skor: 10 },
        { label: 'Mendesak', skor: 20 },
        { label: 'Sangat mendesak', skor: 30 }
    ]
};

const initialForm = {
    kategori: '',
    judul: '',
    kecamatan: '',
    kelurahan: '',
    alamat: '',
    koordinat: '',
    deskripsi: '',
    dampak: '',
    terdampak: '',
    urgensi: ''
};

function getSkor(jenis, nilai) {
    return pilihanPrioritas[jenis]
        .find(item => item.label === nilai)?.skor || 0;
}

function getPrioritas(skor) {
    if (skor >= 70) {
        return { label: 'Prioritas Tinggi', warna: 'tinggi' };
    }
    if (skor >= 40) {
        return { label: 'Prioritas Sedang', warna: 'sedang' };
    }
    return { label: 'Prioritas Rendah', warna: 'rendah' };
}

function FormSection({ nomor, judul, children, keterangan }) {
    return (
        <section className="aduin-form-section">
            <div className="aduin-section-heading">
                <span className="aduin-section-number">{nomor}</span>
                <div>
                    <h3>{judul}</h3>
                    {keterangan && <p>{keterangan}</p>}
                </div>
            </div>
            <div className="aduin-section-body">{children}</div>
        </section>
    );
}


export default function BuatPengaduan() {

    // STATE FORMULIR
    const [form, setForm] = useState(initialForm);
    const [fotos, setFotos] = useState([]);
    const [mapOpen, setMapOpen] = useState(false);
    const [koordinatInput, setKoordinatInput] = useState('');
    const [pesan, setPesan] = useState('');

    // STATE API WILAYAH KABUPATEN JEMBER
    const [kecamatanList, setKecamatanList] = useState([]);
    const [desaList, setDesaList] = useState([]);
    const [loadingKecamatan, setLoadingKecamatan] = useState(false);
    const [loadingDesa, setLoadingDesa] = useState(false);
    const [errorWilayah, setErrorWilayah] = useState('');

    const API_WILAYAH = 'https://www.emsifa.com/api-wilayah-indonesia/api';

    const [loadingSubmit, setLoadingSubmit] = useState(false);
    
    // Lanjutkan dengan useEffect yang mengambil data kecamatan



useEffect(() => {
    const controller = new AbortController();

    const ambilKecamatan = async () => {
        setLoadingKecamatan(true);
        setErrorWilayah('');

        try {
            const response = await fetch(
                `${API_WILAYAH}/districts/3509.json`,
                { signal: controller.signal }
            );

            if (!response.ok) {
                throw new Error('Gagal mengambil data kecamatan');
            }

            const hasil = await response.json();

            setKecamatanList(
                hasil.sort((a, b) =>
                    a.name.localeCompare(b.name, 'id')
                )
            );

        } catch (error) {
            if (error.name !== 'AbortError') {
                setErrorWilayah(error.message);
            }
        } finally {
            if (!controller.signal.aborted) {
                setLoadingKecamatan(false);
            }
        }
    };

    ambilKecamatan();

    return () => controller.abort();
}, []);



    const updateForm = (name, value) => {
        setForm(prev => ({ ...prev, [name]: value }));
        setPesan('');
    };

   
    const handleKecamatan = async (e) => {
        const kecamatanId = e.target.value;

        const kecamatan = kecamatanList.find(
            item => String(item.id) === kecamatanId
        );

        setForm(prev => ({
            ...prev,
            kecamatan: kecamatan?.name || '',
            kelurahan: ''
        }));

        setDesaList([]);

        if (!kecamatanId) return;

        setLoadingDesa(true);
        setErrorWilayah('');

        try {
            const response = await fetch(
                `${API_WILAYAH}/villages/${kecamatanId}.json`
            );

            if (!response.ok) {
                throw new Error('Gagal mengambil data desa/kelurahan');
            }

            const hasil = await response.json();

            setDesaList(
                hasil.sort((a, b) =>
                    a.name.localeCompare(b.name, 'id')
                )
            );

        } catch (error) {
            setErrorWilayah(error.message);
        } finally {
            setLoadingDesa(false);
        }
    };


    
    const handleFoto = (e) => {
        const files = Array.from(e.target.files || []);
        const sisaSlot = 3 - fotos.length;

        const valid = files
            .filter(file =>
                ['image/jpeg', 'image/png'].includes(file.type) &&
                file.size <= 5 * 1024 * 1024
            )
            .slice(0, sisaSlot);

        if (valid.length !== files.length) {
            setPesan(
                'Maksimal 3 foto, format JPG/PNG, masing-masing maksimal 5 MB.'
            );
        }

        const fotoBaru = valid.map(file => ({
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            file,
            url: URL.createObjectURL(file)
        }));

        setFotos(prev => [...prev, ...fotoBaru]);

        e.target.value = '';
    };


    const hapusFoto = (id) => {
        setFotos(prev => {
            const foto = prev.find(item => item.id === id);
            if (foto) URL.revokeObjectURL(foto.url);
            return prev.filter(item => item.id !== id);
        });
    };

    // Membersihkan URL preview ketika komponen dilepas
    useEffect(() => {
        return () => {
            fotos.forEach(foto => {
                URL.revokeObjectURL(foto.url);
            });
        };
    }, [fotos]);

    const skorDampak = getSkor('dampak', form.dampak);
    const skorTerdampak = getSkor('terdampak', form.terdampak);
    const skorUrgensi = getSkor('urgensi', form.urgensi);

    const totalSkor = skorDampak + skorTerdampak + skorUrgensi;
    const prioritas = getPrioritas(totalSkor);

    const simpanKoordinat = () => {
        const parts = koordinatInput.split(',').map(v => Number(v.trim()));

        if (
            parts.length !== 2 ||
            !parts.every(Number.isFinite) ||
            Math.abs(parts[0]) > 90 ||
            Math.abs(parts[1]) > 180
        ) {
            setPesan('Masukkan koordinat yang valid, contoh: -6.92, 107.72');
            return;
        }

        updateForm('koordinat', koordinatInput.trim());
        setMapOpen(false);
    };

    const gunakanLokasiSaya = () => {
        if (!navigator.geolocation) {
            setPesan('Browser tidak mendukung fitur lokasi.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                const hasil = `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
                setKoordinatInput(hasil);
                setPesan('');
            },
            () => setPesan('Lokasi tidak dapat diakses. Periksa izin lokasi browser.')
        );
    };

    

const handleSubmit = async (e) => {
    e.preventDefault();

    if (loadingSubmit) return;

    setPesan('');

    if (fotos.length === 0) {
        setPesan('Tambahkan minimal satu foto dokumentasi.');
        return;
    }

    if (!form.dampak || !form.terdampak || !form.urgensi) {
        setPesan('Lengkapi semua parameter prioritas.');
        return;
    }

    setLoadingSubmit(true);

    try {
        // Mengambil token CSRF dari Laravel Blade
        const csrfToken = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content');

        if (!csrfToken) {
            throw new Error(
                'Token CSRF tidak ditemukan. Silakan refresh halaman.'
            );
        }

        // Siapkan data pengaduan
        const formData = new FormData();

        formData.append('kategori', form.kategori);
        formData.append('judul', form.judul);
        formData.append('kecamatan', form.kecamatan);
        formData.append('kelurahan', form.kelurahan);
        formData.append('alamat', form.alamat);
        formData.append('deskripsi', form.deskripsi);

        // Parameter penilaian prioritas
        formData.append('dampak', form.dampak);
        formData.append('terdampak', form.terdampak);
        formData.append('urgensi', form.urgensi);

        // Koordinat lokasi
        if (form.koordinat.trim()) {
            const koordinat = form.koordinat
                .split(',')
                .map(value => value.trim());

            if (koordinat.length !== 2) {
                throw new Error('Format koordinat tidak valid.');
            }

            formData.append('latitude', koordinat[0]);
            formData.append('longitude', koordinat[1]);
        }

        // Kirim foto dokumentasi
        fotos.forEach(foto => {
            formData.append('fotos[]', foto.file);
        });

        // Mengirim pengaduan ke Laravel API
        const response = await fetch('/api/pengaduan', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': csrfToken
            },
            body: formData
        });

        const contentType =
            response.headers.get('content-type') || '';

        if (!contentType.includes('application/json')) {
            const responseText = await response.text();

            console.error('Respons server:', responseText);

            throw new Error(
                `Server tidak mengembalikan JSON (HTTP ${response.status}).`
            );
        }

        const result = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error(
                    'Sesi login tidak ditemukan. Silakan login kembali.'
                );
            }

            if (response.status === 419) {
                throw new Error(
                    'Token CSRF tidak cocok dengan session Laravel. Silakan refresh halaman dan login kembali.'
                );
            }

            if (result.errors) {
                const errorPertama = Object.values(result.errors)
                    .flat()
                    .find(Boolean);

                throw new Error(
                    errorPertama ||
                    result.message ||
                    'Validasi pengaduan gagal.'
                );
            }

            throw new Error(
                result.message || 'Gagal mengirim pengaduan.'
            );
        }

        if (!result.success || !result.data?.nomor_laporan) {
            throw new Error(
                'Respons penyimpanan pengaduan tidak sesuai.'
            );
        }

        // Pengaduan berhasil disimpan
        const nomorLaporan = result.data.nomor_laporan;

        fotos.forEach(foto => {
            URL.revokeObjectURL(foto.url);
        });

        setForm(initialForm);
        setFotos([]);
        setDesaList([]);
        setKoordinatInput('');

        setPesan(
            `Pengaduan berhasil dikirim! Nomor laporan: ${nomorLaporan}`
        );

    } catch (error) {
        console.error('Error kirim pengaduan:', error);

        setPesan(
            error.message ||
            'Terjadi kesalahan saat mengirim pengaduan.'
        );

    } finally {
        setLoadingSubmit(false);
    }
};



    const handleBatal = () => {
        if (!window.confirm('Kosongkan seluruh formulir pengaduan?')) return;

        fotos.forEach(foto => URL.revokeObjectURL(foto.url));
        setFotos([]);
        setForm(initialForm);
        setPesan('');
    };

    const pilihPrioritas = (jenis, label, icon) => (
        <div className="aduin-priority-field">
            <div className={`aduin-priority-icon ${jenis}`}>{icon}</div>
            <div className="aduin-priority-input">
                <label htmlFor={jenis}>
                    {label} <span>*</span>
                </label>
                <select
                    id={jenis}
                    value={form[jenis]}
                    onChange={e => updateForm(jenis, e.target.value)}
                    required
                >
                    <option value="">Pilih {label.toLowerCase()}</option>
                    {pilihanPrioritas[jenis].map(item => (
                        <option key={item.label} value={item.label}>
                            {item.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );

    return (
        <div className="landingpage">
            <Navbar />

            <main className="aduin-pengaduan-page">
                {/* HEADER HALAMAN */}
                <header className="aduin-page-header aduin-header-full">
                    <div className="aduin-header-icon">
                        <FilePenLine size={29} />
                    </div>
                    <div>
                        <h1>Buat Pengaduan</h1>
                    </div>
                </header>
                <div className="aduin-pengaduan-grid">
                    {/* KOLOM KIRI */}
                    <div className="aduin-main-panel">
                        <form onSubmit={handleSubmit}>
                            <FormSection nomor="1" judul="Kategori Pengaduan">
                                <div className="aduin-field">
                                    <label htmlFor="kategori">Kategori <span>*</span></label>
                                    <select
                                        id="kategori"
                                        required
                                        value={form.kategori}
                                        onChange={e => updateForm('kategori', e.target.value)}
                                    >
                                        <option value="">Pilih kategori masalah</option>
                                        {kategoriList.map(item => (
                                            <option key={item}>{item}</option>
                                        ))}
                                    </select>
                                </div>
                            </FormSection>

                            <FormSection nomor="2" judul="Judul Pengaduan">
                                <div className="aduin-field">
                                    <input
                                        type="text"
                                        required
                                        maxLength={120}
                                        placeholder="Contoh: Jalan rusak di Jl. Melati"
                                        value={form.judul}
                                        onChange={e => updateForm('judul', e.target.value)}
                                    />
                                </div>
                            </FormSection>

                            <FormSection nomor="3" judul="Lokasi Kejadian">
                                <div className="aduin-location-grid">
                                    <div className="aduin-field">
                                        <label htmlFor="kecamatan">Kecamatan <span>*</span></label>
                                        <select
                                            id="kecamatan"
                                            required
                                            value={form.kecamatan === 'BALUNG' ? '3509130' : ''}
                                            onChange={handleKecamatan}
                                            disabled={loadingKecamatan}
                                        >
                                            <option value="">
                                                {loadingKecamatan ? 'Memuat kecamatan...' : 'Pilih kecamatan'}
                                            </option>

                                        {kecamatanList
                                            .filter(item => item.id === '3509130')
                                            .map(item => (
                                            <option key={item.id} value={String(item.id)}>
                                                {item.name}
                                            </option>
                                        ))}
                                        </select>
                                    </div>
                                    <div className="aduin-field">
                                        <label htmlFor="kelurahan">Kelurahan <span>*</span></label>
                                        <select
                                            id="kelurahan"
                                            required
                                            value={form.kelurahan}
                                            onChange={e => updateForm('kelurahan', e.target.value)}
                                            disabled={!form.kecamatan || loadingDesa}
                                        >
                                            <option value="">
                                                {loadingDesa ? 'Memuat desa/kelurahan...' : 'Pilih desa/kelurahan'}
                                            </option>

                                            {desaList.map(item => (
                                                <option key={item.id} value={item.name}>
                                                    {item.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="aduin-field">
                                        <label htmlFor="alamat">Alamat Lengkap <span>*</span></label>
                                        <input
                                            id="alamat"
                                            type="text"
                                            required
                                            placeholder="Contoh: Jl. Melati No. 12"
                                            value={form.alamat}
                                            onChange={e => updateForm('alamat', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="aduin-map-row">
                                    <div className="aduin-map-value">
                                        <MapPin size={18} />
                                        <span>
                                            {form.koordinat || 'Belum ada koordinat lokasi'}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        className="aduin-map-button"
                                        onClick={() => {
                                            setKoordinatInput(form.koordinat);
                                            setMapOpen(true);
                                        }}
                                    >
                                        <Map size={18} />
                                        Pilih di Peta
                                    </button>
                                </div>
                            </FormSection>

                            <FormSection nomor="4" judul="Deskripsi Masalah">
                                <div className="aduin-field">
                                    <textarea
                                        required
                                        minLength={20}
                                        maxLength={500}
                                        rows={4}
                                        placeholder="Jelaskan secara detail kondisi dan permasalahan yang terjadi..."
                                        value={form.deskripsi}
                                        onChange={e => updateForm('deskripsi', e.target.value)}
                                    />
                                    <span className="aduin-counter">
                                        {form.deskripsi.length}/500
                                    </span>
                                </div>
                            </FormSection>

                            <FormSection nomor="5" judul="Foto / Dokumentasi">
                                <div className="aduin-upload-grid">
                                    {fotos.length < 3 && (
                                        <label className="aduin-upload-box">
                                            <UploadCloud size={29} />
                                            <span>Klik untuk mengunggah foto</span>
                                            <small>atau drag file ke area ini</small>
                                            <small>(JPG, PNG, maks. 5MB)</small>
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png"
                                                multiple
                                                onChange={handleFoto}
                                                hidden
                                            />
                                        </label>
                                    )}

                                    {fotos.map(foto => (
                                        <div className="aduin-photo-preview" key={foto.id}>
                                            <img src={foto.url} alt="Dokumentasi pengaduan" />
                                            <button
                                                type="button"
                                                onClick={() => hapusFoto(foto.id)}
                                                aria-label="Hapus foto"
                                            >
                                                <X size={15} />
                                            </button>
                                        </div>
                                    ))}

                                    {Array.from({
                                        length: Math.max(0, 3 - fotos.length - 1)
                                    }).map((_, index) => (
                                        <label className="aduin-upload-empty" key={index}>
                                            <Plus size={23} />
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png"
                                                onChange={handleFoto}
                                                hidden
                                            />
                                        </label>
                                    ))}
                                </div>
                            </FormSection>

                            <FormSection
                                nomor="6"
                                judul="Parameter Prioritas"
                                keterangan="Pilih kondisi berdasarkan tingkat dampak, jumlah terdampak, dan urgensi untuk menentukan prioritas penanganan."
                            >
                                <div className="aduin-priority-grid">
                                    {pilihPrioritas(
                                        'dampak',
                                        'Dampak',
                                        <AlertCircle size={21} />
                                    )}

                                    {pilihPrioritas(
                                        'terdampak',
                                        'Jumlah Terdampak',
                                        <Users size={21} />
                                    )}

                                    {pilihPrioritas(
                                        'urgensi',
                                        'Urgensi',
                                        <Clock3 size={21} />
                                    )}
                                </div>

                                <div className="aduin-info-box">
                                    <Info size={18} />
                                    Nilai prioritas dihitung otomatis berdasarkan
                                    parameter yang dipilih.
                                </div>
                            </FormSection>

                            {pesan && (
                                <div className="aduin-form-message" role="status">
                                    <Info size={17} />
                                    {pesan}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="aduin-submit-button"
                                disabled={loadingSubmit}
                            >
                                {loadingSubmit ? (
                                    <>
                                        <Clock3 size={18} />
                                        Mengirim...
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Kirim Pengaduan
                                    </>
                                )}
                            </button>

                        </form>
                    </div>

                    {/* KOLOM KANAN */}
                    <aside className="aduin-summary-panel">
                        <h2>Ringkasan Pengaduan</h2>

                        <div className="aduin-summary-inner">
                            <div className="aduin-summary-item">
                                <div className="aduin-summary-icon">
                                    <FilePenLine size={21} />
                                </div>
                                <div>
                                    <span>Kategori</span>
                                    <strong>{form.kategori || 'Belum dipilih'}</strong>
                                    {form.judul && <small>{form.judul}</small>}
                                </div>
                            </div>

                            <div className="aduin-summary-item">
                                <div className="aduin-summary-icon">
                                    <MapPin size={21} />
                                </div>
                                <div>
                                    <span>Lokasi</span>
                                    <p>
                                        {form.alamat || 'Alamat belum diisi'}
                                        {form.kelurahan && `, Kel. ${form.kelurahan}`}
                                        {form.kecamatan && `, Kec. ${form.kecamatan}`}
                                    </p>
                                    {form.koordinat && <small>{form.koordinat}</small>}
                                </div>
                            </div>

                            <div className="aduin-summary-item">
                                <div className="aduin-summary-icon">
                                    <FileText size={21} />
                                </div>
                                <div>
                                    <span>Deskripsi</span>
                                    <p>{form.deskripsi || 'Belum ada deskripsi'}</p>
                                </div>
                            </div>

                            <div className="aduin-summary-item">
                                <div className="aduin-summary-icon">
                                    <ImageIcon size={21} />
                                </div>
                                <div>
                                    <span>Foto</span>
                                    <div className="aduin-summary-photos">
                                        {fotos.length ? fotos.map(foto => (
                                            <img
                                                key={foto.id}
                                                src={foto.url}
                                                alt="Foto laporan"
                                            />
                                        )) : (
                                            <p>Belum ada foto</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <hr />

                            <h3>Parameter Prioritas</h3>

                            <div className="aduin-parameter-list">
                                <div className="aduin-parameter-item">
                                    <AlertCircle size={21} className="danger" />
                                    <div>
                                        <span>Dampak</span>
                                        <p>{form.dampak || 'Belum dipilih'}</p>
                                    </div>
                                </div>

                                <div className="aduin-parameter-item">
                                    <Users size={21} className="people" />
                                    <div>
                                        <span>Jumlah Terdampak</span>
                                        <p>{form.terdampak || 'Belum dipilih'}</p>
                                    </div>
                                </div>

                                <div className="aduin-parameter-item">
                                    <Clock3 size={21} className="urgent" />
                                    <div>
                                        <span>Urgensi</span>
                                        <p>{form.urgensi || 'Belum dipilih'}</p>
                                    </div>
                                </div>
                            </div>

                            <hr />

                            <h3>Perhitungan Skor</h3>

                            <div className="aduin-score-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Parameter</th>
                                            <th>Kondisi</th>
                                            <th>Skor</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Dampak</td>
                                            <td>{form.dampak || '—'}</td>
                                            <td>{skorDampak}</td>
                                        </tr>
                                        <tr>
                                            <td>Jumlah Terdampak</td>
                                            <td>{form.terdampak || '—'}</td>
                                            <td>{skorTerdampak}</td>
                                        </tr>
                                        <tr>
                                            <td>Urgensi</td>
                                            <td>{form.urgensi || '—'}</td>
                                            <td>{skorUrgensi}</td>
                                        </tr>
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan="2">Total Skor</td>
                                            <td>{totalSkor}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            <hr />

                            <div className="aduin-result-box">
                                <strong>
                                    <AlertCircle size={19} />
                                    Hasil Prioritas
                                </strong>
                                <span className={`aduin-priority-badge ${prioritas.warna}`}>
                                    {prioritas.label}
                                </span>
                            </div>
                        </div>
                    </aside>

                </div>
            </main>

            {/* MODAL KOORDINAT */}
            {mapOpen && (
                <div className="aduin-modal-backdrop">
                    <div className="aduin-map-modal" role="dialog" aria-modal="true">
                        <div className="aduin-modal-header">
                            <h2><MapPin size={21} /> Tentukan Lokasi</h2>
                            <button type="button" onClick={() => setMapOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <p>
                            Buka peta untuk melihat koordinat lokasi kejadian,
                            lalu masukkan latitude dan longitude.
                        </p>

                        <a
                            href="https://www.openstreetmap.org/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="aduin-osm-link"
                        >
                            <Map size={18} /> Buka OpenStreetMap
                        </a>

                        <label htmlFor="koordinat">Koordinat (latitude, longitude)</label>
                        <input
                            id="koordinat"
                            value={koordinatInput}
                            onChange={e => setKoordinatInput(e.target.value)}
                            placeholder="-6.920000, 107.720000"
                        />

                        <button
                            type="button"
                            className="aduin-location-button"
                            onClick={gunakanLokasiSaya}
                        >
                            <Navigation size={17} /> Gunakan Lokasi Saya
                        </button>

                        <div className="aduin-modal-actions">
                            <button type="button" onClick={() => setMapOpen(false)}>
                                Tutup
                            </button>
                            <button type="button" onClick={simpanKoordinat}>
                                Simpan Lokasi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
