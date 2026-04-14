import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  BookOpen, 
  MoreVertical, 
  Eye, 
  Edit3, 
  Trash2, 
  Calendar, 
  User, 
  Store,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import * as supabaseService from '../../services/supabaseService';
import { Article, Merchant } from '../../types/database';
import { ArticleEditorModal } from '../../components/admin/ArticleEditorModal';

export const AdminArticles: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMerchant, setFilterMerchant] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [articlesData, merchantsData] = await Promise.all([
        supabaseService.getArticles(),
        supabaseService.getMerchants()
      ]);
      setArticles(articlesData);
      setMerchants(merchantsData);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('Failed to load articles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getMerchantName = (merchantId: string | number) => {
    const idStr = String(merchantId);
    return merchants.find(m => String(m.id) === idStr)?.name || 'Unknown';
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || article.status === filterStatus;
    const matchesMerchant = filterMerchant === 'all' || String(article.merchant_id) === String(filterMerchant);
    return matchesSearch && matchesStatus && matchesMerchant;
  });

  const handleEdit = (article: Article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedArticle(null);
    setIsModalOpen(true);
  };

  const handleSave = async (articleData: Partial<Article>) => {
    try {
      // Strip metadata fields
      const { id, created_at, updated_at, ...saveData } = articleData as any;

      if (selectedArticle) {
        await supabaseService.updateArticle(selectedArticle.id, saveData);
        await supabaseService.createAuditLog({
          admin_email: 'yogev@intango.com',
          action_type: 'edited',
          entity_type: 'article',
          entity_id: selectedArticle.id,
          entity_name: saveData.title || selectedArticle.title,
          details: `Article ${saveData.title} updated`
        });
      } else {
        const newArticle = await supabaseService.createArticle(saveData);
        await supabaseService.createAuditLog({
          admin_email: 'yogev@intango.com',
          action_type: 'created',
          entity_type: 'article',
          entity_id: newArticle.id,
          entity_name: newArticle.title,
          details: `Article ${newArticle.title} created`
        });
      }
      await fetchData();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving article:', err);
      alert('Failed to save article.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await supabaseService.deleteArticle(id);
        await fetchData();
      } catch (err) {
        console.error('Error deleting article:', err);
        alert('Failed to delete article.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold text-gray-900">Articles / Research</h1>
          <p className="text-gray-500 text-sm">Manage content articles and research connected to merchants.</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Article
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
          <button onClick={fetchData} className="ml-auto text-sm font-bold underline">Retry</button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by title..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-full text-sm"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
              <Store className="w-4 h-4 text-gray-400" />
              <select 
                value={filterMerchant}
                onChange={(e) => setFilterMerchant(e.target.value)}
                className="bg-transparent text-sm font-medium text-gray-600 focus:outline-none cursor-pointer"
              >
                <option value="all">All Merchants</option>
                {merchants.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent text-sm font-medium text-gray-600 focus:outline-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Article</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Merchant</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Author</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                          {article.cover_image_url ? (
                            <img 
                              src={article.cover_image_url} 
                              alt={article.title} 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50">
                              <BookOpen className="w-6 h-6 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{article.title}</p>
                          <p className="text-[10px] text-gray-500 font-mono truncate max-w-[200px]">{article.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Store className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-600">{getMerchantName(article.merchant_id)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-600">{article.author}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {article.publish_date ? new Date(article.publish_date).toLocaleDateString() : 'Not set'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        article.status === 'published' 
                          ? 'bg-green-50 text-green-600' 
                          : article.status === 'draft'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-gray-50 text-gray-600'
                      }`}>
                        {article.status === 'published' ? <CheckCircle2 className="w-3 h-3" /> : article.status === 'draft' ? <Clock className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {article.status}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(article)}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(article.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {filteredArticles.length === 0 && !loading && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-headline font-bold text-gray-900 mb-1">No articles found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      <ArticleEditorModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        article={selectedArticle}
        onSave={handleSave}
        merchants={merchants}
      />
    </div>
  );
};
