import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Upload, 
  Grid, 
  List, 
  MoreVertical, 
  Download, 
  Trash2, 
  ExternalLink,
  Plus,
  X,
  FileText,
  Image as ImageIcon,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Eye,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as supabaseService from '../../services/supabaseService';
import { Asset, AssetType } from '../../types/database';

export const AdminMedia: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [availableBuckets, setAvailableBuckets] = useState<any[]>([]);
  const [bucketError, setBucketError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    let currentError: string | null = null;
    
    try {
      const [assetsData, bucketsData] = await Promise.all([
        supabaseService.getAssets().catch(err => {
          if (err.message?.includes('row-level security')) {
            currentError = 'Table RLS Violation: You need to create policies for the "assets" table in your Supabase dashboard. See the SQL instructions below.';
            return [];
          }
          throw err;
        }),
        supabaseService.listBuckets().catch(() => [])
      ]);
      
      setAssets(assetsData);
      setAvailableBuckets(bucketsData);
      
      if (!currentError) {
        if (bucketsData.length === 0) {
          currentError = 'No storage buckets found. Please create a bucket named "assets" in your Supabase dashboard.';
        } else if (!bucketsData.find(b => b.name === 'assets')) {
          currentError = `Bucket "assets" not found. Using "${bucketsData[0].name}" instead.`;
        }
      }
      
      setBucketError(currentError);
    } catch (err) {
      console.error('Error fetching assets:', err);
      setBucketError('An unexpected error occurred while fetching assets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.asset_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.linked_entity_id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || asset.asset_type === filterType;
    return matchesSearch && matchesType;
  });

  const getAssetIcon = (type: string | null) => {
    switch (type) {
      case 'merchant_logo': return <ImageIcon className="w-5 h-5 text-blue-500" />;
      case 'article_image': return <FileText className="w-5 h-5 text-emerald-500" />;
      case 'editorial_image': return <FileCode className="w-5 h-5 text-purple-500" />;
      default: return <ImageIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const bucket = availableBuckets.find(b => b.name === 'assets') ? 'assets' : (availableBuckets[0]?.name || 'assets');
        const filePath = `${fileName}`;

        // 1. Upload to Storage
        await supabaseService.uploadFile(bucket, filePath, file);
        
        // 2. Get Public URL
        const publicUrl = supabaseService.getPublicUrl(bucket, filePath);

        // 3. Create DB Record
        await supabaseService.createAsset({
          asset_name: file.name,
          asset_type: 'generic_asset',
          file_url: publicUrl,
          file_size: `${(file.size / 1024).toFixed(1)} KB`,
          upload_date: new Date().toISOString(),
          usage_count: 0
        });

        setUploadProgress(((i + 1) / files.length) * 100);
      }
      
      await fetchData();
      setIsUploadModalOpen(false);
    } catch (err: any) {
      console.error('Error uploading files:', err);
      if (err.message?.includes('row-level security')) {
        alert('Storage RLS Violation: You need to create policies in your Supabase dashboard to allow uploads. See the instructions at the top of the Media Library page.');
      } else {
        alert(`Failed to upload files. Error: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAsset = async (asset: Asset) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;

    try {
      // 1. Delete from Storage
      if (asset.file_url) {
        await supabaseService.deleteFileByUrl(asset.file_url);
      }
      
      // 2. Delete DB record
      await supabaseService.deleteAsset(asset.id);
      
      await fetchData();
      setSelectedAsset(null);
    } catch (err) {
      console.error('Error deleting asset:', err);
      alert('Failed to delete asset.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Bucket Warning & Setup Instructions */}
      {bucketError && (
        <div className="bg-amber-50 border border-amber-100 p-6 rounded-[32px] space-y-4 shadow-sm">
          <div className="flex items-center justify-between gap-3 text-amber-600">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-bold uppercase tracking-wider">{bucketError}</p>
            </div>
            {bucketError.includes('not found') && (
              <button 
                onClick={async () => {
                  try {
                    await supabaseService.createBucket('assets');
                    await fetchData();
                  } catch (err) {
                    console.error('Error creating bucket:', err);
                    alert('Failed to create bucket. You may need to create it manually in the Supabase dashboard.');
                  }
                }}
                className="px-4 py-2 bg-amber-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-amber-700 transition-all shadow-sm"
              >
                Create "assets" Bucket
              </button>
            )}
          </div>
          
          <div className="p-4 bg-white/50 rounded-2xl border border-amber-100/50 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-widest">Supabase Setup Required</p>
              <button 
                onClick={() => {
                  const sql = `-- 1. Create the assets table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_name TEXT NOT NULL,
    asset_type TEXT,
    file_url TEXT NOT NULL,
    file_size TEXT,
    upload_date TIMESTAMPTZ DEFAULT now(),
    usage_count INTEGER DEFAULT 0,
    linked_entity_id TEXT,
    linked_entity_type TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Allow public access to the "assets" table (metadata)
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow Public Insert" ON public.assets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow Public Select" ON public.assets FOR SELECT USING (true);
CREATE POLICY "Allow Public Delete" ON public.assets FOR DELETE USING (true);

-- 3. Allow public uploads to the "assets" bucket
-- Note: Make sure the bucket "assets" is created first
CREATE POLICY "Allow Public Uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'assets');
CREATE POLICY "Allow Public Selection" ON storage.objects FOR SELECT USING (bucket_id = 'assets');
CREATE POLICY "Allow Public Deletion" ON storage.objects FOR DELETE USING (bucket_id = 'assets');`;
                  navigator.clipboard.writeText(sql);
                  alert('SQL copied to clipboard!');
                }}
                className="flex items-center gap-2 text-[10px] font-bold text-amber-600 hover:text-amber-700 uppercase tracking-widest"
              >
                <Download className="w-3 h-3" />
                Copy SQL
              </button>
            </div>
            <p className="text-[10px] text-amber-600 leading-relaxed">
              If you get a "Row-Level Security" error or "Relation does not exist" error, run this SQL in your Supabase SQL Editor:
            </p>
            <pre className="p-3 bg-gray-900 text-gray-300 rounded-xl text-[10px] font-mono overflow-x-auto max-h-48">
{`-- 1. Create the assets table
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_name TEXT NOT NULL,
    asset_type TEXT,
    file_url TEXT NOT NULL,
    file_size TEXT,
    upload_date TIMESTAMPTZ DEFAULT now(),
    usage_count INTEGER DEFAULT 0,
    linked_entity_id TEXT,
    linked_entity_type TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS and add policies for "assets" table
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow Public Insert" ON public.assets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow Public Select" ON public.assets FOR SELECT USING (true);
CREATE POLICY "Allow Public Delete" ON public.assets FOR DELETE USING (true);

-- 3. Add policies for "assets" storage bucket
CREATE POLICY "Allow Public Uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'assets');
CREATE POLICY "Allow Public Selection" ON storage.objects FOR SELECT USING (bucket_id = 'assets');
CREATE POLICY "Allow Public Deletion" ON storage.objects FOR DELETE USING (bucket_id = 'assets');`}
            </pre>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase italic">Media Library</h1>
          <p className="text-gray-500 font-medium tracking-tight">Manage all platform assets and images</p>
        </div>
        <button 
          onClick={() => setIsUploadModalOpen(true)}
          className="px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 uppercase tracking-widest text-xs"
        >
          <Upload className="w-4 h-4" />
          Upload New Asset
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Assets', value: assets.length, icon: ImageIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Merchant Logos', value: assets.filter(a => a.asset_type === 'merchant_logo').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Article Images', value: assets.filter(a => a.asset_type === 'article_image').length, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Unused Assets', value: assets.filter(a => a.usage_count === 0).length, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <div key={i} className="p-4 bg-white border border-gray-100 rounded-3xl shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl font-black text-gray-900 italic tracking-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex flex-1 items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-2xl border border-gray-100">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          {['all', 'merchant_logo', 'article_image', 'editorial_image', 'generic_asset'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all uppercase tracking-wider ${
                filterType === type 
                ? 'bg-primary text-white shadow-md' 
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              {type.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid/List */}
      {loading ? (
        <div className="p-20 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading assets...</p>
        </div>
      ) : assets.length === 0 ? (
        <div className="p-20 text-center bg-white rounded-[40px] border border-gray-100">
          <ImageIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase italic">No assets found</h3>
          <p className="text-gray-500 font-medium">Upload your first image to get started</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredAssets.map((asset) => (
            <motion.div
              layout
              key={asset.id}
              onClick={() => setSelectedAsset(asset)}
              className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden"
            >
              <div className="aspect-square bg-gray-50 relative overflow-hidden">
                <img 
                  src={asset.file_url} 
                  alt={asset.asset_name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Eye className="w-8 h-8 text-white drop-shadow-lg" />
                </div>
                <div className="absolute top-3 left-3">
                  <div className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm">
                    {getAssetIcon(asset.asset_type)}
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-1">
                <p className="text-xs font-bold text-gray-900 truncate">{asset.asset_name}</p>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{asset.file_size}</p>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{asset.usage_count} uses</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Asset</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Linked To</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Size</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        <img src={asset.file_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <span className="text-sm font-bold text-gray-900">{asset.asset_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getAssetIcon(asset.asset_type)}
                      <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">{asset.asset_type?.replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {asset.linked_entity_id ? (
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-900">{asset.linked_entity_id}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{asset.linked_entity_type}</span>
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-gray-400 italic">Unlinked</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-widest">{asset.file_size}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setSelectedAsset(asset)}
                        className="p-2 text-gray-400 hover:text-primary transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteAsset(asset)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Asset Preview Modal */}
      <AnimatePresence>
        {selectedAsset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAsset(null)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row h-full max-h-[800px]"
            >
              {/* Preview Area */}
              <div className="flex-1 bg-gray-100 flex items-center justify-center p-8 relative">
                <img 
                  src={selectedAsset.file_url} 
                  alt={selectedAsset.asset_name}
                  className="max-w-full max-h-full object-contain shadow-2xl rounded-2xl"
                  referrerPolicy="no-referrer"
                />
                <button 
                  onClick={() => setSelectedAsset(null)}
                  className="absolute top-6 left-6 p-3 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg text-gray-500 hover:text-gray-900 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Sidebar Details */}
              <div className="w-full md:w-80 bg-white border-l border-gray-100 flex flex-col">
                <div className="p-8 space-y-8 flex-1 overflow-y-auto">
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-gray-900 italic tracking-tight uppercase leading-tight">Asset Details</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Metadata & Usage</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">File Name</label>
                      <p className="text-sm font-bold text-gray-900 break-all">{selectedAsset.asset_name}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</label>
                        <div className="flex items-center gap-2">
                          {getAssetIcon(selectedAsset.asset_type)}
                          <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">{selectedAsset.asset_type?.replace('_', ' ')}</span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Size</label>
                        <p className="text-xs font-bold text-gray-900 uppercase tracking-widest">{selectedAsset.file_size}</p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Linked Entity</label>
                      {selectedAsset.linked_entity_id ? (
                        <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-900">{selectedAsset.linked_entity_id}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{selectedAsset.linked_entity_type}</span>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-400" />
                        </div>
                      ) : (
                        <p className="text-xs font-medium text-gray-400 italic">Not linked to any content</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Upload Date</label>
                      <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">{new Date(selectedAsset.upload_date).toLocaleDateString()}</p>
                    </div>

                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-1">
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Usage Stats</p>
                      <p className="text-lg font-black text-emerald-900 italic tracking-tight">Used {selectedAsset.usage_count} times</p>
                    </div>
                  </div>
                </div>

                <div className="p-8 border-t border-gray-100 grid grid-cols-2 gap-3">
                  <a 
                    href={selectedAsset.file_url} 
                    download 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-3 bg-gray-50 text-gray-700 rounded-2xl font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                  <button 
                    onClick={() => handleDeleteAsset(selectedAsset)}
                    className="px-4 py-3 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                  <button className="col-span-2 px-4 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[10px] shadow-lg">
                    <Upload className="w-4 h-4" />
                    Replace Asset
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl p-8 space-y-8"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-gray-900 italic tracking-tight uppercase leading-tight">Upload Assets</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Add new images to the library</p>
                </div>
                <button 
                  onClick={() => setIsUploadModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="relative">
                <input 
                  type="file" 
                  multiple 
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  disabled={isUploading}
                />
                <div className={`border-4 border-dashed rounded-[32px] p-12 flex flex-col items-center justify-center space-y-4 transition-all ${
                  isUploading ? 'bg-gray-50 border-gray-200' : 'border-gray-100 hover:border-primary/20 hover:bg-primary/5'
                }`}>
                  {isUploading ? (
                    <>
                      <Loader2 className="w-12 h-12 text-primary animate-spin" />
                      <div className="w-full max-w-xs bg-gray-200 rounded-full h-2 mt-4">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-sm font-bold text-gray-900">Uploading... {Math.round(uploadProgress)}%</p>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8 text-gray-400 group-hover:text-primary transition-colors" />
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">Drag & drop files here</p>
                        <p className="text-sm text-gray-500">or click to browse from your computer</p>
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Max file size: 5MB. Supported: JPG, PNG, WEBP</p>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Asset Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {['merchant_logo', 'article_image', 'editorial_image', 'generic_asset'].map((type) => (
                    <button
                      key={type}
                      className="p-4 border border-gray-100 rounded-2xl text-left hover:border-primary/20 hover:bg-primary/5 transition-all group"
                    >
                      <p className="text-xs font-bold text-gray-900 uppercase tracking-wider group-hover:text-primary">{type.replace('_', ' ')}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button 
                  onClick={() => setIsUploadModalOpen(false)}
                  className="flex-1 px-6 py-4 bg-gray-50 text-gray-700 rounded-2xl font-bold hover:bg-gray-100 transition-all uppercase tracking-widest text-xs"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
