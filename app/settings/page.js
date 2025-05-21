"use client";

import { useState, useEffect } from "react";

export default function SettingPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [orgId, setOrgId] = useState("");
  const [entId, setEntId] = useState("");
  const [plantId, setPlantId] = useState("");

  useEffect(() => {
    setUsername(localStorage.getItem("username") || "");
    setPassword(localStorage.getItem("password") || "");
    setOrgId(localStorage.getItem("orgId") || "");
    setEntId(localStorage.getItem("entId") || "");
    setPlantId(localStorage.getItem("plantId") || "");
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("username", username);
    localStorage.setItem("password", password);
    localStorage.setItem("orgId", orgId);
    localStorage.setItem("entId", entId);
    localStorage.setItem("plantId", plantId);
    alert("Settings saved!");
  };

  return (
    <div>
      <nav className="flex items-center p-4 border-b border-gray-200">
        <button
          onClick={() => window.history.back()}
          className="font-bold mr-4"
        >
          く
        </button>
        <span className="font-bold text-lg flex-1 text-center">Settings</span>
      </nav>
      <div className="min-w-[400px] max-w-[60vw] mx-auto my-8 p-8 border border-gray-200 rounded-lg">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="veolia@atomiton.com"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="veolia@7799"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Organization ID</label>
            <input
              type="text"
              name="organizationId"
              value={orgId}
              onChange={e => setOrgId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="SYMDKFIM4KQLXSK6UYJZ4AE7PQQET35E2"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Enterprise ID</label>
            <input
              type="text"
              name="enterpriseId"
              value={entId}
              onChange={e => setEntId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="SNYGRUOXEROKAWX63HPMQC6ER3QWBPS4Z"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Plant ID</label>
            <input
              type="text"
              name="plantId"
              value={plantId}
              onChange={e => setPlantId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="SYHI5OY7RAIGBBYOYVQOCOC7JMCNC4RPP"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-blue-700 text-white border-none rounded mt-4"
          >
            Save Settings
          </button>
        </form>
      </div>
    </div>
  );
}