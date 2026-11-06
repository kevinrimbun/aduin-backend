const [laporan, setLaporan] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const laporanId = window.location.pathname.split("/").pop();

useEffect(() => {
    const ambilData = async () => {
        try {
            const response = await fetch(`/api/pengaduan/${laporanId}`, {
                method: "GET",
                credentials: "same-origin",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Gagal mengambil laporan.");
            }

            setLaporan(result.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (laporanId) {
        ambilData();
    } else {
        setError("ID laporan tidak ditemukan.");
        setLoading(false);
    }
}, [laporanId]);