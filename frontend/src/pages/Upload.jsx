import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { getCategories, analyzeResumes } from '../services/api';
import { AppContext } from '../App';
import { motion } from 'framer-motion';
import { UploadCloud, File, X, Loader2, Zap } from 'lucide-react';

const Upload = () => {
  const [categories, setCategories] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { setResults } = useContext(AppContext);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  const onDrop = useCallback(acceptedFiles => {
    const pdfFiles = acceptedFiles.filter(file => file.type === 'application/pdf');
    if (pdfFiles.length !== acceptedFiles.length) {
      setError('Only PDF files are allowed.');
    }
    setFiles(prev => [...prev, ...pdfFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: {'application/pdf': ['.pdf']} });

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategory || !selectedRole || !jobDescription || files.length === 0) {
      setError('Please fill all fields and upload at least one resume.');
      return;
    }
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('category', selectedCategory);
    formData.append('role', selectedRole);
    formData.append('job_description', jobDescription);
    files.forEach(file => formData.append('files', file));

    try {
      const data = await analyzeResumes(formData);
      setResults(data);
      navigate('/results');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze resumes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
      <header className="mb-10">
        <h1 className="text-4xl font-bold mb-2">Upload & Analyze</h1>
        <p className="text-gray-400">Provide job details and candidate resumes to rank the best matches.</p>
      </header>

      {error && (
        <div className="p-4 mb-6 bg-red-500/10 border border-red-500/50 text-red-400 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Category</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => { setSelectedCategory(e.target.value); setSelectedRole(''); }}
              className="w-full bg-surface border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-brand"
            >
              <option value="">Select Category</option>
              {categories && Object.keys(categories).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Role</label>
            <select 
              value={selectedRole} 
              onChange={(e) => setSelectedRole(e.target.value)}
              disabled={!selectedCategory}
              className="w-full bg-surface border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-brand disabled:opacity-50"
            >
              <option value="">Select Role</option>
              {categories && selectedCategory && Object.keys(categories[selectedCategory]).map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Job Description</label>
          <textarea 
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={5}
            className="w-full bg-surface border border-gray-700 rounded-xl p-4 text-white focus:outline-none focus:border-brand resize-none"
            placeholder="Paste the job description here..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Resumes (PDF Only)</label>
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-brand bg-brand/5' : 'border-gray-700 hover:border-gray-500 bg-surface'
            }`}
          >
            <input {...getInputProps()} />
            <UploadCloud size={48} className="mx-auto text-gray-500 mb-4" />
            <p className="text-gray-300 text-lg">Drag & drop PDF files here</p>
            <p className="text-gray-500 text-sm mt-2">or click to browse from your computer</p>
          </div>

          {files.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-surface border border-gray-800 rounded-lg">
                  <div className="flex items-center gap-3 truncate">
                    <File size={16} className="text-brand-light flex-shrink-0" />
                    <span className="text-sm text-gray-300 truncate">{file.name}</span>
                  </div>
                  <button type="button" onClick={() => removeFile(idx)} className="text-gray-500 hover:text-red-400">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 py-4 bg-brand hover:bg-brand-dark text-white rounded-xl font-bold text-lg transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] disabled:opacity-70 disabled:cursor-not-allowed group"
        >
          {loading ? (
            <><Loader2 className="animate-spin" size={24} /> Processing...</>
          ) : (
            <><Zap size={24} className="group-hover:animate-bounce" /> Analyze Candidates</>
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default Upload;
