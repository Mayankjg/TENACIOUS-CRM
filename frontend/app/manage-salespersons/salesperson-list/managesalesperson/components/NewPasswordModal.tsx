"use client";
import React, { useState, MouseEvent, ChangeEvent } from "react";

interface NewPasswordModalProps {
  salespersonId: string | number;
  onClose: () => void;
  onPasswordChange: (id: string | number, password: string) => void;
}

const NewPasswordModal: React.FC<NewPasswordModalProps> = ({
  salespersonId,
  onClose,
  onPasswordChange,
}) => {
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const submit = () => {
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    onPasswordChange(salespersonId, newPassword);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 flex justify-center items-center z-[1000] p-5"
      onClick={onClose}
    >
      <div
        className="bg-white p-4 border border-black rounded-lg w-full max-w-md shadow-lg"
        onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold bg-[#e5e9ec] mb-4 text-gray-900">
          Change Password
        </h3>

        {error && <p className="text-red-500 mb-3 text-sm">{error}</p>}

        <hr className="-mx-4 border-t border-gray-300 mb-4" />

        <label className="block mb-2 text-sm font-medium text-gray-700">
          New Password
        </label>
        <input
          type="password"
          className="w-full p-2.5 mb-4 border border-gray-300 rounded-md pl-5 text-black"
          value={newPassword}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setNewPassword(e.target.value)
          }
        />

        <label className="block mb-2 text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <input
          type="password"
          className="w-full p-2.5 mb-4 border border-gray-300 rounded-md pl-5 text-black"
          value={confirmPassword}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setConfirmPassword(e.target.value)
          }
        />

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={submit}
            className="bg-[#00a7cf] cursor-pointer hover:bg-[#0094b8] text-white px-4 py-2.5 rounded-md font-bold"
          >
            Update Password
          </button>

          <button
            onClick={onClose}
            className="bg-gray-100 cursor-pointer hover:bg-gray-200 text-gray-800 px-4 py-2.5 rounded-md font-bold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewPasswordModal;