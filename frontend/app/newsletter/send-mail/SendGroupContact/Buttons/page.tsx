// frontend/app/newsletter/send-mail/SendGroupContact/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface TemplateData {
    content: string;
    subject: string;
    selectedProduct: string;
    selectedEmail: string;
    templateId: string;
    templateName: string;
}

interface Contact {
    id: number;
    name: string;
    email: string;
    product: string;
    fromEmail?: string;
}

export default function ButtonPage() {
    const router = useRouter();
    const [totalRecipients, setTotalRecipients] = useState<number>(0);
    const [remainingEmails] = useState<number>(0);
    const [showPreview, setShowPreview] = useState<boolean>(false);
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null);

    useEffect(() => {
        const templateData = localStorage.getItem('selectedTemplateData');
        if (templateData) {
            try {
                const parsed: TemplateData = JSON.parse(templateData);
                setSelectedTemplate(parsed);
            } catch (e) {
                console.error('Error parsing template:', e);
            }
        }

        const savedContacts = localStorage.getItem('contacts');
        if (savedContacts) {
            try {
                const contacts: Contact[] = JSON.parse(savedContacts);
                setTotalRecipients(contacts.length);
            } catch (e) {
                console.error('Error parsing contacts:', e);
            }
        }
    }, []);

    const handleSend = (): void => {
        if (!selectedTemplate?.content) return alert('No template content found. Please go back and select a template.');
        if (totalRecipients === 0) return alert('No recipients found. Please add contacts first.');
        localStorage.setItem('mailSentSuccess', 'true');
        router.push('/newsletter/send-mail');
    };

    const handlePreview = (): void => {
        if (!selectedTemplate?.content) return alert('No template selected. Please go back to Custom Message and select a template.');
        setShowPreview(true);
    };

    return (
        <div>
            <style>{`.preview-content{font-family:Arial,sans-serif;
            line-height:1.6;color:#000}
           .preview-content p,.preview-content h1,
           .preview-content h2,.preview-content h3,
           .preview-content h4,.preview-content h5,
           .preview-content h6,.preview-content span,
           .preview-content div,.preview-content li,
           .preview-content strong,.preview-content em,
           .preview-content u{color:black!important}

           .preview-content table{border-collapse:collapse;width:100%;margin:10px 0}
           .preview-content table td,.preview-content table th{border:1px solid #ddd;padding:8px}`}</style>

            {showPreview && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-300 flex items-center justify-between bg-gradient-to-r from-cyan-50 to-blue-50">
                            <h2 className="text-xl font-bold text-gray-800">Email Preview</h2>
                            <button onClick={() => setShowPreview(false)} className="text-gray-500 hover:text-gray-700 text-3xl font-bold leading-none hover:bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center transition-colors" title="Close">×</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                            <div className="bg-white rounded-lg shadow-sm p-6 preview-content">
                                {selectedTemplate?.content ? (
                                    <div dangerouslySetInnerHTML={{ __html: selectedTemplate.content }} />
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-gray-400 text-lg">⚠️ No template content available</p>
                                        <p className="text-gray-500 text-sm mt-2">Please go back and select a template</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-300 flex justify-end gap-3 bg-gray-50">
                            <button onClick={() => setShowPreview(false)} className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded focus:outline-none transition-colors cursor-pointer">Close</button>
                        </div>
                    </div>
                </div>
            )}

            <div className='bg-[#e5e9ec] p-0 sm:p-5 h-screen overflow-y-auto flex justify-center items-start font-["Segoe_UI",Tahoma,Geneva,Verdana,sans-serif]'>
                <div className='bg-white w-full border max-w-[1400px]'>
                    <div className='bg-white w-full px-4 sm:px-6 py-4'>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <h1 className="text-2xl sm:text-3xl font-normal text-gray-600">
                                Total email <strong className="font-semibold text-gray-700">recipients ({totalRecipients})</strong>
                            </h1>
                            <div className="bg-[#a0522d] text-white px-5 py-2 rounded shadow-md flex items-center gap-3">
                                <span className="font-medium text-base">Remaining Emails:</span>
                                <span className="font-bold text-xl">{remainingEmails}</span>
                            </div>
                        </div>
                        <hr className="-mx-4 sm:-mx-6 border-t border-gray-300 mt-4 mb-0" />
                    </div>

                    <div className='w-full px-4 sm:px-6 py-8 pb-8'>
                        <div className='w-full'>
                            <div className='mb-8'>
                                <h2 className='text-[20px] font-normal text-gray-800 mb-6'>
                                    We will deliver this email to <strong className="font-semibold">({totalRecipients}) recipients</strong>
                                </h2>
                                <div className='space-y-3 text-base text-red-500'>
                                
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 mt-8">
                                <button onClick={handleSend} className="px-8 py-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-medium text-base rounded shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer">
                                    Send</button>
                                <button onClick={handlePreview} className="px-8 py-2 bg-[#ef4444] hover:bg-[#dc2626] text-white font-medium text-base rounded shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 cursor-pointer">
                                    Preview</button>
                                <button onClick={() => router.back()} className="px-8 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium text-base rounded border border-gray-300 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer">
                                    Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}