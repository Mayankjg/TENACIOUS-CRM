// frontend/app/invalid-emails/page.tsx
"use client";

export default function InvalidEmailsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">❌ Invalid Emails</h1>
      <p className="text-gray-600 mt-2">
        Emails that failed validation or bounce.
      </p>
    </div>
  );
}