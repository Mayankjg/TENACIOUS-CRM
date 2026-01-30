// frontend/app/manage-items/products/page.tsx - FINAL MULTI-TENANT COMPLETE

"use client";

import React, { useState, useEffect } from "react";
import { FaPen, FaTrash } from "react-icons/fa";
import ProductsTableModal from "./ProductsTableModal";

//Import tenant-aware utilities
import {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  validateSession,
} from "@/utils/api";

interface Product {
  _id?: string;
  id?: string;
  name: string;
}

const ProductsTable: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [newProduct, setNewProduct] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  //Validate session on mount
  useEffect(() => {
    if (!validateSession()) {
      console.error("❌ Invalid session in Products");
      return;
    }

    fetchProducts();
  }, []);

  //Fetch with tenant filtering (done by backend)
  const fetchProducts = async (): Promise<void> => {
    if (!validateSession()) {
      console.error("❌ Cannot fetch products - invalid session");
      return;
    }

    try {
      setLoading(true);
      console.log("🔄 Fetching products...");

      const result = await apiGet("/api/manage-items/products/get-products");

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch products");
      }

      console.log("✅ Fetched products:", result.data?.length || 0);
      setProducts(result.data || []);
    } catch (err) {
      console.error("❌ Fetch products error:", err);
      alert(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (): void => {
    if (!selectAll) {
      setSelectedRows(products.map((p) => p._id || p.id || ""));
    } else {
      setSelectedRows([]);
    }
    setSelectAll(!selectAll);
  };

  const handleRowSelect = (id: string): void => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const handleEdit = (id: string, currentName: string): void => {
    setEditingId(id);
    setEditValue(currentName);
  };

  //Update with tenant validation
  const handleUpdate = async (id: string): Promise<void> => {
    if (!validateSession()) {
      console.error("❌ Cannot update - invalid session");
      return;
    }

    try {
      console.log("💾 Updating product:", id);

      const result = await apiPut(
        `/api/manage-items/products/update-product/${id}`,
        { name: editValue }
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to update product");
      }

      console.log("✅ Product updated successfully");
      setEditingId(null);
      setEditValue("");
      fetchProducts();
    } catch (err) {
      console.error("❌ Update product error:", err);
      alert(err instanceof Error ? err.message : "Failed to update product");
    }
  };

  const handleCancel = (): void => {
    setEditingId(null);
    setEditValue("");
  };

  //Delete with tenant validation
  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    if (!validateSession()) {
      console.error("❌ Cannot delete - invalid session");
      return;
    }

    try {
      console.log("🗑️ Deleting product:", id);

      const result = await apiDelete(
        `/api/manage-items/products/delete-product/${id}`
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to delete product");
      }

      console.log("✅ Product deleted successfully");
      fetchProducts();
    } catch (err) {
      console.error("❌ Delete product error:", err);
      alert(err instanceof Error ? err.message : "Failed to delete product");
    }
  };

  const handleDeleteSelected = async (): Promise<void> => {
    if (selectedRows.length === 0) {
      alert("Please select products to delete");
      return;
    }

    if (!confirm(`Delete ${selectedRows.length} selected product(s)?`)) return;

    if (!validateSession()) {
      console.error("❌ Cannot delete - invalid session");
      return;
    }

    try {
      console.log("🗑️ Deleting products:", selectedRows);

      const results = await Promise.all(
        selectedRows.map((id) =>
          apiDelete(`/api/manage-items/products/delete-product/${id}`)
        )
      );

      const failed = results.filter((r) => !r.success);
      if (failed.length > 0) {
        console.error("❌ Some deletions failed:", failed);
      }

      setSelectedRows([]);
      setSelectAll(false);
      fetchProducts();
    } catch (err) {
      console.error("❌ Delete selected error:", err);
      alert("Failed to delete products");
    }
  };

  //Add with automatic tenant isolation
  const handleSaveProduct = async (): Promise<void> => {
    if (!newProduct.trim()) {
      alert("Please enter a product name");
      return;
    }

    if (!validateSession()) {
      console.error("❌ Cannot add product - invalid session");
      return;
    }

    try {
      console.log("➕ Adding product:", newProduct);

      const result = await apiPost("/api/manage-items/products/create-product", {
        name: newProduct,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to add product");
      }

      console.log("✅ Product added successfully");
      setNewProduct("");
      setShowPopup(false);
      fetchProducts();
    } catch (err) {
      console.error("❌ Add product error:", err);
      alert(err instanceof Error ? err.message : "Failed to add product");
    }
  };

  const handleSearch = (): void => {
    console.log("🔍 Searching for:", searchTerm);
  };

  const filteredProducts = products.filter((p) =>
    (p.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-100 min-h-screen flex justify-center items-start p-4 sm:p-6 transition-all duration-500 ease-in-out">
      <div className="bg-white w-full max-w-6xl rounded-md shadow-md border border-gray-300 relative text-black">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-b border-gray-300 gap-3">
          <h2 className="text-base sm:text-lg font-semibold text-black">
            Products
          </h2>
          <button
            onClick={() => setShowPopup(true)}
            className="bg-[#073763] cursor-pointer hover:bg-[#042645] text-white px-4 py-2 rounded-md text-sm sm:text-base w-full sm:w-auto"
          >
            Add Product
          </button>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row justify-end items-center p-4 gap-2">
          <input
            type="text"
            placeholder="Search Product"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
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
            <p className="text-gray-500">Loading products...</p>
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
                  <th className="border-t border-b border-gray-300 py-2 sm:py-3 px-2 sm:px-4 text-left">
                    SR. NO.
                  </th>
                  <th className="border-t border-b border-gray-300 py-2 sm:py-3 px-2 sm:px-4 text-left font-semibold">
                    PRODUCT NAME
                  </th>
                  <th className="border-t border-b border-gray-300 py-2 sm:py-3 px-2 sm:px-3 text-center font-semibold">
                    EDIT
                  </th>
                  <th className="border-t border-b border-gray-300 py-2 sm:py-3 px-2 sm:px-6 text-center font-semibold">
                    DELETE
                  </th>
                  <th className="border-t border-r border-b border-gray-300 py-2 sm:py-3 px-2 sm:px-1 text-center font-semibold">
                    VIEW LEADS
                  </th>
                </tr>
              </thead>

              <tbody className="font-medium text-black">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((p, index) => {
                    const id = p._id || p.id || "";
                    return (
                      <tr
                        key={id}
                        className={`hover:bg-gray-50 transition ${
                          selectedRows.includes(id) ? "bg-blue-50" : ""
                        }`}
                      >
                        <td className="py-2 sm:py-3 px-2 sm:px-4 border text-center border-gray-300">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(id)}
                            onChange={() => handleRowSelect(id)}
                          />
                        </td>

                        <td className="py-2 sm:py-3 px-2 sm:px-4 border text-left border-gray-300">
                          {index + 1}
                        </td>

                        <td className="py-2 sm:py-3 px-2 sm:px-4 border border-gray-300">
                          {editingId === id ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="border border-gray-300 rounded-md px-2 py-1 w-full text-black text-xs sm:text-sm"
                            />
                          ) : (
                            p.name
                          )}
                        </td>

                        <td className="py-2 sm:py-3 px-2 sm:px-3 border text-center border-gray-300">
                          {editingId === id ? (
                            <div className="flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
                              <button
                                onClick={() => handleUpdate(id)}
                                className="text-blue-600 cursor-pointer font-semibold"
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
                              onClick={() => handleEdit(id, p.name)}
                              className="text-gray-700 cursor-pointer hover:text-blue-600"
                            >
                              <FaPen size={14} className="sm:w-4 sm:h-4" />
                            </button>
                          )}
                        </td>

                        <td className="py-2 sm:py-3 px-2 sm:px-6 border text-center border-gray-300">
                          <button
                            onClick={() => handleDelete(id)}
                            className="text-red-600 cursor-pointer hover:text-red-700"
                          >
                            <FaTrash size={14} className="sm:w-4 sm:h-4" />
                          </button>
                        </td>

                        <td className="border py-2 sm:py-3 text-center border-gray-300">
                          <button className="bg-red-500 cursor-pointer hover:bg-red-600 text-white px-2 sm:px-3 md:px-4 lg:px-5 py-1 sm:py-1.5 rounded-md text-[10px] sm:text-xs md:text-sm font-medium shadow-sm">
                            View Leads
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-4 sm:py-6 text-gray-500 border border-gray-300 text-black text-xs sm:text-sm"
                    >
                      No products found
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

      <ProductsTableModal
        showPopup={showPopup}
        newProduct={newProduct}
        setNewProduct={setNewProduct}
        handleSaveProduct={handleSaveProduct}
        setShowPopup={setShowPopup}
      />
    </div>
  );
};

export default ProductsTable;