'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { trpc } from '@/lib/trpc/client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, Sparkles, Lightbulb, Wand2 } from 'lucide-react';

const ACCOUNT_TYPES = [
  { value: 'ASSET', label: 'Asset' },
  { value: 'LIABILITY', label: 'Liability' },
  { value: 'EQUITY', label: 'Equity' },
  { value: 'REVENUE', label: 'Revenue' },
  { value: 'EXPENSE', label: 'Expense' },
];

export default function NewCoaPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [parentId, setParentId] = useState('');
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [aiDescription, setAiDescription] = useState('');
  const [dynamicQuickActions, setDynamicQuickActions] = useState<any[]>([]);
  const [isAnalyzingGaps, setIsAnalyzingGaps] = useState(false);
  const [coaAnalysis, setCoaAnalysis] = useState<any>(null);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  const { data: accounts } = trpc.masterData.coa.list.useQuery({ page: 1, limit: 500 });
  const createMutation = trpc.masterData.coa.create.useMutation();

  // Handle AI suggestion apply event
  useEffect(() => {
    const handleApplySuggestion = (event: CustomEvent) => {
      const suggestion = event.detail;
      setCode(suggestion.code);
      setName(suggestion.name);
      setType(suggestion.accountType);
      if (suggestion.parentCode) {
        // Find parent account by code
        const parentAccount = accounts?.data.find((a: any) => a.code === suggestion.parentCode);
        if (parentAccount) {
          setParentId(parentAccount.id);
        }
      }
      setIsAIOpen(false);
    };

    window.addEventListener('coa-ai-apply-suggestion', handleApplySuggestion as EventListener);
    
    return () => {
      window.removeEventListener('coa-ai-apply-suggestion', handleApplySuggestion as EventListener);
    };
  }, [accounts]);

  // Analyze COA gaps for sidebar AI
  const analyzeCOAGaps = async () => {
    if (!accounts?.data) return;
    
    setIsAnalyzingGaps(true);
    try {
      const response = await fetch('/api/ai/coa/analyze-gaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          existingAccounts: accounts.data,
          businessType: 'Umum'
        }),
      });

      const data = await response.json();
      if (data.success) {
        setDynamicQuickActions(data.suggestedAccounts || []);
        setCoaAnalysis(data.analysis || null);
      }
    } catch (error) {
      console.error('Error analyzing COA gaps:', error);
      // Fallback to basic quick actions if API fails
      setDynamicQuickActions(getBasicQuickActions());
    } finally {
      setIsAnalyzingGaps(false);
    }
  };

  // Get basic quick actions as fallback
  const getBasicQuickActions = () => [
    { name: 'Kas', type: 'ASSET', code: '1-1-1', priority: 'high', reason: 'Akun kas dasar untuk transaksi harian' },
    { name: 'Bank BCA', type: 'ASSET', code: '1-1-2', priority: 'high', reason: 'Akun bank untuk penyimpanan dana' },
    { name: 'Piutang Usaha', type: 'ASSET', code: '1-2-1', priority: 'medium', reason: 'Akun piutang untuk penjualan kredit' },
    { name: 'Persediaan', type: 'ASSET', code: '1-3-1', priority: 'medium', reason: 'Akun persediaan barang dagang' },
    { name: 'Hutang Usaha', type: 'LIABILITY', code: '2-1-1', priority: 'high', reason: 'Akun hutang untuk pembelian kredit' },
    { name: 'Modal', type: 'EQUITY', code: '3-1-1', priority: 'high', reason: 'Akun modal pemilik perusahaan' },
    { name: 'Penjualan', type: 'REVENUE', code: '4-1-1', priority: 'high', reason: 'Akun pendapatan utama' },
    { name: 'Biaya Operasional', type: 'EXPENSE', code: '5-1-1', priority: 'medium', reason: 'Akun biaya operasional' },
  ];

  // Load dynamic quick actions when AI sidebar is opened
  useEffect(() => {
    if (isAIOpen && accounts?.data) {
      analyzeCOAGaps();
    }
  }, [isAIOpen, accounts]);

  // Check for duplicates
  const checkDuplicates = () => {
    if (!accounts?.data) return false;
    
    const existingCodes = accounts.data.map((account: any) => account.code.toLowerCase());
    const existingNames = accounts.data.map((account: any) => account.name.toLowerCase());
    
    const codeExists = existingCodes.includes(code.toLowerCase());
    const nameExists = existingNames.includes(name.toLowerCase());
    
    if (codeExists && nameExists) {
      setDuplicateError('Kode dan nama akun sudah ada');
      return true;
    } else if (codeExists) {
      setDuplicateError('Kode akun sudah ada');
      return true;
    } else if (nameExists) {
      setDuplicateError('Nama akun sudah ada');
      return true;
    }
    
    setDuplicateError(null);
    return false;
  };

  // Check duplicates when code or name changes
  useEffect(() => {
    if (code || name) {
      checkDuplicates();
    } else {
      setDuplicateError(null);
    }
  }, [code, name, accounts]);

  // Generate AI suggestions based on current input
  const generateSuggestions = async () => {
    if (!aiDescription.trim()) return;
    
    setIsLoadingSuggestions(true);
    try {
      const response = await fetch('/api/ai/coa/suggest-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          description: aiDescription,
          businessType: 'Umum'
        }),
      });

      const data = await response.json();
      if (data.success) {
        setAiSuggestions([data.suggestion]);
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Apply AI suggestion
  const applySuggestion = (suggestion: any) => {
    setCode(suggestion.code);
    setName(suggestion.name);
    setType(suggestion.accountType);
    if (suggestion.parentCode) {
      const parentAccount = accounts?.data.find((a: any) => a.code === suggestion.parentCode);
      if (parentAccount) {
        setParentId(parentAccount.id);
      }
    }
    setAiSuggestions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for duplicates before submitting
    if (checkDuplicates()) {
      return;
    }
    
    try {
      await createMutation.mutateAsync({
        code,
        name,
        accountType: type as any,
        category: '',
        description: '',
        parentId: parentId || undefined,
      });
      
      // Show success message
      setShowSuccessMessage(true);
      
      // Emit event for new account creation
      window.dispatchEvent(new CustomEvent('coa-account-created', {
        detail: {
          id: createMutation.data?.id || Date.now().toString(),
          code,
          name,
          accountType: type
        }
      }));
      
      // Reset form
      setCode('');
      setName('');
      setType('');
      setParentId('');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
      
    } catch (error) {
      console.error('Failed to create account:', error);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tambah Akun Baru</h1>
            <p className="text-muted-foreground">Buat akun Chart of Accounts baru</p>
          </div>
          <Button
            onClick={() => setIsAIOpen(!isAIOpen)}
            variant="outline"
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
          >
            <Bot className="h-4 w-4" />
            {isAIOpen ? 'Sembunyikan AI' : 'Tampilkan AI'}
          </Button>
        </div>
      </div>


      {/* Duplicate Error Message */}
      {duplicateError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-red-800 font-semibold">Data Duplikat!</h3>
              <p className="text-red-700 text-sm">{duplicateError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-green-800 font-semibold">Akun Berhasil Disimpan!</h3>
                <p className="text-green-700 text-sm">Akun baru telah ditambahkan ke Chart of Accounts.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSuccessMessage(false)}
                className="text-green-700 border-green-300 hover:bg-green-100"
              >
                Tutup
              </Button>
              <Button
                size="sm"
                onClick={() => router.push('/master/coa')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Lihat COA
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-6">
        {/* Main Form */}
        <div className={`${isAIOpen ? 'w-2/3' : 'w-full'} transition-all duration-300`}>
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Informasi Akun</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
            <div>
              <Label htmlFor="code">Kode Akun *</Label>
              <Input 
                id="code" 
                value={code} 
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. 1-10101"
                required
                className={duplicateError && duplicateError.includes('Kode') ? 'border-red-500 focus:border-red-500' : ''}
              />
              {duplicateError && duplicateError.includes('Kode') && (
                <p className="text-red-500 text-xs mt-1">Kode akun ini sudah ada</p>
              )}
            </div>

            <div>
              <Label htmlFor="name">Nama Akun *</Label>
              <div className="flex gap-2">
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kas"
                  required
                  className={`flex-1 ${duplicateError && duplicateError.includes('Nama') ? 'border-red-500 focus:border-red-500' : ''}`}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateSuggestions}
                  disabled={isLoadingSuggestions || !name.trim()}
                  className="px-3"
                >
                  {isLoadingSuggestions ? (
                    <Wand2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {duplicateError && duplicateError.includes('Nama') && (
                <p className="text-red-500 text-xs mt-1">Nama akun ini sudah ada</p>
              )}
              
              {/* AI Suggestions */}
              {aiSuggestions.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Saran AI</span>
                  </div>
                  {aiSuggestions.map((suggestion, index) => (
                    <div key={index} className="bg-white p-3 rounded border border-blue-100">
                      <div className="grid grid-cols-2 gap-3 mb-2">
                        <div>
                          <span className="text-xs text-gray-500">Kode:</span>
                          <div className="font-mono text-sm font-bold">{suggestion.code}</div>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Tipe:</span>
                          <div className="text-sm font-medium">{suggestion.accountType}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-700 mb-2">{suggestion.description}</div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => applySuggestion(suggestion)}
                        className="w-full"
                      >
                        Terapkan Saran
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="type">Tipe Akun *</Label>
              <select 
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">Pilih tipe...</option>
                {ACCOUNT_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="parent">Parent Account (Opsional)</Label>
              <select 
                id="parent"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Tidak ada parent (akun utama)</option>
                {accounts?.data
                  .filter((a: any) => a.type === type)
                  .map((a: any) => (
                    <option key={a.id} value={a.id}>
                      {a.code} - {a.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex gap-4 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Batal
              </Button>
              <Button type="submit" disabled={createMutation.isPending || !!duplicateError}>
                {createMutation.isPending ? 'Menyimpan...' : 'Simpan Akun'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
        </div>

        {/* AI Sidebar */}
        {isAIOpen && (
          <div className="w-1/3">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  AI Assistant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* AI Suggestion Form */}
                  <div>
                    <Label htmlFor="ai-description">Deskripsi Akun</Label>
                    <Input
                      id="ai-description"
                      placeholder="Contoh: Kas di Bank BCA, Piutang Usaha, dll"
                      value={aiDescription}
                      onChange={(e) => setAiDescription(e.target.value)}
                      className="mb-2"
                    />
                    <Button
                      onClick={generateSuggestions}
                      disabled={isLoadingSuggestions || !aiDescription.trim()}
                      className="w-full"
                      size="sm"
                    >
                      {isLoadingSuggestions ? (
                        <>
                          <Wand2 className="h-4 w-4 animate-spin mr-2" />
                          AI sedang menganalisis...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Dapatkan Saran AI
                        </>
                      )}
                    </Button>
                  </div>

                  {/* AI Suggestions Display */}
                  {aiSuggestions.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Saran AI:</Label>
                      {aiSuggestions.map((suggestion, index) => (
                        <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-mono text-sm font-bold">{suggestion.code}</span>
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {suggestion.accountType}
                              </span>
                            </div>
                            <div className="text-sm font-medium">{suggestion.name}</div>
                            <div className="text-xs text-gray-600">{suggestion.description}</div>
                            <Button
                              onClick={() => applySuggestion(suggestion)}
                              size="sm"
                              className="w-full"
                            >
                              Terapkan Saran
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Dynamic Quick AI Actions */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">Quick Actions:</Label>
                      {isAnalyzingGaps && (
                        <div className="flex items-center gap-1 text-xs text-blue-600">
                          <Wand2 className="h-3 w-3 animate-spin" />
                          <span>Analisis...</span>
                        </div>
                      )}
                    </div>
                    
                    
                    <div className="space-y-2">
                      {dynamicQuickActions
                        .slice(0, showMoreActions ? 6 : 3)
                        .map((account, index) => (
                          <div key={index} className="space-y-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className={`w-full justify-start relative ${
                                account.priority === 'high' 
                                  ? 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100' 
                                  : account.priority === 'medium'
                                  ? 'bg-yellow-50 text-yellow-800 border-yellow-200 hover:bg-yellow-100'
                                  : 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                              }`}
                              onClick={() => {
                                setCode(account.code);
                                setName(account.name);
                                setType(account.type);
                              }}
                            >
                              <Sparkles className={`h-4 w-4 mr-2 ${
                                account.priority === 'high' ? 'text-red-500' :
                                account.priority === 'medium' ? 'text-yellow-500' :
                                'text-blue-500'
                              }`} />
                              Buat Akun {account.name}
                              <span className={`absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                account.priority === 'high' ? 'bg-red-100 text-red-700' :
                                account.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {account.priority === 'high' ? 'Penting' :
                                 account.priority === 'medium' ? 'Disarankan' :
                                 'Opsional'}
                              </span>
                            </Button>
                            <div className={`text-xs px-2 ${
                              account.priority === 'high' ? 'text-red-600' :
                              account.priority === 'medium' ? 'text-yellow-600' :
                              'text-blue-600'
                            }`}>
                              {account.reason}
                            </div>
                          </div>
                        ))}
                      
                      {/* Fallback jika tidak ada saran dinamis */}
                      {dynamicQuickActions.filter(account => account.priority === 'high').length === 0 && !isAnalyzingGaps && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => {
                              setCode('1-1-1');
                              setName('Kas');
                              setType('ASSET');
                            }}
                          >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Buat Akun Kas
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => {
                              setCode('1-1-2');
                              setName('Bank BCA');
                              setType('ASSET');
                            }}
                          >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Buat Akun Bank
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => {
                              setCode('4-1-1');
                              setName('Penjualan');
                              setType('REVENUE');
                            }}
                          >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Buat Akun Penjualan
                          </Button>
                        </>
                      )}
                      
                      {/* Show More/Less Button */}
                      {dynamicQuickActions.length > 3 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowMoreActions(!showMoreActions)}
                          className="w-full text-xs"
                        >
                          {showMoreActions ? 'Tampilkan Lebih Sedikit' : 'Tampilkan Lebih Banyak'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

