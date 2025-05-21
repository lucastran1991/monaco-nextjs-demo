'use client';

export default function Error({ error, reset }) {
  return (
    <div className="p-8 text-center">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="mb-4">{error?.message || "Unknown error."}</p>
      <button
        className="px-4 py-2 bg-indigo-600 text-white rounded"
        onClick={() => reset()}
      >
        Try again
      </button>
    </div>
  );
}