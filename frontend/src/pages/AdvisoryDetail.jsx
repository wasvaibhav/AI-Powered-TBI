import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, CheckCircle2, AlertCircle, Calendar, Sprout, Save, X } from 'lucide-react';
import Loader from '../components/Loader';
import Toast from '../components/Toast';

export default function AdvisoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [advisory, setAdvisory] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Edit Form Fields
  const [editCrop, setEditCrop] = useState('');
  const [editQuery, setEditQuery] = useState('');
  const [editAdvice, setEditAdvice] = useState('');
  const [editStatus, setEditStatus] = useState('open');
  const [formError, setFormError] = useState('');

  // Fetch advisory details
  const fetchAdvisoryDetails = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await fetch(`http://localhost:5000/api/advisories/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Advisory record not found.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to fetch advisory details (Status ${response.status})`);
      }
      const data = await response.json();
      setAdvisory(data);
      
      // Initialize form values
      setEditCrop(data.crop);
      setEditQuery(data.query);
      setEditAdvice(data.advice);
      setEditStatus(data.status);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Error loading advisory details from backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvisoryDetails();
  }, [id]);

  // Handle PUT save changes
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!editCrop.trim() || !editQuery.trim() || !editAdvice.trim()) {
      setFormError('Please fill out all fields.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        crop: editCrop.trim(),
        query: editQuery.trim(),
        advice: editAdvice.trim(),
        status: editStatus
      };

      const response = await fetch(`http://localhost:5000/api/advisories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to update advisory (Status ${response.status})`);
      }

      const updated = await response.json();
      setAdvisory(updated);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Could not update the advisory record.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle DELETE advisory
  const handleDeleteAdvisory = async () => {
    const confirmDelete = window.confirm(
      'Are you sure you want to permanently delete this crop advisory record?'
    );
    if (!confirmDelete) return;

    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await fetch(`http://localhost:5000/api/advisories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to delete advisory (Status ${response.status})`);
      }

      // Successful deletion returns 204. Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Could not delete the advisory record.');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-cream min-h-[85vh] py-12 font-sans">
      {/* Dynamic Toast notifications */}
      {errorMessage && (
        <Toast message={errorMessage} onClose={() => setErrorMessage('')} />
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Navigation Back */}
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center space-x-2 text-charcoal/60 hover:text-pine font-semibold text-xs uppercase tracking-wider mb-6 group transition-colors duration-150"
        >
          <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
          <span>Back to Dashboard</span>
        </button>

        {isLoading && !advisory && (
          <div className="bg-cream border border-pine/15 py-16">
            <Loader message="Loading advisory logs..." />
          </div>
        )}

        {!isLoading && !advisory && (
          <div className="bg-cream border border-pine/15 p-12 text-center text-charcoal/60">
            <AlertCircle className="h-10 w-10 text-terracotta mx-auto mb-3" />
            <h3 className="font-serif font-bold text-lg text-pine">Record Not Available</h3>
            <p className="text-sm mt-1">This advisory does not exist or has been deleted.</p>
          </div>
        )}

        {advisory && (
          <div className="bg-cream border-2 border-pine/25 shadow-md relative overflow-hidden">
            
            {/* Top Status Header */}
            <div className="bg-pine text-cream px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-pine/10">
              <div className="flex items-center space-x-3">
                <Sprout className="h-6 w-6 text-terracotta" />
                <h1 className="font-serif font-bold text-lg sm:text-xl tracking-wide">
                  Advisory Details
                </h1>
              </div>
              <div className="mt-2 sm:mt-0 flex items-center space-x-3 text-xs">
                <span className="flex items-center space-x-1 opacity-80">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    Logged: {new Date(advisory.createdAt).toLocaleString('en-IN')}
                  </span>
                </span>
              </div>
            </div>

            {/* Read-Only Mode */}
            {!isEditing ? (
              <div className="p-6 sm:p-8 space-y-6">
                
                {/* Crop & Status Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-pine/10 pb-4 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-charcoal/50 uppercase tracking-widest block">
                      Target Crop
                    </span>
                    <h2 className="font-serif font-bold text-2xl text-pine mt-0.5">
                      {advisory.crop}
                    </h2>
                  </div>
                  <div>
                    <span className={`inline-flex items-center space-x-1.5 px-3 py-1 border text-sm font-semibold ${
                      advisory.status === 'open'
                        ? 'bg-amber-500/10 text-amber-800 border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-800 border-emerald-500/30'
                    }`}>
                      {advisory.status === 'open' ? (
                        <AlertCircle className="h-4 w-4 text-amber-700" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                      )}
                      <span className="capitalize">{advisory.status}</span>
                    </span>
                  </div>
                </div>

                {/* Supervisor Question */}
                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold text-charcoal/50 uppercase tracking-wider">
                    Supervisor Query
                  </h3>
                  <p className="text-sm sm:text-base text-charcoal leading-relaxed bg-cream-dark/10 p-4 border border-pine/10">
                    "{advisory.query}"
                  </p>
                </div>

                {/* AI / Expert Advice */}
                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold text-charcoal/50 uppercase tracking-wider">
                    Resolution / Advisory Advice
                  </h3>
                  <div className="text-sm sm:text-base text-charcoal bg-cream-dark/10 p-4 border border-pine/10 leading-relaxed whitespace-pre-wrap">
                    {advisory.advice}
                  </div>
                </div>

                {/* Action panel */}
                <div className="pt-6 border-t border-pine/15 flex flex-col sm:flex-row justify-between gap-4">
                  <button
                    onClick={handleDeleteAdvisory}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center space-x-2 px-4 py-2 border border-red-200 text-red-700 hover:bg-red-50 font-medium text-xs transition-colors shrink-0"
                    id="delete-advisory-btn"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Record</span>
                  </button>

                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center justify-center space-x-2 px-5 py-2 bg-pine hover:bg-pine-light text-cream font-medium text-xs border border-pine transition-colors"
                    id="edit-advisory-btn"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span>Edit Advisory</span>
                  </button>
                </div>

              </div>
            ) : (
              /* Edit Mode Form */
              <form onSubmit={handleSaveChanges} className="p-6 sm:p-8 space-y-5 text-sm text-charcoal">
                
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold">
                    {formError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-charcoal/70 uppercase tracking-wider mb-1.5">
                    Target Crop
                  </label>
                  <input
                    type="text"
                    required
                    value={editCrop}
                    onChange={(e) => setEditCrop(e.target.value)}
                    className="w-full bg-cream border border-pine/15 py-2 px-3 focus:outline-none focus:border-terracotta"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal/70 uppercase tracking-wider mb-1.5">
                    Supervisor Query
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={editQuery}
                    onChange={(e) => setEditQuery(e.target.value)}
                    className="w-full bg-cream border border-pine/15 py-2 px-3 focus:outline-none focus:border-terracotta resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal/70 uppercase tracking-wider mb-1.5">
                    Advisory Recommendation
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={editAdvice}
                    onChange={(e) => setEditAdvice(e.target.value)}
                    className="w-full bg-cream border border-pine/15 py-2 px-3 focus:outline-none focus:border-terracotta"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal/70 uppercase tracking-wider mb-1.5">
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full bg-cream border border-pine/15 py-2 px-3 focus:outline-none focus:border-terracotta text-sm"
                  >
                    <option value="open">Open</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                <div className="pt-6 border-t border-pine/15 flex space-x-3 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormError('');
                      // Reset values
                      setEditCrop(advisory.crop);
                      setEditQuery(advisory.query);
                      setEditAdvice(advisory.advice);
                      setEditStatus(advisory.status);
                    }}
                    className="px-4 py-2 border border-pine/20 hover:bg-cream-dark/20 transition-all font-semibold text-xs text-charcoal"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center space-x-1.5 px-5 py-2 bg-pine hover:bg-pine-light text-cream font-semibold text-xs border border-pine hover:border-pine-light transition-all shadow-sm"
                    id="save-changes-btn"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>

              </form>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
