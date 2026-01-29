"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TemplatesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [selectedTemplates, setSelectedTemplates] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    const savedTemplates = JSON.parse(localStorage.getItem("emailTemplates") || "[]");
    setTemplates(savedTemplates);
    setFilteredTemplates(savedTemplates);
  }, []);

  const handleSearch = () => {
    const filtered = search.trim() 
      ? templates.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
      : templates;
    setFilteredTemplates(filtered);
  };

  const handleSelectAll = (e) => {
    setSelectAll(e.target.checked);
    setSelectedTemplates(e.target.checked ? filteredTemplates.map(t => t.id) : []);
  };

  const handleSelectTemplate = (id) => {
    setSelectedTemplates(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const updateTemplates = (updatedTemplates) => {
    setTemplates(updatedTemplates);
    setFilteredTemplates(updatedTemplates.filter(t => 
      !search.trim() || t.name.toLowerCase().includes(search.toLowerCase())
    ));
    localStorage.setItem("emailTemplates", JSON.stringify(updatedTemplates));
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this template?")) {
      updateTemplates(templates.filter(t => t.id !== id));
      setSelectedTemplates(prev => prev.filter(t => t !== id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedTemplates.length === 0) return alert("Please select templates to delete");
    if (confirm(`Are you sure you want to delete ${selectedTemplates.length} template(s)?`)) {
      updateTemplates(templates.filter(t => !selectedTemplates.includes(t.id)));
      setSelectedTemplates([]);
      setSelectAll(false);
    }
  };

  const handleView = (template) => {
    const previewWindow = window.open('', '_blank', 'width=800,height=600');
    previewWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${template.name} - Preview</title>
          <style>body { margin: 20px; font-family: Arial, sans-serif; } h1 { color: #333; }</style>
        </head>
        <body><h1>${template.name}</h1>${template.content}</body>
      </html>
    `);
    previewWindow.document.close();
  };

  const handleEdit = (template) => {
    localStorage.setItem("editingTemplate", JSON.stringify(template));
    router.push(`/newsletter/templates/AddCustomTemplate?edit=${template.id}`);
  };

  const ActionButton = ({ onClick, className, children }) => (
    <button onClick={onClick} className={`w-full sm:w-auto px-5 py-2.5 rounded transition-colors text-base ${className}`}>
      {children}
    </button>
  );

  const TableButton = ({ onClick, color, children }) => (
    <button onClick={onClick} className={`bg-${color}-500 hover:bg-${color}-600 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors`}>
      {children}
    </button>
  );

  return (
    <>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .preview-image {
          width: 64px;
          height: 64px;
          object-fit: cover;
          border-radius: 4px;
          border: 1px solid #d1d5db;
        }
      `}</style>
      <div className="bg-[#e5e7eb] p-0 sm:p-5 min-h-screen flex justify-center items-start font-['Segoe_UI',Tahoma,Geneva,Verdana,sans-serif]">
        <div className="bg-white w-full max-w-[1400px]">
          <div className="bg-white w-full px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h1 className="text-xl sm:text-2xl font-normal text-gray-700">
                <strong>Templates</strong>
              </h1>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto"> 
                {selectedTemplates.length > 0 && (
                  <ActionButton onClick={handleBulkDelete} className="bg-red-500 hover:bg-red-600 text-white">
                    Delete Selected ({selectedTemplates.length})
                  </ActionButton>
                )}
                <ActionButton 
                  onClick={() => router.push("/newsletter/templates/AddCustomTemplate")}
                  className="bg-[#2d4456] hover:bg-[#1f2f3d] text-white"
                >
                  Add Custom Template
                </ActionButton>
                <ActionButton 
                  onClick={() => router.push("/newsletter/templates/AddTemplate")}
                  className="bg-[#2d4456] hover:bg-[#1f2f3d] text-white"
                >
                  Add Template
                </ActionButton>
              </div>
            </div>
            <hr className="-mx-4 sm:-mx-6 border-t border-gray-300 mt-4 mb-0" />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center px-4 sm:px-6 gap-2 mb-6 sm:justify-end">
            <input
              type="text"
              placeholder="Template Name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full sm:w-[200px] text-black h-10 border border-gray-300 rounded-[5px] px-5 py-2 text-base sm:text-[18px] focus:outline-none focus:ring-1 focus:ring-black"
            />
            <button 
              onClick={handleSearch}
              className="bg-[#0baad1] w-full sm:w-[70px] h-10 text-white px-2 py-1 text-base sm:text-[18px] font-medium rounded-[5px] hover:bg-[#0094b8] transition-colors"
            >
              Search
            </button>
          </div>

          <div className="w-full px-2 sm:px-6 pb-6">
            <div className="hidden md:block border border-gray-200 rounded">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#dee2e6] border-b border-gray-200">
                    <th className="py-3 px-4 text-left w-12">
                      <input type="checkbox" className="w-4 h-4 cursor-pointer" checked={selectAll} onChange={handleSelectAll} />
                    </th>
                    {["SR NO", "TEMPLATE NAME", "PRODUCT NAME", "PREVIEW IMAGE", "TYPE", "VIEW", "DELETE", "EDIT"].map(header => (
                      <th key={header} className="py-3 px-4 text-center text-xs font-semibold text-[#6c757d] uppercase tracking-wider whitespace-nowrap">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {filteredTemplates.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center py-8 text-red-500 text-base font-medium">No Record Found</td>
                    </tr>
                  ) : (
                    filteredTemplates.map((template, index) => (
                      <tr key={template.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-left">
                          <input type="checkbox" className="w-4 h-4 cursor-pointer" 
                            checked={selectedTemplates.includes(template.id)} 
                            onChange={() => handleSelectTemplate(template.id)} 
                          />
                        </td>
                        <td className="py-3 px-4 text-center text-sm text-gray-700">{index + 1}</td>
                        <td className="py-3 px-4 text-center text-sm text-gray-700">{template.name}</td>
                        <td className="py-3 px-4 text-center text-sm text-gray-700">{template.product || "N/A"}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center">
                            {template.previewImage ? (
                              <img 
                                src={template.previewImage} 
                                alt={template.name}
                                className="preview-image"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 rounded border border-gray-300 flex items-center justify-center text-xs text-gray-500">
                                No Image
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            template.isCustom ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                          }`}>
                            {template.isCustom ? "Custom" : "System"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <TableButton onClick={() => handleView(template)} color="blue">View</TableButton>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <TableButton onClick={() => handleDelete(template.id)} color="red">Delete</TableButton>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <TableButton onClick={() => handleEdit(template)} color="yellow">Edit</TableButton>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-8 text-red-500 text-base font-medium">No Record Found</div>
              ) : (
                filteredTemplates.map((template, index) => (
                  <div key={template.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 cursor-pointer mt-1" 
                          checked={selectedTemplates.includes(template.id)} 
                          onChange={() => handleSelectTemplate(template.id)} 
                        />
                        <div>
                          <div className="text-xs text-gray-500 mb-1">SR NO: {index + 1}</div>
                          <div className="font-semibold text-gray-800">{template.name}</div>
                        </div>
                      </div>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        template.isCustom ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                      }`}>
                        {template.isCustom ? "Custom" : "System"}
                      </span>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Product:</span>
                        <span className="text-gray-800">{template.product || "N/A"}</span>
                      </div>
                      <div className="flex justify-center py-2">
                        {template.previewImage ? (
                          <img 
                            src={template.previewImage} 
                            alt={template.name}
                            className="w-20 h-20 object-cover rounded border border-gray-300"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-200 rounded border border-gray-300 flex items-center justify-center text-xs text-gray-500">
                            No Image
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-gray-200">
                      <TableButton onClick={() => handleView(template)} color="blue">View</TableButton>
                      <TableButton onClick={() => handleEdit(template)} color="yellow">Edit</TableButton>
                      <TableButton onClick={() => handleDelete(template.id)} color="red">Delete</TableButton>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}