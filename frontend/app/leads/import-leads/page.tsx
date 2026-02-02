"use client";
import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface FormData {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  mobile: string;
  fax: string;
  designation: string;
  website: string;
  testerSalesman: string;
  category: string;
  product: string;
  leadSource: string;
  leadStatus: string;
  leadStartDate: string;
  leadStartTime: string;
  leadRemindDate: string;
  leadRemindTime: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  expectedAmount: string;
  paymentReceived: string;
  comment: string;
  facebook: string;
  skype: string;
  linkedIn: string;
  gtalk: string;
  twitter: string;
  convertOption: string;
}

export default function CreateLead() {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    phone: "",
    mobile: "",
    fax: "",
    designation: "",
    website: "",
    testerSalesman: "",
    category: "",
    product: "",
    leadSource: "",
    leadStatus: "",
    leadStartDate: "",
    leadStartTime: "",
    leadRemindDate: "",
    leadRemindTime: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    expectedAmount: "",
    paymentReceived: "",
    comment: "",
    facebook: "",
    skype: "",
    linkedIn: "",
    gtalk: "",
    twitter: "",
    convertOption: "",
  });

  const [leads, setLeads] = useState<FormData[]>([]);

  // dynamic input handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // form submit handler
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // validation
    if (
      !formData.firstName ||
      !formData.category ||
      !formData.product ||
      !formData.leadStatus
    ) {
      toast.error("⚠️ Please fill all required (*) fields!");
      return;
    }

    // store lead
    setLeads((prev) => [...prev, formData]);
    console.log("Lead Created:", formData);

    toast.success("Lead Created Successfully!");
    handleReset();
  };

  // reset form handler
  const handleReset = () => {
    setFormData({
      firstName: "",
      lastName: "",
      company: "",
      email: "",
      phone: "",
      mobile: "",
      fax: "",
      designation: "",
      website: "",
      testerSalesman: "",
      category: "",
      product: "",
      leadSource: "",
      leadStatus: "",
      leadStartDate: "",
      leadStartTime: "",
      leadRemindDate: "",
      leadRemindTime: "",
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      expectedAmount: "",
      paymentReceived: "",
      comment: "",
      facebook: "",
      skype: "",
      linkedIn: "",
      gtalk: "",
      twitter: "",
      convertOption: "",
    });

    toast.info("🔄 Form has been reset!");
  };

  // cancel handler (optional toast)
  const handleCancel = () => {
    toast.warning("❌ Lead creation cancelled!");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={2000} />

      <form
        onSubmit={handleSubmit}
        className="max-w-7xl mx-auto bg-white shadow-md rounded-lg p-6 text-black"
      >
        <h2 className="text-xl font-semibold mb-[30px]">
          Create New <span className="font-bold">Lead</span>
        </h2>

        {/* Lead Information */}
        <h3 className="font-semibold"> Lead Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6">
          <div className="md:col-span-2 grid grid-cols-2 gap-4 pr-6 border-gray-300 border-r">
            {[
              ["firstName", "First Name *"],
              ["lastName", "Last Name"],
              ["company", "Company Name"],
              ["email", "Email address"],
              ["phone", "Phone Number"],
              ["mobile", "Mobile"],
              ["fax", "Fax"],
              ["designation", "Designation"],
              ["website", "Website"],
            ].map(([name, placeholder]) => (
              <input
                key={name}
                type="text"
                name={name}
                placeholder={placeholder}
                value={formData[name as keyof FormData]}
                onChange={handleChange}
                className="border rounded-md p-2"
              />
            ))}
          </div>

          <div className="flex flex-col gap-3 pl-4">
            {[
              ["testerSalesman", "Tester_salesman"],
              ["category", "Select Category *"],
              ["product", "Select Product *"],
              ["leadSource", "Select Lead Source"],
              ["leadStatus", "Select Lead Status *"],
            ].map(([name, label], i) => (
              <div key={i} className="flex gap-2">
                <select
                  name={name}
                  value={formData[name as keyof FormData]}
                  onChange={handleChange}
                  className="border rounded-md p-2 w-full"
                >
                  <option value="">{label}</option>
                  <option value="Option 1">Option 1</option>
                  <option value="Option 2">Option 2</option>
                </select>
                <button
                  type="button"
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-3 rounded"
                >
                  +
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Lead Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pb-6">
          <div className="pr-6 border-r border-gray-300">
            <h3 className="font-semibold mb-2">Lead Start Date</h3>
            <div className="flex gap-2">
              <input
                type="date"
                name="leadStartDate"
                value={formData.leadStartDate}
                onChange={handleChange}
                className="border rounded-md p-2 w-1/2"
              />
              <input
                type="time"
                name="leadStartTime"
                value={formData.leadStartTime}
                onChange={handleChange}
                className="border rounded-md p-2 w-1/2"
              />
            </div>
          </div>

          <div className="pl-6">
            <h3 className="font-semibold mb-2">Lead Remind Date</h3>
            <div className="flex gap-2">
              <input
                type="date"
                name="leadRemindDate"
                value={formData.leadRemindDate}
                onChange={handleChange}
                className="border rounded-md p-2 w-1/2"
              />
              <input
                type="time"
                name="leadRemindTime"
                value={formData.leadRemindTime}
                onChange={handleChange}
                className="border rounded-md p-2 w-1/2"
              />
            </div>
          </div>
        </div>

        {/* Address Info */}
        <div className="mt-6 pb-6">
          <h3 className="font-semibold mb-2">Address Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="pr-4 border-r border-gray-300">
              <textarea
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                className="border rounded-md p-2 h-15 resize-none w-full"
              />
              <input
                name="city"
                type="text"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
                className="border rounded-md p-2 w-full mt-4"
              />
            </div>

            <div className="pl-4 space-y-4">
              <input
                name="state"
                type="text"
                placeholder="State"
                value={formData.state}
                onChange={handleChange}
                className="border rounded-md p-2 w-full"
              />
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="border rounded-md p-2 w-full"
              >
                <option value="">Select Country</option>
                <option value="India">India</option>
                <option value="USA">USA</option>
                <option value="UK">UK</option>
              </select>
              <input
                name="postalCode"
                type="text"
                placeholder="Postal Code"
                value={formData.postalCode}
                onChange={handleChange}
                className="border rounded-md p-2 w-full"
              />
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="mt-6 pb-6">
          <h3 className="font-semibold mb-2">Payment Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <input
              name="expectedAmount"
              type="text"
              placeholder="Expected Amount"
              value={formData.expectedAmount}
              onChange={handleChange}
              className="border rounded-md p-2 w-full"
            />
            <input
              name="paymentReceived"
              type="text"
              placeholder="Payment Received"
              value={formData.paymentReceived}
              onChange={handleChange}
              className="border rounded-md p-2 w-full"
            />
            <div className="border-l border-gray-300 pl-4">
              <textarea
                name="comment"
                placeholder="Comment"
                value={formData.comment}
                onChange={handleChange}
                className="border rounded-md p-2 w-full resize-none h-12"
              />
            </div>
          </div>
        </div>

        {/* Social Info */}
        <div className="mt-6 pb-6">
          <h3 className="font-semibold mb-2">Social Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="pr-4 space-y-4 border-r border-gray-300">
              {["facebook", "skype", "linkedIn"].map((name) => (
                <input
                  key={name}
                  name={name}
                  type="text"
                  placeholder={name.charAt(0).toUpperCase() + name.slice(1)}
                  value={formData[name as keyof FormData]}
                  onChange={handleChange}
                  className="border rounded-md p-2 w-full"
                />
              ))}
            </div>
            <div className="pl-4 space-y-4">
              {["gtalk", "twitter"].map((name) => (
                <input
                  key={name}
                  name={name}
                  type="text"
                  placeholder={name.charAt(0).toUpperCase() + name.slice(1)}
                  value={formData[name as keyof FormData]}
                  onChange={handleChange}
                  className="border rounded-md p-2 w-full"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Convert Options + Buttons */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-6 bg-gray-100 p-4 rounded-md">
          <div className="flex items-center gap-6">
            <label className="text-red-700 font-semibold flex items-center gap-1">
              <input
                type="radio"
                name="convertOption"
                value="customer"
                checked={formData.convertOption === "customer"}
                onChange={handleChange}
              />
              Convert to Customer
            </label>
            <label className="text-teal-600 font-semibold flex items-center gap-1">
              <input
                type="radio"
                name="convertOption"
                value="deal"
                checked={formData.convertOption === "deal"}
                onChange={handleChange}
              />
              Convert to Deals
            </label>
          </div>

          <div className="flex gap-4 mt-4 md:mt-0">
            <button
              type="submit"
              className="bg-sky-600 hover:bg-sky-700 text-white w-28 py-1.5 rounded-[3px]"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="bg-red-500 hover:bg-red-600 text-white w-28 py-1.5 rounded-[3px]"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 w-28 py-1.5 rounded-[3px]"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>

      {/* Leads Preview */}
      {leads.length > 0 && (
        <div className="max-w-7xl mx-auto mt-8 bg-white rounded-md shadow p-4 text-black">
          <h3 className="text-lg font-semibold mb-3">Leads Data</h3>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(leads, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}