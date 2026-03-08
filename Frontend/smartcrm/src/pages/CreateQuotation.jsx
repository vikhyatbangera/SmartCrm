import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function CreateQuotation() {
  const navigate = useNavigate();
  
  // State for leads
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState("");

  // Form States
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [tax, setTax] = useState(0);
  const [products, setProducts] = useState([
    { name: "", quantity: 1, price: 0, discount: 0 },
  ]);

  // Calculated totals
  const [subtotal, setSubtotal] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  // Fetch leads on component mount
  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await api.get("/leads");
      setLeads(response.data.data || []);
    } catch (error) {
      console.error("Error fetching leads:", error);
    }
  };

  // Auto-calculate totals when products or tax change
  useEffect(() => {
    calculateTotals();
  }, [products, tax]);

  const calculateTotals = () => {
    let newSubtotal = 0;
    products.forEach((product) => {
      const lineTotal = (product.quantity * product.price) - product.discount;
      newSubtotal += lineTotal;
    });
    setSubtotal(newSubtotal);
    setGrandTotal(newSubtotal + Number(tax));
  };

  // ======= Handle Product Changes =======
  const handleProductChange = (index, field, value) => {
    const updated = [...products];
    updated[index][field] = field === "name" ? value : Number(value);
    setProducts(updated);
  };

  const addProduct = () => {
    setProducts([...products, { name: "", quantity: 1, price: 0, discount: 0 }]);
  };

  const removeProduct = (index) => {
    if (products.length === 1) return; // at least 1 product
    const updated = [...products];
    updated.splice(index, 1);
    setProducts(updated);
  };

  // Handle Lead Selection
  const handleLeadSelect = (leadId) => {
    const lead = leads.find(l => l._id === leadId);
    if (lead) {
      setSelectedLead(leadId);
      setClientName(lead.name);
      setClientEmail(lead.email || "");
    }
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!clientName || !clientEmail) {
      toast.error("Client name and email are required");
      return;
    }

    if (!products.length || products.some(p => !p.name || p.quantity <= 0 || p.price <= 0)) {
      toast.error("All products must have name, quantity > 0, and price > 0");
      return;
    }

    try {
      const response = await api.post("/quotations", {
        clientName,
        clientEmail,
        leadId: selectedLead || null,
        tax: Number(tax),
        products,
      });

      toast.success("Quotation created successfully!");
      
      // Generate PDF if user wants
      const generatePdf = window.confirm("Do you want to generate PDF?");
      if (generatePdf) {
        await generateQuotationPDF(response.data.data._id);
      }
      
      navigate("/quotations");
    } catch (err) {
      console.error("Create Quotation Error:", err.response?.data || err);
      toast.error(err.response?.data?.message || "Failed to create quotation");
    }
  };

  // Generate PDF Function
  const generateQuotationPDF = async (quotationId) => {
    try {
      const response = await api.post(`/quotations/${quotationId}/generate-pdf`, {}, {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `quotation-${quotationId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast.success("PDF generated successfully!");
    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <div className="ml-64 p-8">
      <h1 className="text-2xl font-bold mb-6">Create New Quotation</h1>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        {/* Lead Selection */}
        <div className="bg-white p-4 rounded shadow">
          <label className="block font-semibold mb-2">Select Lead (Optional)</label>
          <select
            value={selectedLead}
            onChange={(e) => handleLeadSelect(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">-- Select a Lead --</option>
            {leads.map((lead) => (
              <option key={lead._id} value={lead._id}>
                {lead.name} ({lead.company || "No Company"})
              </option>
            ))}
          </select>
        </div>

        {/* Client Details */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-3 text-lg">Client Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Client Name</label>
              <input
                type="text"
                placeholder="Enter client name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Client Email</label>
              <input
                type="email"
                placeholder="Enter client email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-3 text-lg">Products</h2>
          {products.map((product, idx) => (
            <div
              key={idx}
              className="grid grid-cols-12 gap-4 mb-4 items-end"
            >
              <div className="col-span-4">
                <label className="block font-medium mb-1">Product Name</label>
                <input
                  type="text"
                  placeholder="Product Name"
                  value={product.name}
                  onChange={(e) => handleProductChange(idx, "name", e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block font-medium mb-1">Quantity</label>
                <input
                  type="number"
                  min={1}
                  value={product.quantity}
                  onChange={(e) => handleProductChange(idx, "quantity", e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block font-medium mb-1">Price (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={product.price}
                  onChange={(e) => handleProductChange(idx, "price", e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block font-medium mb-1">Discount (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={product.discount}
                  onChange={(e) => handleProductChange(idx, "discount", e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              <button
                type="button"
                onClick={() => removeProduct(idx)}
                className="col-span-2 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addProduct}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Add Product
          </button>
        </div>

        {/* Summary Section */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-3 text-lg">Summary</h2>
          <div className="grid grid-cols-2 gap-4 max-w-md">
            <div>
              <label className="block font-medium mb-1">Tax Amount (₹)</label>
              <input
                type="number"
                min={0}
                value={tax}
                onChange={(e) => setTax(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Subtotal (₹)</label>
              <input
                type="text"
                value={subtotal.toFixed(2)}
                readOnly
                className="w-full p-2 border rounded bg-gray-100"
              />
            </div>

            <div className="col-span-2">
              <label className="block font-semibold mb-1">Grand Total (₹)</label>
              <input
                type="text"
                value={grandTotal.toFixed(2)}
                readOnly
                className="w-full p-2 border rounded bg-green-100 font-bold text-lg"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6">
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow"
          >
            Create Quotation
          </button>
          <button
            type="button"
            onClick={() => navigate("/quotations")}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold shadow"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}