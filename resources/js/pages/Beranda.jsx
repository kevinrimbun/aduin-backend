import Navbar from "../components/Navbar";

import { PenLine, Search, History, Info, MapPin } from "lucide-react";

import "../../css/LandingPage.css";

const banner = "/Assets/banner.jpg";

const Beranda = () => {
    return (
        <div className="landingpage">
            {/* =====================================================
                NAVBAR
            ====================================================== */}

            <Navbar />

            {/* =====================================================
                BANNER SECTION
            ====================================================== */}

            <section className="banner-section">
                <div
                    className="banner-background"
                    style={{
                        backgroundImage: `url(${banner})`,
                    }}
                >
                    <div className="banner-overlay"></div>

                    <div className="banner-content">
                        <h1>
                            Bersama Kita Wujudkan
                            <br />
                            Lingkungan yang Lebih Baik
                        </h1>

                        <p>
                            Laporkan permasalahan infrastruktur lingkungan di
                            sekitar Anda
                            <br />
                            secara mudah, cepat dan transparan.
                        </p>
                    </div>
                </div>

                {/* QUICK MENU */}
                <div className="quick-menu">
                    {/* Buat Pengaduan */}
                    <a href="/pengaduan" className="quick-menu-item">
                        <div className="quick-icon blue">
                            <PenLine size={32} />
                        </div>

                        <h3>Buat Pengaduan</h3>

                        <p>
                            Laporkan masalah infrastruktur lingkungan secara
                            online
                        </p>
                    </a>

                    {/* Cek Status */}
                    <a href="/status" className="quick-menu-item">
                        <div className="quick-icon green">
                            <Search size={32} />
                        </div>

                        <h3>Cek Status</h3>

                        <p>Pantau perkembangan laporan Anda</p>
                    </a>

                    {/* Riwayat */}
                    <a href="/riwayat" className="quick-menu-item">
                        <div className="quick-icon orange">
                            <History size={32} />
                        </div>

                        <h3>Riwayat</h3>

                        <p>Lihat laporan dari pengaduan masyarakat</p>
                    </a>

                    {/* Peta Pengaduan */}
                    <a href="/peta" className="quick-menu-item">
                        <div className="quick-icon red">
                            <MapPin size={32} />    
                        </div>

                        <h3>Peta Pengaduan</h3>

                        <p>Lihat sebaran pengaduan pada peta</p>
                    </a>
                </div>
            </section>
        </div>
    );
};

export default Beranda;
