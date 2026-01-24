"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState, ChangeEvent } from "react";
import { Mail, Phone, Briefcase, Trash2, Key } from "lucide-react";

import NewPasswordModal from "./NewPasswordModal";
import ChangeEmailModal from "./ChangeEmailModal";

interface Salesperson {
  id: string;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  designation: string;
  contact: string;
  profileImage?: string;
}

export default function SalespersonCard() {
  const router = useRouter();

  const [salespersons, setSalespersons] = useState<Salesperson[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

  const API_BASE = "https://tt-crm-pro.onrender.com/api";

  // FETCH FROM BACKEND
  useEffect(() => {
    const fetchList = async (): Promise<void> => {
      try {
        const res = await fetch(`${API_BASE}/salespersons/get-salespersons`);
        const data = await res.json();
        setSalespersons(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchList();
  }, []);

  // DELETE SP
  const deleteSP = async (id: string): Promise<void> => {
    if (!confirm("Delete this salesperson?")) return;

    try {
      await fetch(`${API_BASE}/salespersons/delete-salesperson/${id}`, {
        method: "DELETE",
      });

      setSalespersons((prev) => prev.filter((sp) => sp.id !== id));
    } catch (error) {
      console.log(error);
    }
  };

  const resolveImageSrc = (profileImage?: string): string => {
    if (!profileImage)
      return `${API_BASE.replace(/\/api$/, "")}/uploads/default-avatar.png`;

    if (/^https?:\/\//i.test(profileImage)) return profileImage;

    if (profileImage.startsWith("/uploads")) {
      return `${API_BASE.replace(/\/api$/, "")}${profileImage}`;
    }

    return profileImage;
  };

  const filtered = searchQuery
    ? salespersons.filter(
        (sp) =>
          (sp.username || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (sp.email || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : salespersons;

  return (
    <div className="bg-[#f9fafb] p-5 min-h-[80vh] flex justify-center">
      {/* PASSWORD MODAL */}
      {isModalOpen && selectedId && (
        <NewPasswordModal
          salespersonId={selectedId}
          onClose={() => setIsModalOpen(false)}
          onPasswordChange={async (id: string, newPass: string) => {
            try {
              await fetch(`${API_BASE}/salespersons/update-salesperson-password/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newPassword: newPass }),
              });
              alert("Password Updated!");
            } catch (e) {
              console.log(e);
            }
          }}
        />
      )}

      {/* EMAIL MODAL */}
      {isEmailModalOpen && selectedEmailId && (
        <ChangeEmailModal
          salespersonId={selectedEmailId}
          onClose={() => setIsEmailModalOpen(false)}
          onEmailChange={async (id: string, email: string) => {
            try {
              const res = await fetch(`${API_BASE}/salespersons/update-salesperson-email/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
              });

              const updated = await res.json();

              setSalespersons((prev) =>
                prev.map((sp) =>
                  sp.id === id ? { ...sp, email: updated.email } : sp
                )
              );
            } catch (e) {
              console.log(e);
            }
          }}
        />
      )}

      <div className="bg-white w-full max-w-[1400px] border border-black text-black">
        {/* HEADER */}
        <div className="py-4">
          <div className="px-6">
            <div className="flex flex-col md:flex-row justify-between gap-3 md:items-center">
              <h2 className="text-2xl text-gray-700">
                Salesperson <strong>List</strong>
              </h2>

              <button
                onClick={() =>
                  router.push(
                    "/manage-salespersons/salesperson-list/managesalesperson/add"
                  )
                }
                className="bg-[#374151] cursor-pointer hover:bg-[#1f2937] text-white px-5 py-2.5 rounded"
              >
                Add Sales Person
              </button>
            </div>
          </div>

          <hr className="border-gray-300 mt-4" />
        </div>

        {/* SEARCH BAR */}
        <div className="flex flex-col md:flex-row justify-end px-6 mb-4 gap-2">
          <input
            type="text"
            placeholder="Search"
            className="border border-gray-300 px-3 py-2 w-full md:w-[200px] rounded-md outline-none focus:border-gray-400"
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          />

          <button className="bg-[#18a3dd] text-white px-4 py-2 rounded-md hover:bg-[#1095cc]">
            Search
          </button>
        </div>

        {/* LIST */}
        {filtered.length === 0 ? (
          <p className="text-center py-10 text-gray-500">
            No Salespersons Found
          </p>
        ) : (
          <div className="px-6 grid gap-3 pb-6">
            {filtered.map((sp) => {
              const imageSrc = resolveImageSrc(sp.profileImage);

              return (
                <div
                  key={sp.id}
                  className="p-4 bg-white border rounded-lg hover:bg-gray-50 shadow-sm"
                >
                  <div className="flex gap-4">
                    {/* LEFT - Image */}
                    <img
                      src={imageSrc || "/default-avatar.png"}
                      className="w-16 h-20 border rounded object-cover flex-shrink-0"
                      alt={sp.username || "salesperson"}
                    />

                    {/* MIDDLE - Info Grid */}
                    <div className="flex-1 min-w-0">
                      {/* Row 1: Username */}
                      <div className="mb-2">
                        <h3 className="text-base font-bold text-gray-800">
                          {sp.username}
                        </h3>
                      </div>

                      {/* Row 2: First Name | Designation | Delete | View Leads */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 mb-2">
                        <div className="text-sm text-gray-600 md:col-span-3">
                          {sp.firstname} {sp.lastname}
                        </div>

                        <div className="flex items-center gap-2 md:col-span-4">
                          <Briefcase className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700 truncate">
                            Designation: <strong className="text-gray-900">{sp.designation}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-2 md:col-span-2">
                          <button
                            onClick={() => deleteSP(sp.id)}
                            className="flex cursor-pointer items-center gap-1.5 text-sm text-red-600 hover:text-red-800 transition-colors whitespace-nowrap"
                          >
                            <Trash2 className="w-4 h-4 flex-shrink-0" />
                            Delete
                          </button>
                        </div>

                        <div className="flex items-center justify-end md:col-span-3">
                          <button className="bg-red-500 cursor-pointer text-white text-sm px-4 py-1.5 rounded hover:bg-red-600 transition-colors whitespace-nowrap">
                            View Leads
                          </button>
                        </div>
                      </div>

                      {/* Row 3: Email | Contact | Change Password | Change Email ID */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4">
                        <div className="flex items-center gap-1.5 min-w-0 md:col-span-3">
                          <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <a
                            href={`mailto:${sp.email}`}
                            className="text-sm text-blue-500 hover:text-blue-700 truncate"
                            title={sp.email}
                          >
                            {sp.email}
                          </a>
                        </div>

                        <div className="flex items-center gap-2 md:col-span-4">
                          <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700 truncate">
                            Contact: <strong className="text-gray-900">{sp.contact}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-2 md:col-span-2">
                          <button
                            onClick={() => {
                              setSelectedId(sp.id);
                              setIsModalOpen(true);
                            }}
                            className="flex cursor-pointer items-center gap-1.5 text-sm text-blue-700 hover:text-blue-900 transition-colors whitespace-nowrap"
                          >
                            <Key className="w-4 h-4 flex-shrink-0" />
                            <span className="whitespace-nowrap">Change Password</span>
                          </button>
                        </div>

                        <div className="flex items-center justify-end md:col-span-3">
                          <button
                            onClick={() => {
                              setSelectedEmailId(sp.id);
                              setIsEmailModalOpen(true);
                            }}
                            className="bg-[#2b3342] cursor-pointer text-white text-sm px-4 py-1.5 rounded hover:bg-[#1f2937] transition-colors whitespace-nowrap"
                          >
                            Change Email ID
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}