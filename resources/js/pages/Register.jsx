
import React, { useState } from "react";

import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
  ShieldCheck,
  Users,
  FileText,
  SearchCheck,
  House,
  LoaderCircle,
} from "lucide-react";

import "../../css/Login.css";

const logo = "/Assets/aduin-favicon.png";

export default function Register() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  async function handleSubmit(e) {
    e.preventDefault();

    if (loading) return;

    setError("");

    if (password !== passwordConfirmation) {
      setError("Konfirmasi password tidak sama.");
      return;
    }

    if (password.length < 8) {
      setError("Password minimal terdiri dari 8 karakter.");
      return;
    }

    setLoading(true);

    try {
      const csrfToken = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute("content");

      if (!csrfToken) {
        throw new Error(
          "Token keamanan tidak ditemukan. Silakan refresh halaman."
        );
      }

      const response = await fetch("/register", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRF-TOKEN": csrfToken,
        },
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim(),
          email: email.trim(),
          password,
          password_confirmation: passwordConfirmation,
        }),
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
            "Token CSRF tidak cocok. Silakan refresh halaman."
          );
        }

        if (response.status === 422) {
          const validationMessage = data.errors
            ? Object.values(data.errors).flat()[0]
            : null;

          throw new Error(
            validationMessage || data.message || "Validasi pendaftaran gagal."
          );
        }

        throw new Error(data.message || "Pendaftaran gagal.");
      }

      // Pendaftaran berhasil, arahkan ke halaman login
      window.location.href = "/login";

    } catch (err) {
      console.error("Error register:", err);
      setError(err.message || "Terjadi kesalahan saat mendaftar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="aduin-auth">

      {/* BAGIAN KIRI - BANNER ADUIN */}
      <section className="aduin-auth-visual">
        <div className="aduin-auth-visual-content">

          <a href="/" className="aduin-auth-brand">
            <div className="aduin-auth-brand-icon">
              <img src={logo} alt="Logo ADUIN" />
            </div>

            <div>
              <strong>ADUIN</strong>
              <span>
                Sistem Pengaduan Infrastruktur Lingkungan
              </span>
            </div>
          </a>

          <div className="aduin-auth-hero">

            <div className="aduin-auth-eyebrow">
              <span className="aduin-auth-pulse" />
              Bersama membangun lingkungan
            </div>

            <h1>
              Suara Anda,
              <br />
              <span>Perubahan Kita.</span>
            </h1>

            <p>
              Bergabunglah dengan ADUIN dan jadilah bagian
              dari masyarakat yang peduli terhadap kondisi
              infrastruktur lingkungan.
            </p>

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

          <div className="aduin-auth-visual-footer">
            <ShieldCheck size={17} />
            Platform pengaduan lingkungan yang aman dan transparan
          </div>

        </div>
      </section>

      {/* BAGIAN KANAN - FORM REGISTER */}
      <section className="aduin-auth-form-side">
        <div className="aduin-auth-form-wrap">

          <div className="aduin-auth-mobile-brand">
            <img src={logo} alt="Logo ADUIN" />
            <strong>ADUIN</strong>
          </div>

          <div className="aduin-auth-form-heading">

            <div className="aduin-auth-welcome-icon">
              <img
                src={logo}
                alt="Logo ADUIN"
                className="aduin-auth-welcome-logo"
              />
            </div>

            <div className="aduin-auth-kicker">
              BERGABUNG BERSAMA KAMI
            </div>

            <h2>
              <span>Buat Akun ADUIN</span>
            </h2>

            <p>
              Daftarkan akun Anda untuk mulai menyampaikan
              dan memantau pengaduan infrastruktur.
            </p>

          </div>

          {error && (
            <div className="aduin-auth-error" role="alert">
              {error}
            </div>
          )}

          <form
            className="aduin-auth-form"
            onSubmit={handleSubmit}
          >

            {/* NAMA LENGKAP */}
            <div className="aduin-auth-field">
              <label htmlFor="register-name">
                Nama Lengkap
              </label>

              <div className="aduin-auth-input-wrap">
                <UserRound size={19} />

                <input
                  id="register-name"
                  type="text"
                  placeholder="Masukkan nama lengkap Anda"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            {/* EMAIL */}
            <div className="aduin-auth-field">
              <label htmlFor="register-email">
                Alamat Email
              </label>

              <div className="aduin-auth-input-wrap">
                <Mail size={19} />

                <input
                  id="register-email"
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
              <label htmlFor="register-password">
                Password
              </label>

              <div className="aduin-auth-input-wrap">
                <LockKeyhole size={19} />

                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimal 8 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
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
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword
                    ? <EyeOff size={19} />
                    : <Eye size={19} />
                  }
                </button>
              </div>
            </div>

            {/* KONFIRMASI PASSWORD */}
            <div className="aduin-auth-field">
              <label htmlFor="register-confirm-password">
                Konfirmasi Password
              </label>

              <div className="aduin-auth-input-wrap">
                <LockKeyhole size={19} />

                <input
                  id="register-confirm-password"
                  type={showConfirmation ? "text" : "password"}
                  placeholder="Masukkan ulang password Anda"
                  value={passwordConfirmation}
                  onChange={(e) =>
                    setPasswordConfirmation(e.target.value)
                  }
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className="aduin-auth-eye"
                  aria-label={
                    showConfirmation
                      ? "Sembunyikan password"
                      : "Tampilkan password"
                  }
                  onClick={() =>
                    setShowConfirmation(!showConfirmation)
                  }
                >
                  {showConfirmation
                    ? <EyeOff size={19} />
                    : <Eye size={19} />
                  }
                </button>
              </div>
            </div>

            {/* TOMBOL REGISTER */}
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
                  Sedang mendaftar...
                </>
              ) : (
                <>
                  Daftar Akun
                  <ArrowRight size={20} />
                </>
              )}
            </button>

          </form>

          {/* LINK LOGIN */}
          <div className="aduin-auth-register">
            <div className="aduin-auth-register-icon">
              <Users size={23} />
            </div>

            <div>
              <span>Sudah memiliki akun?</span>

              <a href="/login">
                Masuk sekarang
                <ArrowRight size={16} />
              </a>
            </div>
          </div>

          <p className="aduin-auth-copyright">
            © {new Date().getFullYear()} ADUIN.
            Capstone Project UT.
          </p>

        </div>
      </section>

    </main>
  );
}
