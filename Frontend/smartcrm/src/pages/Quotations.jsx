import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import AdminQuotationView from '../quotation/AdminQuotationView';
import ManagerQuotationView from '../quotation/ManagerQuotationView';
import SalesQuotationView from '../quotation/SalesQuotationView';

export default function Quotations() {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#121212] text-white">
        <p className="text-lg font-semibold">Please log in to view quotations.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#111010] min-h-screen w-full flex">
      {/* Content Area */}
      <div className="flex-1 p-8 space-y-6">
        {/* Header with title and button */}
        <div className="flex justify-between items-center w-full">
          <h1 className="text-2xl font-bold text-orange-500">Quotations</h1>
          {/* Show create button only for Manager and Sales (NOT Admin) */}
          {(user.role === 'manager' || user.role === 'sales') && (
            <button
              onClick={() => navigate('/quotations/create')}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
            >
              + Create Quotation
            </button>
          )}
        </div>

        {/* Render role-based quotation view */}
        {user.role === 'admin' && <AdminQuotationView />}
        {user.role === 'manager' && <ManagerQuotationView />}
        {user.role === 'sales' && <SalesQuotationView />}
      </div>
    </div>
  );
}