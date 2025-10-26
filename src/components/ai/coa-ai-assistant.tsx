'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Badge } from '@/shared/ui/badge';
import { 
  Bot, 
  Sparkles, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Lightbulb,
  Shield,
  BarChart3,
  X
} from 'lucide-react';

interface AISuggestion {
  code: string;
  name: string;
  accountType: string;
  category: string;
  parentCode?: string;
  description: string;
  isActive: boolean;
}

interface ComplianceValidation {
  isValid: boolean;
  issues: string[];
  recommendations: string[];
  complianceScore: number;
}

interface SearchResult {
  accounts: Array<{
    code: string;
    name: string;
    accountType: string;
    relevanceScore: number;
    reason: string;
  }>;
  totalFound: number;
  searchStrategy: string;
}

interface CoaAIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CoaAIAssistant({ isOpen, onClose }: CoaAIAssistantProps) {
  const [activeTab, setActiveTab] = useState<'suggest' | 'search' | 'validate'>('suggest');
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [validation, setValidation] = useState<ComplianceValidation | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Suggestion form
  const [description, setDescription] = useState('');
  const [businessType, setBusinessType] = useState('');

  // Search form
  const [searchQuery, setSearchQuery] = useState('');

  // Validation form
  const [accountStructure, setAccountStructure] = useState('');

