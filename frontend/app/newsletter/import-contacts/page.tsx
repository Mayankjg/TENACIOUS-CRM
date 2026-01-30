"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';

interface ImportData {
  fileData: any[][];
  columnHeaders: any[];
  fileName: string;
}

export default function ImportContacts() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<any[][]>([]);
  const [columnHeaders, setColumnHeaders] = useState<any[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData: any[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

          if (jsonData.length > 0) {
            const headers = jsonData[0];
            const rows = jsonData.slice(1).filter(row => row.some(cell => cell));

            setColumnHeaders(headers);
            setFileData(rows);
          }
        } catch (error) {
          alert('Error reading file. Please make sure it is a valid Excel or CSV file.');
          console.error(error);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleDownload = () => {
    const csvContent = "Name,Email\nMayank Jaglaganeshwala,mayank.jwala@gmail.com\nlalu jaglaganeshwala,lalu.jwala@gmail.com";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'contacts_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleNext = () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }
    if (fileData.length === 0) {
      alert('The selected file is empty or could not be read');
      return;
    }
    
    const importData: ImportData = {
      fileData: fileData,
      columnHeaders: columnHeaders,
      fileName: selectedFile.name
    };
    
    localStorage.setItem('importFileData', JSON.stringify(importData));
    router.push('/newsletter/import-contacts/ImportContactDetail');
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setFileData([]);
    setColumnHeaders([]);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    router.push('/newsletter/contact-list');
  };

  return (
    <div className="bg-[#e5e7eb] p-0 sm:p-5 min-h-screen flex justify-center items-start font-['Segoe_UI',Tahoma,Geneva,Verdana,sans-serif]">
      <div className="bg-white w-full max-w-[1400px]">
        <div className="bg-white w-full px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-xl sm:text-2xl font-normal text-gray-700">
              Import <strong>Contacts</strong>
            </h1>
          </div>
          <hr className="-mx-4 sm:-mx-6 border-t border-gray-300 mt-4 mb-0" />
        </div>

        <div className="w-full px-4 sm:px-6 py-6 pb-8">
          <div className="max-w-4xl">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-8">
              <div className="w-full sm:w-24 flex-shrink-0">
                <span className="text-sm sm:text-base font-semibold text-gray-600">STEP 01</span>
              </div>
              <div className="flex-1">
                <h2 className="text-sm sm:text-base font-semibold text-gray-700 mb-3">
                  Ensure Your File is Formatted Properly
                </h2>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  Please review the example file to be sure your file is formatted properly. You can also download the template directly.
                  <br className="hidden sm:block" />
                  <span className="block sm:inline mt-1 sm:mt-0">Name, Email field must be fill.</span>
                </p>
                <button
                  onClick={handleDownload}
                  className="w-full sm:w-auto bg-teal-500 hover:bg-teal-600 text-white px-4 py-1.5 cursor-pointer rounded text-sm font-medium transition-colors"
                >
                  Download sample
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div className="w-full sm:w-24 flex-shrink-0">
                <span className="text-sm sm:text-base font-semibold text-gray-600">STEP 02</span>
              </div>
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 md:gap-10 lg:gap-16 xl:gap-20">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap sm:pt-2">
                    Excel File <span className="text-red-500">*</span>
                  </label>

                  <div className="flex flex-col gap-3 flex-1">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <label className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-1 rounded border border-gray-400 text-sm font-medium cursor-pointer transition-colors whitespace-nowrap">
                        Choose File
                        <input
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      <span className="text-sm text-gray-600 break-words">
                        {selectedFile ? selectedFile.name : 'No file chosen'}
                      </span>
                    </div>

                    {selectedFile && fileData.length > 0 && (
                      <p className="text-sm text-gray-500">
                        {fileData.length} rows found
                      </p>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleNext}
                        className="w-full sm:w-auto bg-[#0ea5e9] hover:bg-[#0284c7] text-white px-10 py-2 cursor-pointer rounded-sm text-sm font-medium transition-colors"
                      >
                        Next
                      </button>
                      <button
                        onClick={handleCancel}
                        className="w-full sm:w-auto bg-white hover:bg-gray-100 text-gray-700 px-10 py-2 cursor-pointer rounded-sm border border-gray-300 text-sm font-medium transition-colors"
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
    </div>
  );
}