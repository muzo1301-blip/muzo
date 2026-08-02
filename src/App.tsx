import { useEffect, useState } from "react";

type BankAccount = {
  id: number;
  bankName: string;
  iban: string;
};

type ProfileData = {
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  location: string;
  banks: BankAccount[];
};

const defaultProfile: ProfileData = {
  phone: "0534 969 03 91",
  whatsapp: "905349690391",
  email: "",
  instagram: "",
  location: "",
  banks: [
    {
      id: 1,
      bankName: "İş Bankası",
      iban: "TR370006400000143730182793",
    },
    {
      id: 2,
      bankName: "Yapı Kredi",
      iban: "TR320006701000000034209676",
    },
  ],
};

function App() {
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [activeTab, setActiveTab] = useState<
    "profile" | "banks" | "preview"
  >("profile");
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    const savedProfile = localStorage.getItem("muzo-profile");

    if (!savedProfile) return;

    try {
      setProfile(JSON.parse(savedProfile) as ProfileData);
    } catch {
      localStorage.removeItem("muzo-profile");
    }
  }, []);

  const saveProfile = () => {
    localStorage.setItem("muzo-profile", JSON.stringify(profile));
    setSavedMessage("Bilgiler kaydedildi.");

    window.setTimeout(() => {
      setSavedMessage("");
    }, 2500);
  };

  const addBank = () => {
    setProfile((current) => ({
      ...current,
      banks: [
        ...current.banks,
        {
          id: Date.now(),
          bankName: "",
          iban: "",
        },
      ],
    }));
  };

  const updateBank = (
    id: number,
    field: "bankName" | "iban",
    value: string,
  ) => {
    setProfile((current) => ({
      ...current,
      banks: current.banks.map((bank) =>
        bank.id === id ? { ...bank, [field]: value } : bank,
      ),
    }));
  };

  const removeBank = (id: number) => {
    setProfile((current) => ({
      ...current,
      banks: current.banks.filter((bank) => bank.id !== id),
    }));
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="border-b border-neutral-800 bg-black/70 px-5 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.35em] text-amber-400">
              MUZO
            </p>
            <h1 className="mt-1 text-xl font-semibold">
              Smart Card Yönetim Paneli
            </h1>
          </div>

          <div className="rounded-full border border-green-900 bg-green-950/50 px-3 py-1 text-xs text-green-400">
            ● Sistem aktif
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-5 py-6 lg:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-3xl border border-neutral-800 bg-neutral-900 p-3">
          <nav className="space-y-2">
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`w-full rounded-2xl px-4 py-3 text-left ${
                activeTab === "profile"
                  ? "bg-amber-500 font-semibold text-black"
                  : "text-neutral-300 hover:bg-neutral-800"
              }`}
            >
              Profil bilgileri
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("banks")}
              className={`w-full rounded-2xl px-4 py-3 text-left ${
                activeTab === "banks"
                  ? "bg-amber-500 font-semibold text-black"
                  : "text-neutral-300 hover:bg-neutral-800"
              }`}
            >
              Banka hesapları
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`w-full rounded-2xl px-4 py-3 text-left ${
                activeTab === "preview"
                  ? "bg-amber-500 font-semibold text-black"
                  : "text-neutral-300 hover:bg-neutral-800"
              }`}
            >
              Profil ön izlemesi
            </button>
          </nav>
        </aside>

        <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 sm:p-7">
          {activeTab === "profile" && (
            <div>
              <div className="mb-7">
                <p className="text-sm text-amber-400">Profil ayarları</p>
                <h2 className="mt-1 text-2xl font-semibold">
                  İletişim bilgileri
                </h2>
                <p className="mt-2 text-sm text-neutral-400">
                  Kartın yönlendirdiği sayfadaki iletişim bilgilerini düzenle.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <InputField
                  label="Telefon numarası"
                  value={profile.phone}
                  onChange={(value) =>
                    setProfile({ ...profile, phone: value })
                  }
                  placeholder="0534 969 03 91"
                />

                <InputField
                  label="WhatsApp numarası"
                  value={profile.whatsapp}
                  onChange={(value) =>
                    setProfile({ ...profile, whatsapp: value })
                  }
                  placeholder="905349690391"
                />

                <InputField
                  label="E-posta"
                  value={profile.email}
                  onChange={(value) =>
                    setProfile({ ...profile, email: value })
                  }
                  placeholder="ornek@email.com"
                />

                <InputField
                  label="Instagram bağlantısı"
                  value={profile.instagram}
                  onChange={(value) =>
                    setProfile({ ...profile, instagram: value })
                  }
                  placeholder="https://instagram.com/..."
                />

                <div className="md:col-span-2">
                  <InputField
                    label="Konum bağlantısı"
                    value={profile.location}
                    onChange={(value) =>
                      setProfile({ ...profile, location: value })
                    }
                    placeholder="Google Haritalar bağlantısı"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "banks" && (
            <div>
              <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-amber-400">Ödeme bilgileri</p>
                  <h2 className="mt-1 text-2xl font-semibold">
                    Banka hesapları
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={addBank}
                  className="rounded-2xl bg-amber-500 px-4 py-3 font-semibold text-black hover:bg-amber-400"
                >
                  + Yeni banka ekle
                </button>
              </div>

              <div className="space-y-4">
                {profile.banks.map((bank) => (
                  <article
                    key={bank.id}
                    className="rounded-2xl border border-neutral-700 bg-neutral-950 p-4"
                  >
                    <div className="grid gap-4 md:grid-cols-[1fr_2fr_auto] md:items-end">
                      <InputField
                        label="Banka adı"
                        value={bank.bankName}
                        onChange={(value) =>
                          updateBank(bank.id, "bankName", value)
                        }
                        placeholder="Banka adı"
                      />

                      <InputField
                        label="IBAN"
                        value={bank.iban}
                        onChange={(value) =>
                          updateBank(bank.id, "iban", value.toUpperCase())
                        }
                        placeholder="TR..."
                      />

                      <button
                        type="button"
                        onClick={() => removeBank(bank.id)}
                        className="h-12 rounded-xl border border-red-900 bg-red-950/40 px-4 text-red-400 hover:bg-red-950"
                      >
                        Sil
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {activeTab === "preview" && (
            <div>
              <div className="mb-7">
                <p className="text-sm text-amber-400">Canlı ön izleme</p>
                <h2 className="mt-1 text-2xl font-semibold">
                  Ziyaretçinin göreceği profil
                </h2>
              </div>

              <div className="mx-auto max-w-sm rounded-[32px] border border-neutral-700 bg-black p-5 shadow-2xl">
                <div className="rounded-[26px] border border-neutral-800 bg-gradient-to-b from-neutral-800 to-black p-7 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-amber-500/50 bg-neutral-900 text-4xl">
                    🦅
                  </div>

                  <h3 className="mt-4 text-3xl font-semibold tracking-[0.25em] text-amber-400">
                    MUZO
                  </h3>

                  <p className="mt-2 text-xs tracking-[0.25em] text-neutral-400">
                    PREMIUM SMART CARD
                  </p>
                </div>

                <div className="mt-4 space-y-3">
                  <PreviewButton label="Ara" value={profile.phone} />
                  <PreviewButton label="WhatsApp" value={profile.whatsapp} />
                  <PreviewButton
                    label="Ödeme Yap"
                    value={`${profile.banks.length} banka hesabı`}
                  />

                  {profile.email && (
                    <PreviewButton label="E-posta" value={profile.email} />
                  )}

                  {profile.instagram && (
                    <PreviewButton
                      label="Instagram"
                      value={profile.instagram}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between border-t border-neutral-800 pt-5">
            <p className="text-sm text-green-400">{savedMessage}</p>

            <button
              type="button"
              onClick={saveProfile}
              className="rounded-2xl bg-amber-500 px-6 py-3 font-semibold text-black hover:bg-amber-400"
            >
              Değişiklikleri kaydet
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

type InputFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
};

function InputField({
  label,
  value,
  placeholder,
  onChange,
}: InputFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-neutral-300">{label}</span>

      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 text-white outline-none transition focus:border-amber-500"
      />
    </label>
  );
}

function PreviewButton({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 px-4 py-3">
      <p className="font-semibold">{label}</p>
      <p className="mt-1 truncate text-xs text-neutral-400">{value}</p>
    </div>
  );
}

export default App;
