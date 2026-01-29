// frontend/app/leadpage/ActivityHistoryPage/email/EmailSection.js

"use client";
import { useState, useRef, useEffect } from "react";
import { Trash2, ChevronDown, X, Paperclip } from "lucide-react";
import axios from "axios";

const API_URL = "https://tenacious-techies-crm-01.onrender.com/api";

const defaultTemplate = {
  id: "default-1",
  name: "Choose Template",
  content: "<p>Hello, this is a follow-up email.</p>",
  isCustom: false
};

export default function EmailSection({ leadId, leadEmail }) {
  const quillRef = useRef(null);
  const editorContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  const [emailLogs, setEmailLogs] = useState([]);
  const [templates, setTemplates] = useState([defaultTemplate]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [subject, setSubject] = useState("");
  const [from, setFrom] = useState("");
  const [fromEmails, setFromEmails] = useState(["sujit@gmail.com", "magan@gmail.com"]);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [toEmail, setToEmail] = useState(leadEmail || "");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [newEmailField, setNewEmailField] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templateVisibility, setTemplateVisibility] = useState("admin");
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [showSourceCode, setShowSourceCode] = useState(false);
  const [sourceCode, setSourceCode] = useState("");
  const [isSending, setIsSending] = useState(false);

  // NEW: Attachment state
  const [attachments, setAttachments] = useState([]);
  const [uploadError, setUploadError] = useState("");

  // Update toEmail when leadEmail changes
  useEffect(() => {
    if (leadEmail) {
      setToEmail(leadEmail);
    }
  }, [leadEmail]);

  // Get current user's email
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setFrom(user.email || "");
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Fetch emails from backend
  useEffect(() => {
    if (leadId) {
      fetchEmails();
    }
  }, [leadId]);

  const fetchEmails = async () => {
    try {
      const token = localStorage.getItem("ts-token");

      if (!token) {
        console.error("❌ No auth token found");
        return;
      }

      console.log("🔄 Fetching emails for lead:", leadId);

      const response = await axios.get(
        `${API_URL}/emails/lead/${leadId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );

      if (response.data.success) {
        const formattedEmails = response.data.data.map(email => ({
          id: email._id,
          from: email.from,
          to: email.to,
          subject: email.subject,
          message: email.message,
          status: email.status,
          attachmentCount: email.attachments?.length || 0,
          date: new Date(email.createdAt).toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));

        setEmailLogs(formattedEmails);
        console.log(`Loaded ${formattedEmails.length} emails`);
      }
    } catch (error) {
      console.error("❌ Error fetching emails:", error);

      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
      }
    }
  };

  // Load Quill editor
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://cdn.quilljs.com/1.3.6/quill.snow.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://cdn.quilljs.com/1.3.6/quill.js';
    script.onload = () => {
      if (window.Quill && !quillRef.current) {
        quillRef.current = new window.Quill('#editor', {
          theme: 'snow',
          placeholder: 'Write your message here...',
          modules: {
            toolbar: [
              [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
              [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ 'color': [] }, { 'background': [] }],
              [{ 'script': 'sub' }, { 'script': 'super' }],
              [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
              [{ 'direction': 'rtl' }, { 'align': [] }],
              ['blockquote', 'code-block'],
              ['link', 'image', 'video', 'formula'],
              ['clean']
            ]
          }
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  // Load templates
  useEffect(() => {
    const loadData = () => {
      try {
        const savedTemplates = JSON.parse(localStorage.getItem("emailTemplates") || "[]");
        setTemplates([defaultTemplate, ...savedTemplates.filter(t => t?.id && t?.name)]);

        const savedEmails = JSON.parse(localStorage.getItem("fromEmails") || "[]");
        if (savedEmails.length > 0) {
          setFromEmails([...new Set([...fromEmails, ...savedEmails])]);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadData();
  }, []);

  // AUTO-REFRESH FOR PENDING EMAILS
  useEffect(() => {
    if (!leadId) return;

    const interval = setInterval(() => {
      const hasPending = emailLogs.some(email => email.status === "Pending");
      if (hasPending) {
        console.log("🔄 Auto-refreshing pending emails...");
        fetchEmails();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [leadId, emailLogs]);

  // NEW: Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setUploadError("");

    // Validate files
    const maxFileSize = 4 * 1024 * 1024; // 4MB
    const maxTotalSize = 12 * 1024 * 1024; // 12MB
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    // Check individual file size and type
    for (const file of files) {
      if (file.size > maxFileSize) {
        setUploadError(`File "${file.name}" exceeds 4MB limit`);
        return;
      }
      if (!allowedTypes.includes(file.type)) {
        setUploadError(`File "${file.name}" type not allowed`);
        return;
      }
    }

    // Check total size
    const currentSize = attachments.reduce((sum, f) => sum + f.size, 0);
    const newSize = files.reduce((sum, f) => sum + f.size, 0);
    if (currentSize + newSize > maxTotalSize) {
      setUploadError("Total file size exceeds 12MB limit");
      return;
    }

    setAttachments(prev => [...prev, ...files]);
    e.target.value = ""; // Reset input
  };

  // NEW: Remove attachment
  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // NEW: Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleMenuClick = (menu) => setOpenMenu(openMenu === menu ? null : menu);

  const handleFileAction = (action) => {
    if (action === 'new' && window.confirm('Create new message? Unsaved changes will be lost.') && quillRef.current) {
      quillRef.current.setContents([]);
      setAttachments([]);
    } else if (action === 'print') {
      const content = quillRef.current?.root.innerHTML || '';
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`<html><head><title>Print Email</title><style>body{font-family:Arial,sans-serif;padding:20px}</style></head><body><h2>From: ${from || '(no sender)'}</h2><h2>To: ${toEmail}</h2><h2>Subject: ${subject || '(no subject)'}</h2><hr/>${content}</body></html>`);
        printWindow.document.close();
        printWindow.print();
      }
    }
    setOpenMenu(null);
  };

  const handleEditAction = (action) => {
    const editor = quillRef.current;
    if (!editor) return;
    if (action === 'undo') editor.history.undo();
    else if (action === 'redo') editor.history.redo();
    else if (action === 'cut') document.execCommand('cut');
    else if (action === 'copy') document.execCommand('copy');
    else if (action === 'selectAll') editor.setSelection(0, editor.getLength());
    setOpenMenu(null);
  };

  const handleInsertAction = (action) => {
    const editor = quillRef.current;
    if (!editor) return;
    const range = editor.getSelection();
    const index = range ? range.index : editor.getLength();

    if (action === 'image') {
      const imageUrl = window.prompt('Enter image URL:');
      if (imageUrl) editor.insertEmbed(index, 'image', imageUrl);
    } else if (action === 'link') {
      const url = window.prompt('Enter URL:');
      if (url) {
        if (range && range.length > 0) {
          editor.formatText(range.index, range.length, 'link', url);
        } else {
          const text = window.prompt('Enter link text:');
          if (text) editor.insertText(index, text, 'link', url);
        }
      }
    } else if (action === 'video') {
      const videoUrl = window.prompt('Enter video URL (YouTube, Vimeo):');
      if (videoUrl) editor.insertEmbed(index, 'video', videoUrl);
    } else if (action === 'table') {
      const rows = window.prompt('Enter number of rows:', '3');
      const cols = window.prompt('Enter number of columns:', '3');
      if (rows && cols) {
        let tableHTML = '<table border="1" style="border-collapse:collapse;width:100%">';
        for (let i = 0; i < parseInt(rows); i++) {
          tableHTML += '<tr>';
          for (let j = 0; j < parseInt(cols); j++) {
            tableHTML += '<td style="border:1px solid #ddd;padding:8px">&nbsp;</td>';
          }
          tableHTML += '</tr>';
        }
        tableHTML += '</table>';
        editor.clipboard.dangerouslyPasteHTML(index, tableHTML);
      }
    } else if (action === 'hr') {
      editor.insertText(index, '\n---\n');
    }
    setOpenMenu(null);
  };

  const handleViewAction = (action) => {
    if (action === 'sourceCode') {
      if (!showSourceCode) {
        setSourceCode(quillRef.current?.root.innerHTML || '');
      } else if (quillRef.current) {
        quillRef.current.root.innerHTML = sourceCode;
      }
      setShowSourceCode(!showSourceCode);
    } else if (action === 'fullscreen') {
      if (!document.fullscreenElement) {
        editorContainerRef.current?.requestFullscreen().catch(err =>
          console.log('Fullscreen error:', err)
        );
      } else {
        document.exitFullscreen();
      }
    }
    setOpenMenu(null);
  };

  const handleFormatAction = (format, value) => {
    const editor = quillRef.current;
    if (!editor) return;
    const range = editor.getSelection();
    if (range && range.length > 0) {
      if (value) {
        editor.formatText(range.index, range.length, format, value);
      } else {
        const currentFormat = editor.getFormat(range);
        editor.formatText(range.index, range.length, format, !currentFormat[format]);
      }
    }
    setOpenMenu(null);
  };

  const MenuButton = ({ label, items }) => (
    <div className="relative inline-block">
      <button
        onClick={() => handleMenuClick(label.toLowerCase())}
        className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 transition-colors"
      >
        {label} <ChevronDown className="inline" size={12} />
      </button>
      {openMenu === label.toLowerCase() && items && (
        <div className="absolute top-full left-0 mt-0 bg-white border border-gray-300 shadow-lg z-50 min-w-[180px]">
          {items.map((item, idx) =>
            item === 'divider' ? (
              <div key={idx} className="border-t border-gray-200 my-1"></div>
            ) : (
              <button
                key={idx}
                onClick={item.onClick}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
              >
                <span>{item.label}</span>
                {item.shortcut && <span className="text-xs text-gray-400 ml-4">{item.shortcut}</span>}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );

  const resetForm = () => {
    setFrom("");
    setSubject("");
    setToEmail(leadEmail || "");
    setSelectedTemplate("");
    setAttachments([]);
    setUploadError("");
    if (quillRef.current) quillRef.current.setContents([]);
  };

  const openTemplateModal = () => {
    if (!quillRef.current) return;
    const html = quillRef.current.root.innerHTML.trim();
    if (!html || html === "<p><br></p>") {
      alert("Message is empty!");
      return;
    }
    setShowTemplateForm(true);
  };

  const saveTemplate = () => {
    if (!templateName.trim()) {
      alert("Please enter a template name!");
      return;
    }
    if (!quillRef.current) return;

    const newTemplate = {
      id: crypto.randomUUID(),
      name: templateName.trim(),
      content: quillRef.current.root.innerHTML.trim(),
      isCustom: true,
      visibility: templateVisibility,
      createdAt: new Date().toISOString()
    };

    try {
      const existing = JSON.parse(localStorage.getItem("emailTemplates") || "[]");
      const updated = [newTemplate, ...existing.filter(t => t?.id)];
      localStorage.setItem("emailTemplates", JSON.stringify(updated));
      setTemplates([defaultTemplate, ...updated]);
      setTemplateName("");
      setTemplateVisibility("admin");
      setShowTemplateForm(false);
      alert("Template saved successfully!");
    } catch (error) {
      console.error("Error saving template:", error);
      alert("Error saving template.");
    }
  };

  const deleteTemplate = (id, e) => {
    e.stopPropagation();
    if (window.confirm("Delete this template?")) {
      try {
        const existing = JSON.parse(localStorage.getItem("emailTemplates") || "[]");
        const updated = existing.filter(t => t.id !== id);
        localStorage.setItem("emailTemplates", JSON.stringify(updated));
        setTemplates([defaultTemplate, ...updated]);
        if (selectedTemplate === id) setSelectedTemplate("");
      } catch (error) {
        console.error("Error deleting template:", error);
      }
    }
  };

  const applyTemplate = (id) => {
    if (!id) {
      setSelectedTemplate("");
      return;
    }
    setSelectedTemplate(id);
    const temp = templates.find(t => t.id === id);
    if (temp && quillRef.current) {
      quillRef.current.root.innerHTML = temp.content;
    }
    setShowTemplateDropdown(false);
  };

  const selectFromEmail = (email) => {
    setFrom(email);
    setShowFromDropdown(false);
  };

  const addNewEmail = () => {
    if (!newEmailField.trim()) {
      alert("Please enter an email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmailField)) {
      alert("Please enter a valid email address");
      return;
    }

    try {
      const updatedEmails = [...fromEmails, newEmailField.trim()];
      setFromEmails(updatedEmails);
      localStorage.setItem("fromEmails", JSON.stringify(updatedEmails.slice(2)));
      setFrom(newEmailField.trim());
      alert("Email added successfully!");
      setShowAddForm(false);
      setNewEmailField("");
      setNewDisplayName("");
    } catch (error) {
      console.error("Error adding email:", error);
      alert("Error adding email.");
    }
  };

  const deleteFromEmail = (email, e) => {
    e.stopPropagation();
    if (window.confirm(`Delete ${email} from list?`)) {
      const updatedEmails = fromEmails.filter(e => e !== email);
      setFromEmails(updatedEmails);
      const defaultEmails = ["sujit@gmail.com", "magan@gmail.com"];
      const customEmails = updatedEmails.filter(e => !defaultEmails.includes(e));
      localStorage.setItem("fromEmails", JSON.stringify(customEmails));
      if (from === email) setFrom("");
    }
  };

  // UPDATED: Send email with attachments
  const sendEmail = async () => {
    if (!quillRef.current) return;

    const messageText = quillRef.current.getText().trim();
    const messageHTML = quillRef.current.root.innerHTML;

    if (!messageText) {
      alert("Please write a message!");
      return;
    }

    if (!from || !toEmail || !subject) {
      alert("Please fill in From, To, and Subject fields!");
      return;
    }

    if (!leadId) {
      alert("Lead ID is missing!");
      return;
    }

    setIsSending(true);

    try {
      const token = localStorage.getItem("ts-token");

      if (!token) {
        alert("Session expired. Please login again.");
        setIsSending(false);
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("leadId", leadId);
      formData.append("from", from);
      formData.append("to", toEmail);
      formData.append("subject", subject);
      formData.append("message", messageHTML);

      // Append all attachments
      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      console.log("📤 Sending email with", attachments.length, "attachments");

      const response = await axios.post(
        `${API_URL}/emails/send`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        const status = response.data.data?.status;

        if (status === "Sent") {
          alert("Email Sent Successfully with Attachments!");
        } else if (status === "Pending") {
          alert("📤 Email Queued for Delivery with Attachments!");
        }

        resetForm();

        if (status === "Pending") {
          setTimeout(() => {
            fetchEmails();
          }, 3000);
        } else {
          fetchEmails();
        }
      }
    } catch (error) {
      console.error("❌ Error sending email:", error);

      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
      } else {
        alert(error.response?.data?.message || "Failed to send email. Please try again.");
      }
    } finally {
      setIsSending(false);
    }
  };

  const deleteLog = async (id) => {
    if (!window.confirm("Delete this email?")) return;

    try {
      const token = localStorage.getItem("ts-token");

      if (!token) {
        alert("Session expired. Please login again.");
        return;
      }

      const response = await axios.delete(
        `${API_URL}/emails/delete/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        alert("Email deleted successfully");
        fetchEmails();
      }
    } catch (error) {
      console.error("❌ Error deleting email:", error);
      alert(error.response?.data?.message || "Failed to delete email");
    }
  };

  return (
    <>
      <style>{`
        @keyframes slideDown{
          from{opacity:0;transform:translateY(-50px)}
          to{opacity:1;transform:translateY(0)}
        }
        .animate-slideDown{animation:slideDown .3s ease-out}
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .ql-container{font-family:inherit}
        .ql-tooltip{left:auto!important;right:0!important;transform:none!important}
        .ql-editor table{border-collapse:collapse;width:100%;margin:10px 0}
        .ql-editor table td,.ql-editor table th{border:1px solid #ddd;padding:8px}
        .resizable-editor{resize:vertical;overflow:auto;min-height:150px;max-height:600px}
        *{scrollbar-width:none!important;-ms-overflow-style:none!important}
        *::-webkit-scrollbar{display:none!important;width:0!important;height:0!important}
        .hide-scrollbar::-webkit-scrollbar{display:none!important}
        .hide-scrollbar{-ms-overflow-style:none!important;scrollbar-width:none!important}
      `}</style>

      {/* Add Email Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 pt-10">
          <div className="bg-white w-[90%] md:w-[700px] rounded-lg shadow-xl p-6 relative animate-slideDown">
            <button
              onClick={() => { setShowAddForm(false); setNewEmailField(""); setNewDisplayName(""); }}
              className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Add New Email Address</h3>
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded mb-3">
              Add a new email address to use as sender.
            </div>
            <div className="mb-3">
              <label className="block mb-2 text-sm text-gray-700 font-medium">Display Name</label>
              <input
                type="text"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded"
                placeholder="Enter display name"
              />
            </div>
            <div className="mb-3">
              <label className="block mb-2 text-sm text-gray-700 font-medium">Email Address</label>
              <input
                type="email"
                value={newEmailField}
                onChange={(e) => setNewEmailField(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded"
                placeholder="Enter email address"
              />
            </div>
            <div className="flex gap-3">
              <button
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded font-medium"
                onClick={addNewEmail}
              >
                Add Email
              </button>
              <button
                className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-6 py-2 rounded font-medium"
                onClick={() => { setShowAddForm(false); setNewEmailField(""); setNewDisplayName(""); }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Template Modal */}
      {showTemplateForm && (
        <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 pt-10">
          <div className="bg-white w-[90%] md:w-[800px] rounded-lg shadow-xl p-6 relative animate-slideDown max-h-[90vh] overflow-y-auto hide-scrollbar">
            <button
              onClick={() => { setShowTemplateForm(false); setTemplateName(""); setTemplateVisibility("admin"); }}
              className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Save as template</h3>
            <div className="mb-4">
              <label className="block mb-2 text-sm text-gray-700 font-medium">Template Name</label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded"
                placeholder="Enter template name"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-sm text-gray-700 font-medium">Template Preview</label>
              <div className="border border-gray-300 rounded p-3 bg-gray-50 max-h-[200px] overflow-y-auto hide-scrollbar">
                <div dangerouslySetInnerHTML={{ __html: quillRef.current?.root.innerHTML || '' }} />
              </div>
            </div>
            <div className="mb-6">
              <label className="block mb-2 text-sm text-gray-700 font-medium">Visibility</label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="admin"
                    checked={templateVisibility === "admin"}
                    onChange={(e) => setTemplateVisibility(e.target.value)}
                    className="w-4 h-4 text-cyan-500"
                  />
                  <span className="text-sm text-gray-700">Visible To Admin</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="all"
                    checked={templateVisibility === "all"}
                    onChange={(e) => setTemplateVisibility(e.target.value)}
                    className="w-4 h-4 text-cyan-500"
                  />
                  <span className="text-sm text-gray-700">Visible To All</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded font-medium"
                onClick={saveTemplate}
              >
                Save Template
              </button>
              <button
                className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-6 py-2 rounded font-medium"
                onClick={() => { setShowTemplateForm(false); setTemplateName(""); setTemplateVisibility("admin"); }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Form */}
      <div className="text-sm">
        {/* From Field */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-4">
          <div className="flex-1 w-full">
            <label className="block mb-2 text-gray-700 font-medium">From</label>
            <div className="relative">
              <button
                onClick={() => setShowFromDropdown(!showFromDropdown)}
                className="border border-gray-300 w-full p-2.5 rounded-sm bg-white hover:bg-gray-100 text-left flex justify-between items-center"
              >
                <span className="text-gray-700">{from || "Select Email"}</span>
                <span className="text-gray-400">▼</span>
              </button>
              {showFromDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-sm shadow-lg max-h-60 overflow-y-auto hide-scrollbar">
                  <div
                    onClick={() => selectFromEmail("")}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-gray-500"
                  >
                    Select Email
                  </div>
                  {fromEmails.map((email, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center group"
                    >
                      <span onClick={() => selectFromEmail(email)} className="flex-1 text-gray-700">{email}</span>
                      {idx >= 2 && <button onClick={(e) => deleteFromEmail(email, e)} className="ml-2 p-1 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity" title="Delete email"><Trash2 className="w-4 h-4" /></button>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button onClick={() => setShowAddForm(true)} className="bg-gray-500 text-white px-5 py-2.5 rounded hover:bg-gray-700 font-medium whitespace-nowrap">Add More</button>
        </div>


        <div className="mb-4"><label className="block mb-2 text-gray-700 font-medium">To</label><textarea className="border border-gray-300 w-full p-2.5 rounded-sm hover:bg-gray-100 resize-y hide-scrollbar" value={toEmail} onChange={(e) => setToEmail(e.target.value)} rows={1} /></div>
        <div className="mb-4"><label className="block mb-2 text-gray-700 font-medium">Subject</label><input type="text" className="border border-gray-300 w-full p-2.5 rounded-sm hover:bg-gray-100" value={subject} placeholder="Enter subject" onChange={(e) => setSubject(e.target.value)} /></div>

        <div className="mb-4 relative">
          <label className="block mb-2 text-gray-700 font-medium">Reply with Template</label>
          <div className="relative">
            <button onClick={() => setShowTemplateDropdown(!showTemplateDropdown)} className="border border-gray-300 w-full p-2.5 rounded-sm bg-white hover:bg-gray-100 text-left flex justify-between items-center">
              <span className="text-gray-700">{selectedTemplate ? templates.find(t => t.id === selectedTemplate)?.name || "Choose Template" : "Choose Template"}</span><span className="text-gray-400">▼</span>
            </button>
            {showTemplateDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-sm shadow-lg max-h-60 overflow-y-auto hide-scrollbar">
                <div onClick={() => applyTemplate("")} className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-gray-700">Choose Template</div>
                {templates.map(t => t?.id && (
                  <div key={t.id} className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center group">
                    <span onClick={() => applyTemplate(t.id)} className="flex-1 text-gray-700">{t.isCustom ? '📝 ' : '📄 '}{t.name}</span>
                    {t.isCustom && <button onClick={(e) => deleteTemplate(t.id, e)} className="ml-2 p-1 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity" title="Delete template"><Trash2 className="w-4 h-4" /></button>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>


        <div className="mb-4">
          <label className="block mb-2 text-gray-700 font-medium">Message</label>
          {showSourceCode ? (
            <div><div className="mb-2 text-sm text-orange-600 bg-orange-50 p-2 rounded">🔧 Source Code Mode - Edit HTML directly</div><textarea value={sourceCode} onChange={(e) => setSourceCode(e.target.value)} className="w-full border-2 border-gray-300 rounded-lg p-4 font-mono text-sm min-h-[400px] bg-gray-50 resize-y" placeholder="HTML source code..." /></div>
          ) : (
            <div ref={editorContainerRef} className="border-2 border-gray-300 rounded overflow-hidden resizable-editor">
              <div style={{ background: '#f5f5f5', borderBottom: '1px solid #ccc', padding: '4px 8px' }}>
                <MenuButton label="File" items={[{ label: 'New message', shortcut: 'Ctrl+N', onClick: () => handleFileAction('new') }, { label: 'Print', shortcut: 'Ctrl+P', onClick: () => handleFileAction('print') }]} />
                <MenuButton label="Edit" items={[{ label: 'Undo', shortcut: 'Ctrl+Z', onClick: () => handleEditAction('undo') }, { label: 'Redo', shortcut: 'Ctrl+Y', onClick: () => handleEditAction('redo') }, 'divider', { label: 'Cut', shortcut: 'Ctrl+X', onClick: () => handleEditAction('cut') }, { label: 'Copy', shortcut: 'Ctrl+C', onClick: () => handleEditAction('copy') }, { label: 'Paste', shortcut: 'Ctrl+V', onClick: () => handleEditAction('paste') }, 'divider', { label: 'Select all', shortcut: 'Ctrl+A', onClick: () => handleEditAction('selectAll') }]} />
                <MenuButton label="Insert" items={[{ label: 'Insert image', onClick: () => handleInsertAction('image') }, { label: 'Insert link', shortcut: 'Ctrl+K', onClick: () => handleInsertAction('link') }, { label: 'Insert video', onClick: () => handleInsertAction('video') }, { label: 'Insert table', onClick: () => handleInsertAction('table') }, { label: 'Horizontal line', onClick: () => handleInsertAction('hr') }]} />
                <MenuButton label="View" items={[{ label: 'Fullscreen', shortcut: 'F11', onClick: () => handleViewAction('fullscreen') }, { label: 'Source code', onClick: () => handleViewAction('sourceCode') }]} />
                <MenuButton label="Format" items={[{ label: 'Bold', shortcut: 'Ctrl+B', onClick: () => handleFormatAction('bold') }, { label: 'Italic', shortcut: 'Ctrl+I', onClick: () => handleFormatAction('italic') }, { label: 'Underline', shortcut: 'Ctrl+U', onClick: () => handleFormatAction('underline') }, { label: 'Strikethrough', onClick: () => handleFormatAction('strike') }, 'divider', { label: 'Superscript', onClick: () => handleFormatAction('script', 'super') }, { label: 'Subscript', onClick: () => handleFormatAction('script', 'sub') }]} />
                <MenuButton label="Table" items={[{ label: 'Insert table', onClick: () => handleInsertAction('table') }]} />
                <MenuButton label="Tools" items={[{ label: 'Source code', onClick: () => handleViewAction('sourceCode') }, { label: 'Word count', onClick: () => { const text = quillRef.current?.getText() || ''; const words = text.trim().split(/\s+/).filter(w => w).length; const chars = text.length; alert(`📊 Statistics:\n\nWords: ${words}\nCharacters: ${chars}`); } }]} />
              </div>
              <div id="editor" style={{ minHeight: '150px', backgroundColor: 'white' }}></div>
            </div>
          )}
        </div>


        <button onClick={openTemplateModal} className="mt-3 px-4 py-2 bg-blue-100 border border-blue-400 text-blue-700 rounded hover:bg-blue-200">📄 Save as Template</button>
      </div>

      {/* Attachment Section */}
      <div className="mt-10">
        <label className="block text-sm font-medium text-gray-500 mb-3">
          Attachment
        </label>

        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange} // FIXED
          accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
          className="w-full text-sm text-gray-700
          file:mr-4 file:py-2 file:px-4
          file:rounded file:border file:border-gray-400
          file:text-sm file:font-medium
          file:bg-gray-200 file:text-black
          hover:file:bg-gray-300 file:cursor-pointer"
        />
      </div>

      {/* Selected Files Preview */}
      {attachments.length > 0 && (
        <div className="mt-4 space-y-2">
          {attachments.map((file, index) => (
            <div
              key={index}
              className="flex justify-between items-center bg-gray-100 px-3 py-2 rounded"
            >
              <div className="text-sm text-gray-700">
                📎 {file.name} ({formatFileSize(file.size)})
              </div>
              <button
                onClick={() => removeAttachment(index)}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Attachment Rules */}
      <div className="bg-red-50 border border-red-200 rounded-md px-4 py-2 mt-4">
        <p className="text-sm text-red-500">
          Note: Max 4MB per file, max 12MB total.
          Allowed: jpg, jpeg, png, bmp, gif, pdf, doc, docx, xls, xlsx
        </p>
      </div>



      <div className="flex gap-4 mt-4">
        <button
          onClick={sendEmail}
          disabled={isSending}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? "Sending..." : "Send Email"}
        </button>
        <button onClick={resetForm} className="border border-gray-400 px-6 py-2 rounded hover:bg-gray-100 font-medium">Cancel</button>
      </div>


      <div className="border-t border-dashed border-gray-300 my-6"></div>


      <div className="overflow-x-auto hidden md:block hide-scrollbar">
        <table className="w-full text-sm border-collapse border border-gray-300">
          <thead>
            <tr className="bg-[#e8eef2]">
              <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase text-xs tracking-wider border border-gray-300">TO</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase text-xs tracking-wider border border-gray-300">STATUS</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase text-xs tracking-wider border border-gray-300">DATE</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase text-xs tracking-wider border border-gray-300">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {emailLogs.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-8 text-center text-red-500 font-medium border border-gray-300">No Records</td>
              </tr>
            ) : (
              emailLogs.map(log => (
                <tr key={log.id} className="bg-white hover:bg-gray-50">
                  <td className="px-4 py-4 text-gray-600 border border-gray-300">{log.to}</td>
                  <td className="px-4 py-4 border border-gray-300">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${log.status === "Sent"
                        ? "bg-green-100 text-green-700"
                        : log.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700 animate-pulse"
                          : log.status === "Failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                      }`}>
                      {log.status === "Pending" ? "⏳ Sending..." : log.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-[#00bcd4] font-medium border border-gray-300">{log.date}</td>
                  <td className="px-4 py-4 border border-gray-300">
                    <button onClick={() => deleteLog(log.id)} className="text-gray-500 hover:text-gray-700 transition">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>


      <div className="md:hidden space-y-3">
        {emailLogs.length === 0 ? (
          <div className="py-8 text-center text-red-500 font-medium border border-gray-300 rounded">No Records</div>
        ) : (
          emailLogs.map(log => (
            <div key={log.id} className="border border-gray-300 bg-white rounded-lg overflow-hidden">
              <div className="border-b border-gray-200 p-4 text-sm text-gray-600">
                <span className="font-medium text-gray-500">To: </span>{log.to}
              </div>
              <div className="border-b border-gray-200 p-4 text-sm">
                <span className={`px-2 py-1 rounded text-xs inline-block font-medium ${log.status === "Sent"
                    ? "bg-green-100 text-green-700"
                    : log.status === "Pending"
                      ? "bg-yellow-100 text-yellow-700 animate-pulse"
                      : log.status === "Failed"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                  }`}>
                  {log.status === "Pending" ? "⏳ Sending..." : log.status}
                </span>
              </div>
              <div className="border-b border-gray-200 p-4 text-sm font-semibold text-[#00bcd4]">{log.date}</div>
              <div className="p-4 flex justify-start">
                <button className="text-gray-500 hover:text-gray-700" onClick={() => deleteLog(log.id)}>
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
