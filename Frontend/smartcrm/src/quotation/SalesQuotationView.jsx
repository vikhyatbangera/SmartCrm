import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Send, Clock, FileDown, CheckCircle } from 'lucide-react';

export default function SalesQuotationView() {
  const [quotations, setQuotations] = useState([]);

  const fetchQuotations = async () => {
    const res = await api.get('/quotations');
    setQuotations(res.data.data);
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleSend = async (id) => {
    try {
      await api.post(`/quotations/${id}/send`);
      toast.success("Quotation sent to client via email");
      fetchQuotations(); // refresh list
    } catch (err) {
      toast.error("Failed to send: " + err.response?.data?.message);
    }
  };

  const handleDownloadPDF = async (id) => {
    try {
      toast.loading("Generating PDF...");
      const response = await api.post(`/quotations/${id}/generate-pdf`, {}, {
        responseType: 'blob',
      });
      
      // Check if response is actually a blob
      if (!(response.data instanceof Blob)) {
        throw new Error("Invalid response format");
      }
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `quotation-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.dismiss();
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("PDF Download Error:", error);
      toast.dismiss();
      
      // Try to get error message from response
      let errorMessage = "Failed to download PDF";
      if (error.response?.data) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result);
            errorMessage = errorData.message || errorMessage;
          } catch {
            errorMessage = "Server error occurred";
          }
          toast.error(errorMessage);
        };
        reader.readAsText(error.response.data);
      } else {
        toast.error(error.message || errorMessage);
      }
    }
  };

  return (
    <div className="p-8 bg-[#121212] min-h-screen text-white">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-orange-400">My Quotations</h1>
          <p className="text-gray-400 mt-1">Track and manage your sales quotations</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchQuotations}
            className="px-4 py-2 bg-[#1f1f1f] text-gray-300 border border-gray-700 rounded-lg hover:bg-[#2a2a2a] transition shadow-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {quotations.length === 0 ? (
        <div className="bg-[#1f1f1f] border border-orange-500/20 rounded-xl p-12 text-center">
          <FileDown size={64} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg">No quotations created yet</p>
          <p className="text-gray-500 text-sm mt-2">Create your first quotation to get started</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {quotations.map(q => (
            <div key={q._id} className="bg-[#1f1f1f] p-5 rounded-xl shadow-md border-l-4 border-orange-500 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{q.clientName}</h3>
                    <span className={`text-xs px-3 py-1 rounded-full uppercase font-bold tracking-wide
                      ${q.status === 'approved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                        q.status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                        q.status === 'sent' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}
                    >
                      {q.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-1">Email: {q.clientEmail}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="bg-[#121212] border border-green-500/20 px-4 py-2 rounded-lg">
                      <p className="text-xs text-gray-400 font-medium">Grand Total</p>
                      <p className="text-lg font-bold text-green-400">₹{q.grandTotal.toFixed(2)}</p>
                    </div>
                    <div className="bg-[#121212] border border-blue-500/20 px-4 py-2 rounded-lg">
                      <p className="text-xs text-gray-400 font-medium">Subtotal</p>
                      <p className="text-sm font-semibold text-blue-400">₹{q.subtotal.toFixed(2)}</p>
                    </div>
                    {q.products && q.products.length > 0 && (
                      <div className="bg-[#121212] border border-purple-500/20 px-4 py-2 rounded-lg">
                        <p className="text-xs text-gray-400 font-medium">Products</p>
                        <p className="text-sm font-semibold text-purple-400">{q.products.length} items</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  {q.status === 'approved' && (
                    <>
                      <button 
                        onClick={() => handleSend(q._id)} 
                        className="bg-orange-600 text-white px-4 py-2.5 rounded-lg hover:bg-orange-700 transition shadow-md flex items-center gap-2 font-medium"
                      >
                        <Send size={18}/> Send to Client
                      </button>
                      <button 
                        onClick={() => handleDownloadPDF(q._id)} 
                        className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition shadow-md flex items-center gap-2 font-medium"
                      >
                        <FileDown size={18}/> Download PDF
                      </button>
                    </>
                  )}
                  {q.status === 'pending_approval' && (
                    <div className="text-gray-500 flex items-center gap-2 text-sm italic bg-[#121212] px-4 py-2 rounded-lg border border-gray-700">
                      <Clock size={16}/> Awaiting Approval
                    </div>
                  )}
                  {q.status === 'sent' && (
                    <>
                      <div className="text-green-400 flex items-center gap-2 text-sm font-medium bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/20">
                        <CheckCircle size={16}/> Sent to Client
                      </div>
                      <button 
                        onClick={() => handleDownloadPDF(q._id)} 
                        className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition shadow-md flex items-center gap-2 font-medium"
                      >
                        <FileDown size={18}/> Download PDF
                      </button>
                    </>
                  )}
                  {q.status === 'rejected' && (
                    <div className="text-red-400 flex items-center gap-2 text-sm font-medium bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">
                      <Clock size={16}/> Rejected
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}