  const handleSuggestion = async () => {
    if (!description.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/coa/suggest-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, businessType }),
      });

      const data = await response.json();

      if (data.success) {
        setSuggestion(data.suggestion);
      } else {
        setError(data.error || 'Gagal mendapatkan saran AI');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat menghubungi AI');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/coa/search-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });

      const data = await response.json();

      if (data.success) {
        setSearchResults(data.searchResults);
      } else {
        setError(data.error || 'Gagal melakukan pencarian AI');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat menghubungi AI');
    } finally {
      setLoading(false);
    }
  };

  const handleValidation = async () => {
    if (!accountStructure.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/coa/validate-structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountStructure: JSON.parse(accountStructure) }),
      });

      const data = await response.json();

      if (data.success) {
        setValidation(data.validation);
      } else {
        setError(data.error || 'Gagal melakukan validasi AI');
      }
    } catch (err) {
      setError('Format JSON tidak valid atau terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const applySuggestion = () => {
    if (suggestion) {
      // Emit event atau callback untuk apply suggestion
      window.dispatchEvent(new CustomEvent('coa-ai-apply-suggestion', {
        detail: suggestion
      }));
    }
  };

  // Handle ESC key to close modal and focus management
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      // Focus first focusable element
      const firstFocusable = document.querySelector('input, button, textarea, select') as HTMLElement;
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-assistant-title"
      aria-describedby="ai-assistant-description"
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <Card className="relative flex flex-col max-h-[90vh]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 flex-shrink-0">
            <div>
              <CardTitle id="ai-assistant-title" className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Assistant untuk Chart of Accounts
              </CardTitle>
              <CardDescription id="ai-assistant-description">
                Dapatkan bantuan AI untuk membuat, mencari, dan memvalidasi akun dengan standar PSAK Indonesia
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100"
              title="Tutup (ESC)"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="space-y-6 overflow-y-auto flex-1">
        {/* Tab Navigation */}
        <div className="flex gap-2 border-b">
          <Button
            variant={activeTab === 'suggest' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('suggest')}
            className="flex items-center gap-2"
          >
            <Lightbulb className="h-4 w-4" />
            Saran Akun
          </Button>
          <Button
            variant={activeTab === 'search' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('search')}
            className="flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            Pencarian AI
          </Button>
          <Button
            variant={activeTab === 'validate' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('validate')}
            className="flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            Validasi
          </Button>
        </div>

        {/* Suggestion Tab */}
        {activeTab === 'suggest' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="description">Deskripsi Akun</Label>
                <Input
                  id="description"
                  placeholder="Contoh: Kas di Bank BCA, Piutang Usaha, dll"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="businessType">Jenis Bisnis (Opsional)</Label>
                <Input
                  id="businessType"
                  placeholder="Contoh: Perdagangan, Jasa, Manufaktur"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                />
              </div>
            </div>

            <Button 
              onClick={handleSuggestion} 
              disabled={loading || !description.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  AI sedang menganalisis...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Dapatkan Saran AI
                </>
              )}
            </Button>

            {suggestion && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-800 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Saran AI
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Kode Akun</Label>
                      <div className="font-mono text-lg font-bold text-green-700">
                        {suggestion.code}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Nama Akun</Label>
                      <div className="font-semibold text-green-700">
                        {suggestion.name}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Tipe Akun</Label>
                      <Badge variant="outline" className="text-green-700">
                        {suggestion.accountType}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Kategori</Label>
                      <div className="text-sm text-green-700">
                        {suggestion.category}
                      </div>
                    </div>
                  </div>
                  
                  {suggestion.parentCode && (
                    <div>
                      <Label className="text-sm font-medium">Parent Akun</Label>
                      <div className="font-mono text-sm text-green-700">
                        {suggestion.parentCode}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label className="text-sm font-medium">Deskripsi</Label>
                    <div className="text-sm text-gray-700 bg-white p-2 rounded border">
                      {suggestion.description}
                    </div>
                  </div>

                  <Button onClick={applySuggestion} className="w-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Terapkan Saran
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="searchQuery">Pencarian dengan Bahasa Alami</Label>
              <Input
                id="searchQuery"
                placeholder="Contoh: semua akun piutang, akun untuk biaya operasional, dll"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Button 
              onClick={handleSearch} 
              disabled={loading || !searchQuery.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  AI sedang mencari...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Cari dengan AI
                </>
              )}
            </Button>

            {searchResults && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-800">
                    Hasil Pencarian AI
                  </CardTitle>
                  <CardDescription>
                    Ditemukan {searchResults.totalFound} akun yang relevan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {searchResults.accounts.map((account, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-mono font-bold">{account.code}</div>
                          <div className="font-semibold">{account.name}</div>
                          <div className="text-sm text-gray-600">{account.reason}</div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">
                            {account.accountType}
                          </Badge>
                          <div className="text-sm text-gray-500 mt-1">
                            Relevansi: {Math.round(account.relevanceScore * 100)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Validation Tab */}
        {activeTab === 'validate' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="accountStructure">Struktur Akun (JSON)</Label>
              <textarea
                id="accountStructure"
                className="w-full p-3 border rounded-md font-mono text-sm"
                rows={8}
                placeholder='{"accounts": [{"code": "1-1-1", "name": "Kas", "type": "ASSET"}]}'
                value={accountStructure}
                onChange={(e) => setAccountStructure(e.target.value)}
              />
            </div>

            <Button 
              onClick={handleValidation} 
              disabled={loading || !accountStructure.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  AI sedang memvalidasi...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Validasi dengan AI
                </>
              )}
            </Button>

            {validation && (
              <Card className={validation.isValid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${validation.isValid ? 'text-green-800' : 'text-red-800'}`}>
                    {validation.isValid ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <AlertCircle className="h-5 w-5" />
                    )}
                    Hasil Validasi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold">
                      {validation.complianceScore}/100
                    </div>
                    <div>
                      <div className="font-semibold">Skor Compliance</div>
                      <div className="text-sm text-gray-600">
                        {validation.complianceScore >= 80 ? 'Sangat Baik' : 
                         validation.complianceScore >= 60 ? 'Baik' : 
                         validation.complianceScore >= 40 ? 'Cukup' : 'Perlu Perbaikan'}
                      </div>
                    </div>
                  </div>

                  {validation.issues.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-red-700">Masalah yang Ditemukan:</Label>
                      <ul className="list-disc list-inside text-sm text-red-600 mt-1">
                        {validation.issues.map((issue, index) => (
                          <li key={index}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {validation.recommendations.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-blue-700">Rekomendasi:</Label>
                      <ul className="list-disc list-inside text-sm text-blue-600 mt-1">
                        {validation.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Error:</span>
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
        </Card>
      </div>
    </div>
  );
}
