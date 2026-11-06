
import React, { useState } from "react";

import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  FileText,
  SearchCheck,
  Users,
  House,
  ShieldCheck,
  LoaderCircle,
} from "lucide-react";

import "../../css/Login.css";

// Asset ADUIN
const logo = "/Assets/aduin-favicon.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ========================================
  // PROSES LOGIN LARAVEL SANCTUM
  // ========================================
  
async function handleSubmit(e) {
  e.preventDefault();

  if (loading) return;

  setError("");
  setLoading(true);

  try {
    // Mengambil token CSRF dari halaman Laravel Blade
    const csrfToken = document
      .querySelector('meta[name="csrf-token"]')
      ?.getAttribute("content");

    if (!csrfToken) {
      throw new Error(
        "Token keamanan tidak ditemukan. Silakan refresh halaman."
      );
    }

    // Mengirim data login ke Laravel
    const response = await fetch("/login", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "X-CSRF-TOKEN": csrfToken
      },
      body: JSON.stringify({
        email: email.trim(),
        password: password
      })
    });

    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      throw new Error(
        `Server tidak mengembalikan JSON (HTTP ${response.status}).`
      );
    }

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 419) {
        throw new Error(
          "Token CSRF tidak cocok. Silakan refresh halaman login."
        );
      }

      if (response.status === 422) {
        const pesanValidasi = data.errors
          ? Object.values(data.errors).flat()[0]
          : null;

        throw new Error(
          pesanValidasi || data.message || "Validasi login gagal."
        );
      }

      throw new Error(
        data.message || "Email atau password salah."
      );
    }

    // Login berhasil, buka beranda ADUIN
    if (data.success) {
      const role = data.user.role?.trim().toLowerCase();
      
      if (role === 'masyarakat') {
        window.location.href = '/dashboard';
      } else if (role === 'petugas') {
        window.location.href = '/dashboard-petugas';
      } else if (role === 'admin') {
        window.location.href = '/dashboard-admin';
      } else {
        setError('Role pengguna tidak dikenali.');
      }
    }

  } catch (err) {
    console.error("Error login:", err);

    setError(
      err.message || "Terjadi kesalahan saat login."
    );

  } finally {
    setLoading(false);
  }
}


  // ========================================
  // FITUR INFORMASI ADUIN
  // ========================================
  const features = [
    {
      icon: FileText,
      title: "Laporkan",
      description: "Sampaikan permasalahan di sekitar Anda.",
      color: "green",
    },
    {
      icon: SearchCheck,
      title: "Pantau",
      description: "Lihat progres penanganan pengaduan.",
      color: "blue",
    },
    {
      icon: Users,
      title: "Bersama",
      description: "Wujudkan lingkungan yang lebih baik.",
      color: "orange",
    },
  ];

  return (
    <main className="aduin-auth">

      {/* ========================================
          BAGIAN KIRI - BANNER ADUIN
      ======================================== */}
      <section className="aduin-auth-visual">

        <div className="aduin-auth-visual-content">

          {/* LOGO DAN BRAND ADUIN */}
          <a href="/" className="aduin-auth-brand">

            <div className="aduin-auth-brand-icon">
              <img
                src={logo}
                alt="Logo ADUIN"
              />
            </div>

            <div>
              <strong>ADUIN</strong>
              <span>
                Sistem Pengaduan Infrastruktur Lingkungan
              </span>
            </div>

          </a>

          {/* HERO */}
          <div className="aduin-auth-hero">

            <div className="aduin-auth-eyebrow">
              <span className="aduin-auth-pulse" />
              Bersama membangun lingkungan
            </div>

            <h1>
              Lingkungan Lebih Baik
              <br />
              Dimulai dari <span>Suara Anda.</span>
            </h1>

            <p>
              Sampaikan pengaduan infrastruktur lingkungan
              dengan mudah, cepat, dan transparan.
              Setiap laporan adalah langkah menuju perubahan.
            </p>

            {/* KARTU FITUR */}
            <div className="aduin-auth-features">

              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    className="aduin-auth-feature"
                    key={feature.title}
                  >

                    <div
                      className={`aduin-auth-feature-icon ${feature.color}`}
                    >
                      <Icon size={23} strokeWidth={2.2} />
                    </div>

                    <strong>{feature.title}</strong>

                    <p>{feature.description}</p>

                  </div>
                );
              })}

            </div>

          </div>

          {/* FOOTER BANNER */}
          <div className="aduin-auth-visual-footer">
            <ShieldCheck size={17} />
            Platform pengaduan lingkungan yang aman dan transparan
          </div>

        </div>
      </section>

      {/* ========================================
          BAGIAN KANAN - FORM LOGIN
      ======================================== */}
      <section className="aduin-auth-form-side">

        <div className="aduin-auth-form-wrap">

          {/* LOGO MOBILE */}
          <div className="aduin-auth-mobile-brand">

            <img
              src={logo}
              alt="Logo ADUIN"
            />

            <strong>ADUIN</strong>

          </div>

          {/* HEADER LOGIN */}
          <div className="aduin-auth-form-heading">

            <div className="aduin-auth-welcome-icon">
              <img
                src={logo}
                alt="Logo ADUIN"
                className="aduin-auth-welcome-logo"
              />
            </div>

            <div className="aduin-auth-kicker">
              SELAMAT DATANG DI
            </div>

            <h2>
              <span>ADUAN INFRASTRUKTUR!</span>
            </h2>

            <p>
              Masuk ke akun Anda untuk mengirim dan
              memantau perkembangan pengaduan.
            </p>

          </div>

          {/* PESAN ERROR */}
          {error && (
            <div
              className="aduin-auth-error"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* FORM LOGIN */}
          <form
            className="aduin-auth-form"
            onSubmit={handleSubmit}
          >

            {/* EMAIL */}
            <div className="aduin-auth-field">

              <label htmlFor="login-email">
                Alamat Email
              </label>

              <div className="aduin-auth-input-wrap">

                <Mail size={19} />

                <input
                  id="login-email"
                  type="email"
                  placeholder="Masukkan alamat email Anda"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />

              </div>

            </div>

            {/* PASSWORD */}
            <div className="aduin-auth-field">

              <label htmlFor="login-password">
                Password
              </label>

              <div className="aduin-auth-input-wrap">

                <LockKeyhole size={19} />

                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password Anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="aduin-auth-eye"
                  aria-label={
                    showPassword
                      ? "Sembunyikan password"
                      : "Tampilkan password"
                  }
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword
                    ? <EyeOff size={19} />
                    : <Eye size={19} />
                  }
                </button>

              </div>

            </div>

            {/* TOMBOL LOGIN */}
            <button
              type="submit"
              className="aduin-auth-submit"
              disabled={loading}
            >

              {loading ? (
                <>
                  <LoaderCircle
                    size={19}
                    className="aduin-auth-spinner"
                  />
                  Sedang masuk...
                </>
              ) : (
                <>
                  Masuk ke ADUIN
                  <ArrowRight size={20} />
                </>
              )}

            </button>

          </form>

          {/* LINK REGISTER */}
          <div className="aduin-auth-register">

            <div className="aduin-auth-register-icon">
              <Users size={23} />
            </div>

            <div>
              <span>Belum memiliki akun?</span>

              <a href="/register">
                Daftar sekarang
                <ArrowRight size={16} />
              </a>
            </div>

          </div>

          {/* COPYRIGHT */}
          <p className="aduin-auth-copyright">
            © {new Date().getFullYear()} ADUIN.
            Capstone Project UT.
          </p>

        </div>
      </section>

    </main>
  );
}
