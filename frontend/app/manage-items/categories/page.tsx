// frontend/app/manage-items/categories/page.tsx - MULTI-TENANT FIXED

"use client";

import React, { useState, useEffect } from "react";
import { FaTrash, FaPen } from "react-icons/fa";
import CategoriesModal from "./CategoriesModal";

//Import tenant-aware utilities
import { 
  apiGet, 
  apiPost, 
  apiPut, 
  apiDelete, 
  validateSession 
} from "@/utils/api";

interface Category {
  _id: string;
  name: string;
}

const CategoriesPage: React.FC = () => {
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>("");

  //Validate session on mount
  useEffect(() => {
    if (!validateSession()) {
      console.error("❌ Invalid session");
      return;
    }

    fetchCategories();
  }, []);

  //Fetch with tenant filtering (done by backend)
  const fetchCategories = async (): Promise<void> => {
    if (!validateSession()) {
      console.error("❌ Cannot fetch - invalid session");
      return;
    }

    try {
      setLoading(true);
      console.log("🔄 Fetching categories...");

      const result = await apiGet("/api/manage-items/categories/get-categories");

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch categories");
      }

      console.log("✅ Fetched categories:", result.data?.length || 0);
      setCategories(result.data || []);
    } catch (err) {
      console.error("❌ Fetch categories error:", err);
      alert(err instanceof Error ? err.message : "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  // ================= SELECT =================
  const handleSelectAll = (): void => {
    const value = !selectAll;
    setSelectAll(value);
    setSelectedRows(value ? categories.map(c => c._id) : []);
  };

  const handleSelectRow = (id: string): void => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  //Edit with tenant validation
  const handleEdit = (id: string, name: string): void => {
    setEditingId(id);
    setEditName(name);
  };

  const handleUpdate = async (id: string): Promise<void> => {
    if (!validateSession()) {
      console.error("❌ Cannot update - invalid session");
      return;
    }

    try {
      console.log("💾 Updating category:", id);

      const result = await apiPut(
        `/api/manage-items/categories/update-category/${id}`,
        { name: editName }
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to update category");
      }

      console.log("✅ Category updated successfully");
      setEditingId(null);
      setEditName("");
      fetchCategories();
    } catch (err) {
      console.error("❌ Update category error:", err);
      alert(err instanceof Error ? err.message : "Failed to update category");
    }
  };

  const handleCancel = (): void => {
    setEditingId(null);
    setEditName("");
  };

  //Delete with tenant validation
  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    if (!validateSession()) {
      console.error("❌ Cannot delete - invalid session");
      return;
    }

    try {
      console.log("🗑️ Deleting category:", id);

      const result = await apiDelete(
        `/api/manage-items/categories/delete-category/${id}`
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to delete category");
      }

      console.log("✅ Category deleted successfully");
      fetchCategories();
    } catch (err) {
      console.error("❌ Delete category error:", err);
      alert(err instanceof Error ? err.message : "Failed to delete category");
    }
  };

  const handleDeleteSelected = async (): Promise<void> => {
    if (selectedRows.length === 0) {
      alert("Please select categories to delete");
      return;
    }

    if (!confirm(`Delete ${selectedRows.length} selected category(ies)?`)) return;

    if (!validateSession()) {
      console.error("❌ Cannot delete - invalid session");
      return;
    }

    try {
      console.log("🗑️ Deleting categories:", selectedRows);

      const results = await Promise.all(
        selectedRows.map(id =>
          apiDelete(`/api/manage-items/categories/delete-category/${id}`)
        )
      );

      const failed = results.filter(r => !r.success);
      if (failed.length > 0) {
        console.error("❌ Some deletions failed:", failed);
      }

      setSelectedRows([]);
      setSelectAll(false);
      fetchCategories();
    } catch (err) {
      console.error("❌ Bulk delete error:", err);
      alert("Failed to delete categories");
    }
  };

  //Add with automatic tenant isolation
  const handleAddCategory = async (): Promise<void> => {
    if (!newCategoryName.trim()) {
      alert("Enter category name");
      return;
    }

    if (!validateSession()) {
      console.error("❌ Cannot add - invalid session");
      return;
    }

    try {
      console.log("➕ Adding category:", newCategoryName);

      const result = await apiPost(
        "/api/manage-items/categories/create-category",
        { name: newCategoryName }
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to add category");
      }

      console.log("✅ Category added successfully");
      setNewCategoryName("");
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      console.error("❌ Add category error:", err);
      alert(err instanceof Error ? err.message : "Failed to add category");
    }
  };

  // ================= FILTER =================
  const filteredCategories = categories.filter(c =>
    (c.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ================= SEARCH =================
  const handleSearch = (): void => {
    console.log("🔍 Searching for:", searchTerm);
  };

  // ================= UI =================
  return (
    <div className="bg-gray-100 min-h-screen flex justify-center items-start p-4 sm:p-6 transition-all duration-500 ease-in-out">
      <div className="bg-white w-full max-w-6xl rounded-md border border-gray-300 relative text-black">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-b border-gray-300 gap-3">
          <h2 className="text-base sm:text-lg font-semibold text-black">Categories</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#073763] hover:bg-[#042645] text-white px-4 py-2 rounded-md text-sm sm:text-base w-full sm:w-auto cursor-pointer"
          >
            Add Category
          </button>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row justify-end items-center p-4 gap-2">
          <input
            type="text"
            placeholder="Search Category"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            className="border border-gray-300 rounded-md px-3 py-2 w-full sm:w-60 focus:outline-none focus:ring-2 focus:ring-blue-300 text-black text-sm sm:text-base"
          />
          <button
            onClick={handleSearch}
            className="bg-[#2986cc] cursor-pointer hover:bg-[#0b5394] text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto"
          >
            Search
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-4">
            <p className="text-gray-500">Loading categories...</p>
          </div>
        )}

        {/* Table */}
        {!loading && (
          <div className="overflow-x-auto px-4 py-4 text-black">
            <table className="w-full text-xs sm:text-sm border-collapse border border-gray-300">
              <thead
                style={{
                  backgroundColor: "rgb(211, 214, 220)",
                  borderColor: "rgb(211, 214, 220)",
                }}
              >
                <tr className="text-black">
                  <th className="border-t border-l border-b border-gray-300 py-2 sm:py-3 px-2 sm:px-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="border-t border-b border-gray-300 py-2 sm:py-3 px-2 sm:px-4 text-left">SR. NO.</th>
                  <th className="border-t border-b border-gray-300 py-2 sm:py-3 px-2 sm:px-4 text-left font-semibold">
                    CATEGORY NAME
                  </th>
                  <th className="border-t border-b border-gray-300 py-2 sm:py-3 px-2 sm:px-3 text-center font-semibold">EDIT</th>
                  <th className="border-t border-b border-gray-300 py-2 sm:py-3 px-2 sm:px-6 text-center font-semibold">DELETE</th>
                  <th className="border-t border-r border-b border-gray-300 py-2 sm:py-3 px-2 sm:px-1 text-center font-semibold">
                    VIEW LEADS
                  </th>
                </tr>
              </thead>

              <tbody className="font-medium text-black">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((c, index) => (
                    <tr
                      key={c._id}
                      className={`hover:bg-gray-50 transition ${selectedRows.includes(c._id) ? "bg-blue-50" : ""}`}
                    >
                      <td className="py-2 sm:py-3 px-2 sm:px-4 border text-center border-gray-300">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(c._id)}
                          onChange={() => handleSelectRow(c._id)}
                        />
                      </td>

                      <td className="py-2 sm:py-3 px-2 sm:px-4 border text-left border-gray-300">
                        {index + 1}
                      </td>

                      <td className="py-2 sm:py-3 px-2 sm:px-4 border border-gray-300">
                        {editingId === c._id ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="border border-gray-300 rounded-md px-2 py-1 w-full text-black text-xs sm:text-sm"
                          />
                        ) : (
                          c.name
                        )}
                      </td>

                      <td className="py-2 sm:py-3 px-2 sm:px-3 border text-center border-gray-300">
                        {editingId === c._id ? (
                          <div className="flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
                            <button
                              onClick={() => handleUpdate(c._id)}
                              className="text-blue-600 font-semibold cursor-pointer"
                            >
                              Update
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                              onClick={handleCancel}
                              className="text-gray-600 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEdit(c._id, c.name)}
                            className="text-gray-700 hover:text-blue-600 cursor-pointer"
                          >
                            <FaPen size={14} className="sm:w-4 sm:h-4" />
                          </button>
                        )}
                      </td>

                      <td className="py-2 sm:py-3 px-2 sm:px-6 border text-center border-gray-300">
                        <button
                          onClick={() => handleDelete(c._id)}
                          className="text-red-600 hover:text-red-700 cursor-pointer"
                        >
                          <FaTrash size={14} className="sm:w-4 sm:h-4" />
                        </button>
                      </td>

                      <td className="border py-2 sm:py-3 text-center border-gray-300">
                        <button className="bg-red-500 cursor-pointer hover:bg-red-600 text-white px-2 sm:px-3 md:px-4 lg:px-5 py-1 sm:py-1.5 rounded-md text-[10px] sm:text-xs md:text-sm font-medium">
                          View Leads
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-4 sm:py-6 text-gray-500 border border-gray-300 text-black text-xs sm:text-sm"
                    >
                      No categories found
                    </td>
                  </tr>
                )}
              </tbody>

              <tfoot>
                <tr>
                  <td
                    colSpan={6}
                    className="px-2 sm:px-3 py-2 sm:py-3 text-left border-t border border-gray-300"
                  >
                    <button
                      onClick={handleDeleteSelected}
                      disabled={selectedRows.length === 0}
                      className="bg-red-600 cursor-pointer text-white px-8 sm:px-12 py-1 sm:py-1.5 rounded-md hover:bg-red-700 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Delete Selected ({selectedRows.length})
                    </button>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <CategoriesModal
        showModal={showModal}
        newCategoryName={newCategoryName}
        setNewCategoryName={setNewCategoryName}
        handleAddCategory={handleAddCategory}
        setShowModal={setShowModal}
      />
    </div>
  );
};

export default CategoriesPage;