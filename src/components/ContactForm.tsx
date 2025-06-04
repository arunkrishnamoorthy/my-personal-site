"use client";
import { useState } from "react";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 shadow mt-6">
      <h3 className="text-lg font-semibold mb-4">Contact Me</h3>
      {submitted ? (
        <div className="text-green-600 dark:text-green-400 font-semibold">
          Thank you for reaching out!
        </div>
      ) : (
        <form
          className="flex flex-col gap-4"
          onSubmit={e => {
            e.preventDefault();
            setSubmitted(true);
          }}
        >
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full rounded border border-emerald-300 dark:border-emerald-700 px-3 py-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full rounded border border-emerald-300 dark:border-emerald-700 px-3 py-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              required
              className="w-full rounded border border-emerald-300 dark:border-emerald-700 px-3 py-2 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="bg-emerald-600 text-white rounded px-4 py-2 font-semibold hover:bg-emerald-700 transition"
          >
            Send Message
          </button>
        </form>
      )}
    </div>
  );
}