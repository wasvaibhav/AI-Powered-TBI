import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, FileText, ArrowRight, X, Sprout, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import Toast from '../components/Toast';

export default function Dashboard() {
  const navigate = useNavigate();
  const { fetchWithAuth } = useAuth();
  const [advisories, setAdvisories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Advisory Form state
  const [formCrop, setFormCrop] = useState('');
  const [formQuery, setFormQuery] = useState('');
  const [formAdvice, setFormAdvice] = useState('');
  const [formStatus, setFormStatus] = useState('open');
  const [formError, setFormError] = useState('');

  // Fetch advisories based on current filters/search
  const fetchAdvisories = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      let url = 'http://localhost:5000/api/advisories';
      
      if (searchQuery.trim() !== '') {
        url = `http://localhost:5000/api/advisories/search?q=${encodeURIComponent(searchQuery)}`;
      } else if (statusFilter !== 'all') {
        url = `http://localhost:5000/api/advisories/filter?status=${encodeURIComponent(statusFilter)}`;
      }

      const response = await fetchWithAuth(url);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to fetch advisories (Status ${response.status})`);
      }
      const data = await response.json();
      setAdvisories(data);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Network error: Please verify that the backend API is running on port 5000.');
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger fetch when filter or search changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchAdvisories();
    }, 300); // 300ms debounce for search inputs

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, statusFilter]);

  // Handle new advisory creation
  const handleCreateAdvisory = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formCrop.trim() || !formQuery.trim() || !formAdvice.trim()) {
      setFormError('Please fill out all fields.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        crop: formCrop.trim(),
        query: formQuery.trim(),
        advice: formAdvice.trim(),
        status: formStatus
      };

      const response = await fetchWithAuth('http://localhost:5000/api/advisories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Failed to create advisory (Status ${response.status})`);
      }

      const newAdvisory = await response.json();
      
      // Update local state list and close modal
      setAdvisories((prev) => [newAdvisory, ...prev]);
      setIsModalOpen(false);
      
      // Reset form
      setFormCrop('');
      setFormQuery('');
      setFormAdvice('');
      setFormStatus('open');
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Could not save the new advisory record.');
    } finally {
      setIsLoading(false);
    }
  };

  // Statistics summaries
  const openCount = advisories.filter(a => a.status === 'open').length;
  const resolvedCount = advisories.filter(a => a.status === 'resolved').length;

  return (
    <div className="bg-cream min-h-[85vh] py-8 font-sans">
      {/* Toast notifications */}
      {errorMessage && (
        <Toast message={errorMessage} onClose={() => setErrorMessage('')} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-pine/15 pb-6 mb-8">
          <div>
            <h1 className="font-serif font-bold text-3xl text-pine tracking-wide">
              Supervisor Advisories
            </h1>
            <p className="text-sm text-charcoal/60 mt-1">
              Manage hill-crop advisor records, organic recommendation logs, and status audits.
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-terracotta hover:bg-terracotta-dark text-cream border border-terracotta hover:border-terracotta-dark font-medium text-sm transition-all duration-200 shadow-sm"
              id="add-advisory-btn"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Add Advisory</span>
            </button>
          </div>
        </div>

        {/* Stats Panels */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-cream-dark/30 border border-pine/15 p-6 flex items-center space-x-4">
            <div className="p-3 bg-pine/10 text-pine rounded-none border border-pine/20">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-charcoal/50 uppercase tracking-wider font-semibold">Total Logged</p>
              <h3 className="font-serif font-bold text-2xl text-pine mt-0.5">{advisories.length}</h3>
            </div>
          </div>
          
          <div className="bg-cream-dark/30 border border-pine/15 p-6 flex items-center space-x-4">
            <div className="p-3 bg-amber-500/10 text-amber-700 rounded-none border border-amber-500/20">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-charcoal/50 uppercase tracking-wider font-semibold">Open Queries</p>
              <h3 className="font-serif font-bold text-2xl text-amber-700 mt-0.5">{openCount}</h3>
            </div>
          </div>

          <div className="bg-cream-dark/30 border border-pine/15 p-6 flex items-center space-x-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-700 rounded-none border border-emerald-500/20">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-charcoal/50 uppercase tracking-wider font-semibold">Resolved Cases</p>
              <h3 className="font-serif font-bold text-2xl text-emerald-700 mt-0.5">{resolvedCount}</h3>
            </div>
          </div>
        </div>

        {/* Search, Filter bar */}
        <div className="bg-cream-dark/20 border border-pine/10 p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Search box */}
          <div className="relative w-full md:w-96">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-charcoal/40">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setStatusFilter('all'); // Search overrides status filter to look across all
                setSearchQuery(e.target.value);
              }}
              placeholder="Search by crop, query description..."
              className="w-full bg-cream text-charcoal text-sm py-2 pl-9 pr-4 border border-pine/15 focus:outline-none focus:border-terracotta placeholder-charcoal/40 transition-colors"
              id="search-advisories"
            />
          </div>

          {/* Status filter tabs/dropdown */}
          <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
            <Filter className="h-4 w-4 text-charcoal/50" />
            <span className="text-xs font-semibold text-charcoal/60 uppercase">Filter:</span>
            <div className="inline-flex border border-pine/15 p-0.5 bg-cream">
              {['all', 'open', 'resolved'].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setSearchQuery(''); // Filter overrides active search queries
                    setStatusFilter(status);
                  }}
                  className={`px-3 py-1 text-xs font-medium capitalize transition-all duration-200 ${
                    statusFilter === status
                      ? 'bg-pine text-cream'
                      : 'text-charcoal/70 hover:text-pine hover:bg-cream-dark/35'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main List Table Area */}
        <div className="bg-cream border border-pine/15 relative overflow-hidden shadow-sm">
          {isLoading && <Loader message="Fetching advisory logs..." />}
          
          {!isLoading && advisories.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Sprout className="h-10 w-10 text-charcoal/20 mx-auto mb-3" />
              <h3 className="font-serif font-bold text-lg text-pine">No advisories found</h3>
              <p className="text-sm text-charcoal/60 max-w-sm mx-auto mt-1">
                Try loosening your search terms or create a new advisory log above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-pine/10 text-left text-sm font-sans">
                <thead className="bg-pine text-cream text-xs uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-semibold">Crop</th>
                    <th scope="col" className="px-6 py-4 font-semibold">Query Summary</th>
                    <th scope="col" className="px-6 py-4 font-semibold">Date Logged</th>
                    <th scope="col" className="px-6 py-4 font-semibold">Status</th>
                    <th scope="col" className="px-6 py-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pine/10 bg-cream">
                  {advisories.map((adv) => (
                    <tr 
                      key={adv.id}
                      onClick={() => navigate(`/advisories/${adv.id}`)}
                      className="hover:bg-cream-dark/15 cursor-pointer transition-colors duration-150"
                    >
                      <td className="px-6 py-4 font-serif font-bold text-pine whitespace-nowrap">
                        {adv.crop}
                      </td>
                      <td className="px-6 py-4 max-w-md truncate text-charcoal/80">
                        {adv.query}
                      </td>
                      <td className="px-6 py-4 text-charcoal/60 whitespace-nowrap">
                        {new Date(adv.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold border ${
                          adv.status === 'open' 
                            ? 'bg-amber-500/10 text-amber-800 border-amber-500/30' 
                            : 'bg-emerald-500/10 text-emerald-800 border-emerald-500/30'
                        }`}>
                          {adv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/advisories/${adv.id}`);
                          }}
                          className="inline-flex items-center text-xs font-bold text-terracotta hover:text-terracotta-dark hover:underline space-x-1"
                        >
                          <span>Manage</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Advisory Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm">
          <div className="relative bg-cream w-full max-w-lg border-2 border-pine/30 p-6 sm:p-8 shadow-2xl animate-fade-in">
            
            {/* Close button */}
            <button
              onClick={() => {
                setIsModalOpen(false);
                setFormError('');
              }}
              className="absolute top-4 right-4 text-charcoal/50 hover:text-terracotta transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-2 border-b border-pine/10 pb-3 mb-6">
              <Sprout className="h-5 w-5 text-terracotta" />
              <h2 className="font-serif font-bold text-xl text-pine">
                New Advisory Record
              </h2>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateAdvisory} className="space-y-4 font-sans text-sm text-charcoal">
              
              <div>
                <label className="block text-xs font-bold text-charcoal/70 uppercase tracking-wider mb-1.5">
                  Target Crop
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Munsyari Rajma, Apple, Finger Millet..."
                  value={formCrop}
                  onChange={(e) => setFormCrop(e.target.value)}
                  className="w-full bg-cream border border-pine/15 py-2 px-3 focus:outline-none focus:border-terracotta"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal/70 uppercase tracking-wider mb-1.5">
                  Supervisor Question / Symptoms
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Brown rot spots on the outer skin, leaf yellowing..."
                  value={formQuery}
                  onChange={(e) => setFormQuery(e.target.value)}
                  className="w-full bg-cream border border-pine/15 py-2 px-3 focus:outline-none focus:border-terracotta resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal/70 uppercase tracking-wider mb-1.5">
                  Expert Advice / Recommendation
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide steps for organic treatments, pruning schedules, etc..."
                  value={formAdvice}
                  onChange={(e) => setFormAdvice(e.target.value)}
                  className="w-full bg-cream border border-pine/15 py-2 px-3 focus:outline-none focus:border-terracotta"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal/70 uppercase tracking-wider mb-1.5">
                  Initial Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full bg-cream border border-pine/15 py-2 px-3 focus:outline-none focus:border-terracotta text-sm"
                >
                  <option value="open">Open</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-pine/10 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setFormError('');
                  }}
                  className="px-4 py-2 border border-pine/20 hover:bg-cream-dark/20 transition-all font-semibold text-xs text-charcoal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 bg-pine hover:bg-pine-light text-cream font-semibold text-xs border border-pine hover:border-pine-light transition-all shadow-sm"
                >
                  Save Record
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
