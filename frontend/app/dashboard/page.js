"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import axios from "axios";
import SalesSummary from "./SalesSummary";

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState({
    leads: { pending: 0, closed: 0, open: 0, today: 0 },
    salesPersons: [],
    contacts: { total: 0 },
    configuration: { balanceEmail: 0 },
  });
  const [loading, setLoading] = useState(true);

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://two9-01-2026.onrender.com";

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all leads
      const leadsRes = await axios.get(`${API_BASE}/api/leads/get-leads`);
      const allLeads = Array.isArray(leadsRes.data)
        ? leadsRes.data
        : leadsRes.data?.data || [];

      // Calculate lead statistics
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const leadStats = {
        pending: allLeads.filter((l) => l.leadStatus === "Pending").length,
        closed: allLeads.filter((l) => l.leadStatus === "Closed").length,
        open: allLeads.filter((l) => l.leadStatus === "Open").length,
        today: allLeads.filter((l) => {
          const createdDate = new Date(l.createdAt);
          createdDate.setHours(0, 0, 0, 0);
          return createdDate.getTime() === today.getTime();
        }).length,
      };

      // Fetch salespersons (admin only)
      let salesPersonsData = [];
      if (user.role === "admin") {
        const spRes = await axios.get(
          `${API_BASE}/api/salespersons/get-salespersons`
        );
        const salespersons = Array.isArray(spRes.data) ? spRes.data : [];

        // Calculate stats for each salesperson
        salesPersonsData = salespersons.map((sp) => {
          const spLeads = allLeads.filter(
            (lead) =>
              lead.salesperson === sp.username ||
              lead.createdBy === sp.id ||
              lead.testerSalesman === sp.username
          );

          const todayLeads = spLeads.filter((l) => {
            const createdDate = new Date(l.createdAt);
            createdDate.setHours(0, 0, 0, 0);
            return createdDate.getTime() === today.getTime();
          });

          return {
            id: sp.id || sp._id,
            name: sp.username,
            today: todayLeads.length,
            all: spLeads.length,
            missed: spLeads.filter((l) => l.leadStatus === "Miss").length,
            unscheduled: spLeads.filter(
              (l) =>
                l.leadStatus === "Unscheduled" || l.category === "Unscheduled"
            ).length,
            closed: spLeads.filter((l) => l.leadStatus === "Closed").length,
            void: spLeads.filter((l) => l.leadStatus === "Void").length,
          };
        });
      }

      setDashboardData({
        leads: leadStats,
        salesPersons: salesPersonsData,
        contacts: { total: 0 },
        configuration: { balanceEmail: 455 },
      });
    } catch (error) {
      console.error("❌ Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Navigate to LeadsPage with query parameter to open CreateLead form
  const handleAddLead = () => {
    router.push("/leads/leadpage?action=addLead");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#e5e9ec] p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const { leads, salesPersons, contacts, configuration } = dashboardData;

  return (
    <div className="min-h-screen bg-[#e5e9ec] p-2 sm:p-4 transition-all duration-500 ease-in-out">
      {/* Header */}
      <div className="bg-white py-2 px-3 md:px-4 rounded shadow w-full md:w-[75%] mb-6 mt-3">
        <p className="text-green-700 text-[11.5px] font-semibold leading-[1.4]">
          Welcome to{" "}
          <span className="font-bold text-green-800">Tenacious Sales</span>.
          Please check/set your time zone for better use. Contact us for any
          HELP at
          <span className="font-bold text-green-800">
            {" "}
            contact@tenacioustechies.com
          </span>
          .
        </p>
      </div>

      {/* Dashboard Cards */}
      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-1
          md:grid-cols-2
          lg:grid-cols-3
          xl:grid-cols-4
          gap-4
          md:gap-6
          mb-10
        "
      >
        {/* Leads Card */}
        <div className="bg-teal-500 text-white rounded shadow p-4 hover:shadow-lg transition w-full">
          <h2 className="font-bold text-sm mb-3 tracking-wide uppercase">
            Leads
          </h2>

          <div className="grid grid-cols-4 text-xs divide-x divide-black/30">
            {/* Today */}
            <div className="pr-2">
              <p className="font-medium">Today</p>
              <p className="text-base font-bold">{leads.today}</p>
            </div>

            {/* Pending */}
            <div className="px-2">
              <p className="font-medium">Pending</p>
              <p className="text-base font-bold">{leads.pending}</p>
            </div>

            {/* Closed */}
            <div className="px-2">
              <p className="font-medium">Closed</p>
              <p className="text-base font-bold">{leads.closed}</p>
            </div>

            {/* Open */}
            <div className="pl-2">
              <p className="font-medium">Open</p>
              <p className="text-base font-bold">{leads.open}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={handleAddLead}
              className="bg-white text-[#666] px-3 py-1.5 rounded text-xs font-semibold hover:bg-gray-200 cursor-pointer"
            >
              ADD LEAD
            </button>
            <button
              onClick={() => router.push("/leads/leadpage")}
              className="bg-white text-[#666] px-3 py-1.5 rounded text-xs font-semibold hover:bg-gray-200 cursor-pointer"
            >
              MORE
            </button>
          </div>
        </div>

        {/* Paid Leads */}
        <div className="bg-sky-600 text-white rounded shadow p-4 hover:shadow-lg transition w-full">
          <h2 className="font-bold text-sm mb-3 tracking-wide uppercase">
            Total Salespersons
          </h2>

          <div className="flex items-stretch">
            <div className="pr-4 flex flex-col justify-between py-1">
              <p className="text-xs font-medium">Active</p>
              <p className="text-xl font-bold">{salesPersons.length}</p>
            </div>

            <div className="w-px bg-white/40"></div>

            <div className="w-1/2 pl-4 flex flex-col justify-between py-1">
              <p className="text-xs font-medium">Total Leads</p>
              <p className="text-xl font-bold">
                {salesPersons.reduce((sum, sp) => sum + sp.all, 0)}
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/manage-salespersons/salesperson-list")}
            className="bg-white text-black px-3 py-1 mt-4 rounded text-xs font-semibold hover:bg-gray-200 cursor-pointer"
          >
            VIEW ALL
          </button>
        </div>

        {/* Configuration */}
        <div className="bg-purple-600 text-white rounded shadow p-4 hover:shadow-lg transition w-full">
          <h2 className="font-bold text-sm mb-3 tracking-wide uppercase">
            Configuration
          </h2>
          <p className="text-xs">Balance Email</p>
          <p className="text-base font-bold">{configuration.balanceEmail}</p>
          <button className="bg-white text-[#666] px-3 py-1 mt-3 rounded text-xs font-semibold hover:bg-gray-200 cursor-pointer">
            SEND MAIL
          </button>
        </div>

        {/* Contacts */}
        <div className="bg-red-500 text-white rounded shadow p-4 hover:shadow-lg transition w-full">
          <h2 className="font-bold text-sm mb-3 tracking-wide uppercase">
            Quick Stats
          </h2>
          <p className="text-xs">Total Categories</p>
          <p className="text-base font-bold mb-2">-</p>
          <p className="text-xs">Total Products</p>
          <p className="text-base font-bold">-</p>
          <button
            onClick={() => router.push("/manage-items/categories")}
            className="bg-white text-black px-3 py-1 mt-3 rounded text-xs font-semibold hover:bg-gray-200 cursor-pointer"
          >
            MANAGE
          </button>
        </div>
      </div>

      {/* Salesperson Summary */}
      {user?.role === "admin" && (
        <SalesSummary
          salesPersons={salesPersons}
          onRefresh={fetchDashboardData}
        />
      )}
    </div>
  );
}