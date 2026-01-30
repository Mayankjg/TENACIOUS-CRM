"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Product {
  id: number;
  name: string;
}

interface ImportData {
  fileData: string[][];
  columnHeaders: string[];
  fileName: string;
}

interface NewContact {
  id: number;
  name: string;
  email: string;
  product: string;
}

export default function ImportContactDetail() {
  const router = useRouter();
  const [fileData, setFileData] = useState<string[][]>([]);
  const [columnHeaders, setColumnHeaders] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [nameColumnIndex, setNameColumnIndex] = useState<string>("");
  const [emailColumnIndex, setEmailColumnIndex] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const importData = localStorage.getItem('importFileData');
    if (importData) {
      const data: ImportData = JSON.parse(importData);
      setFileData(data.fileData || []);
      setColumnHeaders(data.columnHeaders || []);
    }

    const savedProducts = JSON.parse(localStorage.getItem("products") || "[]");
    setProducts(savedProducts);
  }, [router]);

  const handleSave = () => {
    if (!selectedProduct) {
      alert('Please select a product');
      return;
    }
    if (!nameColumnIndex) {
      alert('Please select First Name field');
      return;
    }
    if (!emailColumnIndex) {
      alert('Please select Email field');
      return;
    }

    const newContacts: NewContact[] = fileData.map((row, index) => {
      const name = row[parseInt(nameColumnIndex)] || '';
      const email = row[parseInt(emailColumnIndex)] || '';

      return {
        id: Date.now() + index,
        name: name.toString().trim(),
        email: email.toString().trim(),
        product: selectedProduct
      };
    }).filter(contact => contact.name && contact.email);

    if (newContacts.length === 0) {
      alert('No valid contacts found in the selected columns');
      return;
    }

    const existingContacts = JSON.parse(localStorage.getItem('contacts') || '[]');
    const allContacts = [...existingContacts, ...newContacts];
    localStorage.setItem('contacts', JSON.stringify(allContacts));

    localStorage.removeItem('importFileData');

    alert(`${newContacts.length} contacts imported successfully!`);
    router.push('/newsletter/contact-list');
  };

  const handleCancel = () => {
    localStorage.removeItem('importFileData');
    router.push('/newsletter/contact-list');
  };

  return (
    <div className="bg-[#e5e7eb] p-0 sm:p-5 min-h-screen flex justify-center items-start font-['Segoe_UI',Tahoma,Geneva,Verdana,sans-serif]">
      <div className="bg-white w-full max-w-[1400px]">
        <div className="bg-white w-full px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-xl sm:text-2xl font-normal text-gray-700">
              <strong>Import Contact Detail</strong>
            </h1>
          </div>
          <hr className="-mx-4 sm:-mx-6 border-t border-gray-300 mt-4 mb-0" />
        </div>

        <div className="w-full px-4 sm:px-6 py-6 pb-8">
          <div className="max-w-3xl">
            <h2 className="text-lg sm:text-xl font-normal text-gray-700 mb-3">
              Contact <strong>Import</strong>
            </h2>
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">
                Adjust field names with the appropriate column names of the source file that you import.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                First Name, Email field must be fill.
              </p>

              <div className="mb-6">
                <span className="text-sm sm:text-base font-semibold text-gray-600 block mb-4">
                  STEP 01
                </span>

                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap sm:w-32">
                      Select Product <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      className="w-full sm:flex-1 border border-gray-300 rounded-md px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring hover:bg-gray-100 focus:border-transparent"
                    >
                      <option value="">Select Products</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.name}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap sm:w-32">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={nameColumnIndex}
                      onChange={(e) => setNameColumnIndex(e.target.value)}
                      className="w-full sm:flex-1 border border-gray-300 rounded-md px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring hover:bg-gray-100 focus:border-transparent"
                    >
                      <option value="">None</option>
                      {columnHeaders.map((header, index) => (
                        <option key={index} value={index}>
                          {header} (col: {String.fromCharCode(65 + index)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap sm:w-32">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={emailColumnIndex}
                      onChange={(e) => setEmailColumnIndex(e.target.value)}
                      className="w-full sm:flex-1 border border-gray-300 rounded-md px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring hover:bg-gray-100 focus:border-transparent"
                    >
                      <option value="">None</option>
                      {columnHeaders.map((header, index) => (
                        <option key={index} value={index}>
                          {header} (col: {String.fromCharCode(65 + index)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2 sm:ml-[152px]">
                    <button
                      onClick={handleSave}
                      className="w-full sm:w-auto bg-[#0ea5e9] hover:bg-[#0284c7] text-white px-12 py-2.5 rounded-md text-sm font-medium transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="w-full sm:w-auto bg-gray-300 hover:bg-gray-400 text-gray-700 px-12 py-2.5 rounded-md text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}