// frontend/app/newsletter/send-mail/SendGroupContact/page.tsx
"use client";

import { useState, useEffect, ChangeEvent } from 'react';
import * as XLSX from 'xlsx';

interface TemplateData {
    content: string;
    subject: string;
    selectedProduct: string;
    selectedEmail: string;
    templateId: string;
    templateName: string;
}

interface Recipient {
    name: string;
    email: string;
    fromEmail: string;
}

export default function SendGroupContact() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [totalRecipients, setTotalRecipients] = useState<number>(0);
    const [remainingEmails] = useState<number>(0);
    const [fileData, setFileData] = useState<unknown[][]>([]);
    const [columnHeaders, setColumnHeaders] = useState<unknown[]>([]);
    const [selectedEmail, setSelectedEmail] = useState<string>('');

    useEffect(() => {
        const templateData = localStorage.getItem('selectedTemplateData');
        if (templateData) {
            try {
                const parsed: TemplateData = JSON.parse(templateData);
                setSelectedEmail(parsed.selectedEmail || '');
            } catch (e) {
                console.error('Error parsing template:', e);
            }
        }
    }, []);

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);

            const reader = new FileReader();
            reader.onload = (event: ProgressEvent<FileReader>) => {
                try {
                    if (!event.target?.result) return;

                    const data = new Uint8Array(event.target.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as unknown[][];

                    if (jsonData.length > 0) {
                        const headers = jsonData[0];
                        const rows = jsonData.slice(1).filter(row => row.some(cell => cell));

                        setColumnHeaders(headers);
                        setFileData(rows);
                        
                        const nameIndex = headers.findIndex(h =>
                            h && h.toString().toLowerCase().includes('name')
                        );
                        const emailIndex = headers.findIndex(h =>
                            h && h.toString().toLowerCase().includes('email')
                        );

                        const validCount = rows.filter(row => {
                            return row[nameIndex] && row[emailIndex];
                        }).length;

                        setTotalRecipients(validCount);
                    }
                } catch (error) {
                    alert('Error reading file. Please make sure it is a valid Excel or CSV file.');
                    console.error(error);
                }
            };
            reader.readAsArrayBuffer(file);
        }
    };

    const handleUpload = (): void => {
        if (!selectedFile) {
            alert('Please select an Excel file first');
            return;
        }

        if (fileData.length === 0) {
            alert('The selected file is empty or could not be read');
            return;
        }

        const nameIndex = columnHeaders.findIndex(h =>
            h && h.toString().toLowerCase().includes('name')
        );
        const emailIndex = columnHeaders.findIndex(h =>
            h && h.toString().toLowerCase().includes('email')
        );

        const validRecipients: Recipient[] = fileData.filter(row => {
            return row[nameIndex] && row[emailIndex];
        }).map(row => ({
            name: row[nameIndex] as string,
            email: row[emailIndex] as string,
            fromEmail: selectedEmail
        }));

        setTotalRecipients(validRecipients.length);

        localStorage.setItem('contacts', JSON.stringify(validRecipients));

        alert(`File uploaded successfully! Found ${validRecipients.length} valid recipients.`);
        
        window.location.href = '/newsletter/send-mail/SendGroupContact/Buttons';
    };

    const handleDownloadSample = (): void => {
        const csvContent = "Name,Email\nMayank Jaglaganeshwala,mayank.jwala@gmail.com\nLalu Jaglaganeshwala,lalu.jwala@gmail.com";
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

    return (
        <div className="bg-[#e5e7eb] p-0 sm:p-5 min-h-screen flex justify-center items-start font-['Segoe_UI',Tahoma,Geneva,Verdana,sans-serif]">
            <div className="bg-white w-full max-w-[1400px]">
                <div className="bg-white w-full px-4 sm:px-6 py-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h1 className="text-xl sm:text-2xl font-normal text-gray-700">
                            Send <strong className="font-semibold">Mail</strong>
                        </h1>
                        <div className="bg-[#a0522d] text-white px-5 py-2 rounded shadow-md flex items-center gap-3">
                            <span className="font-medium text-sm sm:text-base">Remaining Emails:</span>
                            <span className="font-bold text-base sm:text-xl">{remainingEmails}</span>
                        </div>
                    </div>
                    <hr className="-mx-4 sm:-mx-6 border-t border-gray-300 mt-4 mb-0" />
                </div>

                <div className="w-full px-4 sm:px-6 py-6 pb-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                        <div>
                            <div className="mb-6">
                                <label className="block text-base font-normal text-gray-700 mb-3">
                                    Excel File <span className="text-red-500">*</span> :
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="file"
                                        accept=".xlsx,.xls,.csv"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="excel-file-input"
                                    />
                                    <label
                                        htmlFor="excel-file-input"
                                        className="bg-gray-200 hover:bg-gray-300 border border-gray-400 text-gray-700 px-4 py-1.5 rounded cursor-pointer transition-colors text-sm font-medium"
                                    >
                                        Choose File
                                    </label>
                                    <span className="text-sm text-gray-600 break-words">
                                        {selectedFile ? selectedFile.name : 'No file chosen'}
                                    </span>
                                </div>
                                <p className="text-sm text-red-500 mt-3">
                                    ( Field Name: Name and Email )
                                </p>
                            </div>

                            <button
                                onClick={handleUpload}
                                className="bg-sky-400 hover:bg-sky-500 text-white font-medium px-7 py-1.5 rounded text-base transition-colors focus:outline-none cursor-pointer"
                            >
                                Upload
                            </button>
                        </div>

                        <div>
                            <h2 className="text-lg sm:text-xl font-normal text-gray-700 mb-6">
                                Total email <span className="font-normal">Recipients ({totalRecipients})</span>
                            </h2>

                            <h3 className="font-semibold text-gray-700 mb-3">Ensure your file is formatted properly</h3>
                            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                                Please review the example file to be sure your file is formatted properly. You can also download the sample file.
                            </p>
                            <button
                                onClick={handleDownloadSample}
                                className="bg-teal-500 hover:bg-teal-600 text-white font-medium px-6 py-2 rounded text-sm transition-colors cursor-pointer"
                            >
                                Download sample
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}