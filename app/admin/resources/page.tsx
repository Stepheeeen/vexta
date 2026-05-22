'use client';

import { AdminLayout } from '@/components/admin-layout';
import { FileText, Video, Presentation, Upload, Trash2, Loader2, Link as LinkIcon, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  fileType: string;
  language: string;
  size: string;
  createdAt: string;
}

export default function AdminResourcesPage() {
  const { toast } = useToast();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileType, setFileType] = useState('pdf');
  const [language, setLanguage] = useState('en');

  const fetchResources = async () => {
    try {
      const res = await fetch('/api/resources');
      if (res.ok) {
        const data = await res.json();
        setResources(data.resources || []);
      }
    } catch (err) {
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      // Auto fill title if empty
      if (!title) {
        const nameWithoutExt = selected.name.substring(0, selected.name.lastIndexOf('.')) || selected.name;
        setTitle(nameWithoutExt);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({
        title: 'Validation Error',
        description: 'Please select a file to upload.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('fileType', fileType);
      formData.append('language', language);

      const res = await fetch('/api/admin/resources', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to upload resource');

      toast({
        title: 'Success',
        description: 'Resource uploaded and registered successfully.',
      });

      // Reset form
      setFile(null);
      setTitle('');
      setDescription('');
      setFileType('pdf');
      setLanguage('en');
      // Reset input element
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      await fetchResources();
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Upload Failed',
        description: err.message || 'An error occurred during file upload.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource? This will remove the file from the server.')) return;

    try {
      const res = await fetch('/api/admin/resources', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to delete resource');

      toast({
        title: 'Deleted',
        description: 'Resource deleted successfully.',
      });

      await fetchResources();
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Delete Failed',
        description: err.message || 'An error occurred during resource deletion.',
        variant: 'destructive',
      });
    }
  };

  const fileTypes = [
    { value: 'business_explanation', label: 'Business Explainer' },
    { value: 'pdf', label: 'PDF Guide' },
    { value: 'presentation', label: 'Presentation' },
    { value: 'video', label: 'Video' },
    { value: 'marketing', label: 'Marketing Media' }
  ];

  const languages = [
    { value: 'en', label: 'English 🇺🇸' },
    { value: 'es', label: 'Español 🇪🇸' },
    { value: 'vi', label: 'Tiếng Việt 🇻🇳' },
    { value: 'pt', label: 'Português 🇵🇹' },
    { value: 'ko', label: '한국어 🇰🇷' },
    { value: 'fr', label: 'Français 🇫🇷' }
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Upload & Manage Resources</h1>
        <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
          Upload PDFs, presentations, videos, and marketing material templates for user downloads in multiple languages.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Upload Form Card */}
        <div className="lg:col-span-1 bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
            <Plus className="w-4 h-4 text-violet-500" />
            Upload New File
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Select File
              </label>
              <input
                id="file-input"
                type="file"
                onChange={handleFileChange}
                required
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 dark:file:bg-white/5 dark:file:text-white dark:hover:file:bg-white/10"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Resource Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Marketing Presentation PDF"
                required
                disabled={submitting}
                className="w-full bg-slate-50 dark:bg-white/3 border border-slate-200 dark:border-white/8 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a brief summary for the users..."
                rows={3}
                disabled={submitting}
                className="w-full bg-slate-50 dark:bg-white/3 border border-slate-200 dark:border-white/8 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 transition-all font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Category
                </label>
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/3 border border-slate-200 dark:border-white/8 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-violet-500 transition-all"
                >
                  {fileTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/3 border border-slate-200 dark:border-white/8 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-violet-500 transition-all"
                >
                  {languages.map(l => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-violet-600/15"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading File...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload Resource</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Resources List Table Card */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0A0F14]/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm overflow-hidden">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-5">Uploaded Resources List</h2>

          {loading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-violet-600 dark:text-violet-400" />
            </div>
          ) : resources.length === 0 ? (
            <div className="text-center py-16 text-xs text-slate-400 dark:text-gray-500 font-mono">
              No files uploaded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/5 text-[9px] font-mono text-slate-400 uppercase tracking-widest">
                    <th className="pb-3 pr-4">Title & Type</th>
                    <th className="pb-3 pr-4">Language</th>
                    <th className="pb-3 pr-4">Size</th>
                    <th className="pb-3 pr-4">Upload Date</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
                  {resources.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-white/1">
                      <td className="py-3.5 pr-4">
                        <div className="font-semibold text-slate-800 dark:text-white">{item.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase">{item.fileType.replace('_', ' ')}</div>
                      </td>
                      <td className="py-3.5 pr-4 font-mono font-bold text-slate-700 dark:text-gray-300">
                        {item.language.toUpperCase()}
                      </td>
                      <td className="py-3.5 pr-4 font-mono text-slate-500 dark:text-gray-400">{item.size}</td>
                      <td className="py-3.5 pr-4 text-slate-500 dark:text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                          title="Delete resource"
                        >
                          <Trash2 className="w-4 h-4" />
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
    </AdminLayout>
  );
}
