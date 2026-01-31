import React from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-red-600 mb-4">403 - Unauthorized</h1>
      <p className="text-lg text-gray-700 mb-6">
        You do not have permission to view this page.
      </p>
      <button 
        onClick={() => navigate(-1)} // Go back to previous page
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Go Back
      </button>
    </div>
  );
};

export default Unauthorized;