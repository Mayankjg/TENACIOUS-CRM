"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface SignupForm {
  username: string;
  email: string;
  password: string;
  country: string;
  countryCode: string;
  contactNo: string;
  promoCode: string;
  role: string;
}

interface Country {
  name: string;
  callingCode: string;
  displayName: string;
}

export default function Signup() {
  const router = useRouter();
  const { signupUser } = useAuth();

  const [form, setForm] = useState<SignupForm>({
    username: "",
    email: "",
    password: "",
    country: "",
    countryCode: "",
    contactNo: "",
    promoCode: "",
    role: "admin", // forced admin
  });

  // 🔥 DYNAMIC COUNTRIES STATE
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);

  // 🔥 FETCH COUNTRIES FROM REST API
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,idd"
        );
        const data = await response.json();

        const formattedCountries: Country[] = data
          .map((country: any) => {
            const name = country.name?.common || "";
            const root = country.idd?.root || "";
            const suffixes = country.idd?.suffixes || [];

            let callingCode = "";
            if (root) {
              callingCode = suffixes.length > 0 ? `${root}${suffixes[0]}` : root;
            }

            return {
              name,
              callingCode,
              displayName: callingCode ? `${name} (${callingCode})` : name,
            };
          })
          .filter((c: Country) => c.name && c.callingCode)
          .sort((a: Country, b: Country) => a.name.localeCompare(b.name));

        setCountries(formattedCountries);
        setLoadingCountries(false);
      } catch (error) {
        console.error("❌ Error fetching countries:", error);
        setLoadingCountries(false);
      }
    };

    fetchCountries();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 🔥 HANDLE COUNTRY CHANGE - AUTO POPULATE COUNTRY CODE
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const selectedCountryName = e.target.value;
    const selectedCountry = countries.find((c) => c.name === selectedCountryName);
    const callingCode = selectedCountry?.callingCode || "";

    setForm((prev) => ({
      ...prev,
      country: selectedCountryName,
      countryCode: callingCode, // Auto-populate country code
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    try {
      // Force role to admin on the backend as well
      const payload = { ...form, role: "admin" };
      await signupUser(payload);
      alert("Signup Successful!");
      router.push("/login");
    } catch (err: any) {
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center h-screen bg-cover bg-center transition-all duration-500 p-0 m-0"
      style={{
        backgroundImage: "url('../images/signup-bg.jpg')",
      }}
    >
      <div className="bg-white/95 p-6 sm:p-10 rounded-xl shadow-2xl w-[95%] sm:w-[750px] text-black">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-8 text-center text-gray-800">
          Sign Up Now! Tenacious Sales
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username + Email */}
          <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-4 sm:space-y-0">
            <div className="w-full sm:w-1/2">
              <label className="block text-gray-700 mb-1 font-medium">
                Username
              </label>
              <input
                name="username"
                placeholder="Enter username"
                required
                onChange={handleChange}
                className="w-full border p-3 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="w-full sm:w-1/2">
              <label className="block text-gray-700 mb-1 font-medium">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="Enter email"
                onChange={handleChange}
                className="w-full border p-3 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Password + Country */}
          <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-4 sm:space-y-0">
            <div className="w-full sm:w-1/2">
              <label className="block text-gray-700 mb-1 font-medium">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                placeholder="Enter password"
                onChange={handleChange}
                className="w-full border p-3 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 🔥 DYNAMIC COUNTRY DROPDOWN */}
            <div className="w-full sm:w-1/2">
              <label className="block text-gray-700 mb-1 font-medium">
                Select Country
              </label>
              <select
                name="country"
                required
                value={form.country}
                onChange={handleCountryChange}
                disabled={loadingCountries}
                className="w-full border p-3 rounded-md outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="">
                  {loadingCountries ? "Loading countries..." : "Select Country"}
                </option>
                {countries.map((country) => (
                  <option key={country.name} value={country.name}>
                    {country.displayName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Code + Contact + Promo */}
          <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-4 sm:space-y-0">
            <div className="w-full sm:w-1/2 flex space-x-4">
              {/* 🔥 DISABLED COUNTRY CODE FIELD */}
              <div className="w-1/3">
                <label className="block text-gray-700 mb-1 font-medium">
                  Code
                </label>
                <input
                  name="countryCode"
                  value={form.countryCode}
                  placeholder="+91"
                  required
                  disabled // 👈 Cannot edit (auto-populated)
                  className="w-full border p-3 rounded-md bg-gray-100 cursor-not-allowed outline-none"
                />
              </div>

              <div className="w-2/3">
                <label className="block text-gray-700 mb-1 font-medium">
                  Contact No
                </label>
                <input
                  name="contactNo"
                  required
                  placeholder="Enter contact no"
                  onChange={handleChange}
                  className="w-full border p-3 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="w-full sm:w-1/2">
              <label className="block text-gray-700 mb-1 font-medium">
                Promo Code
              </label>
              <input
                name="promoCode"
                placeholder="Enter promo code"
                onChange={handleChange}
                className="w-full border p-3 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-start items-center space-y-4 sm:space-y-0 sm:space-x-6 mt-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-8 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Save
            </button>

            <Link
              href="/login"
              className="text-sm text-gray-700 hover:text-blue-600"
            >
              Already have an account?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}