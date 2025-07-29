import React from "react";

const PrivateLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div
      className="min-h-screen text-white"
      style={{
        backgroundImage: "url('https://tse4.mm.bing.net/th/id/OIP.bImISDVuXSGLYudJsLuZ5QHaCz?pid=Api&P=0&h=180')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
      }}
    >
      <div className="bg-black/40 min-h-screen w-full">
        {/* ✅ A semi-transparent overlay for readability */}
        {children}
      </div>
    </div>
  );
};

export default PrivateLayout;
