// src/pages/Unauthorized.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react"; // optional icon

const Unauthorized: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-10 text-center max-w-md">
        <div className="flex justify-center mb-4">
          <Lock className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Access Denied
        </h1>
        <p className="text-gray-600 mb-6">
          You do not have permission to view this page. <br />
          Please log in with an authorized account to continue.
        </p>
        <Link
          to="/login"
          className="inline-block bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
