'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { 
  Bot, 
  X,
  Brain,
  Trash2,
  MessageSquare,
  ChevronDown,
  Upload,
  FileText,
  Image
} from 'lucide-react';
import { useChat } from '@ai-sdk/react';
import { CountaMessageRenderer, createCountaMessage, createContextualResponse } from './counta-components/counta-message-renderer';
import { CountaMessage, CountaComponent } from './counta-components/types';
import { FileUpload } from './file-upload';
// Database context and system operations are now loaded via API

interface SmartChatAISDKProps {
  isOpen: boolean;
  onClose: () => void;
  currentModule?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  countaMessage?: CountaMessage;
}

// Format markdown to HTML
const formatMarkdown = (text: string) => {
  return text
    // Bold **text** -> <strong>text</strong>
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    // Italic *text* -> <em>text</em>
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    // Code `text` -> <code>text</code>
    .replace(/`(.*?)`/g, '<code class="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
    // Headers ### -> <h3>
    .replace(/^### (.+)$/gm, '<h3 class="font-semibold text-gray-900 mt-3 mb-1.5">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="font-bold text-gray-900 mt-4 mb-2 text-base">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="font-bold text-gray-900 mt-4 mb-2">$1</h1>')
    // Bullet points - or *
    .replace(/^[-*] (.+)$/gm, '<div class="flex items-start gap-2 my-1"><span class="text-gray-700 mt-1">•</span><span>$1</span></div>')
    // Links [text](url) -> <a>text</a>
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-700 underline" target="_blank" rel="noopener noreferrer">$1</a>')
    // Line breaks
    .replace(/\n/g, '<br>');
};

export function SmartChatAISDK({ isOpen, onClose, currentModule = 'general' }: SmartChatAISDKProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Halo! Saya Smart Assistant untuk aplikasi akuntansi Anda yang TERINTEGRASI dengan database dan business logic. Saya bisa membantu dengan:

• **Saran workflow** untuk modul ${currentModule}
• **Panduan penggunaan** fitur-fitur aplikasi
• **Troubleshooting** masalah yang Anda hadapi
• **Best practices** akuntansi Indonesia
• **Analisis data** dan laporan keuangan
• **Upload dokumen** - Upload invoice, receipt, bill, statement untuk ekstraksi data otomatis
• **Database operations** - Create/update accounts, customers, vendors, products
• **Smart validation** - Validasi data sesuai business rules dan PSAK
${currentModule === 'master-data' ? '• **Cleanup duplikat COA** - Hapus akun duplikat secara otomatis\n• **Validasi Chart of Accounts** - Pastikan struktur COA sesuai standar PSAK' : ''}

🚀 **FITUR TERBARU:**
- ✅ **Real-time database access** - Akses data aktual dari database
- ✅ **Document processing AI** - Ekstraksi data otomatis dari dokumen
- ✅ **System operations** - Execute operations langsung ke database
- ✅ **Business logic integration** - Validasi sesuai PSAK
- ✅ **Workflow automation** - Step-by-step guidance

Apa yang bisa saya bantu hari ini?`,
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [databaseContext, setDatabaseContext] = useState<any>(null);
  const [systemOperations, setSystemOperations] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Manual input handling
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit(e as any);
    }
  };
  
  // Manual submit handling
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    
    console.log('Submitting message:', inputValue);
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/smart/chat-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          module: currentModule,
          companyId: 'default-company-id',
          context: {
            currentPage: typeof window !== 'undefined' ? window.location.pathname : '/',
            userRole: 'admin',
            permissions: ['read', 'write', 'admin'],
            databaseContext: databaseContext,
            systemOperations: systemOperations
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      // Add AI message placeholder
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
      };

      setMessages(prev => [...prev, aiMessage]);

      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;

        if (value) {
          const chunk = decoder.decode(value);
          console.log('Received chunk:', chunk);
          
          // Handle streaming response
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.trim() === '') continue;
            
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                done = true;
                break;
              }
              
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  let content = parsed.content;
                  
                  // Check if content contains COUNTA-COMPONENT tags
                  const componentRegex = /\[COUNTA-COMPONENT:(\{[\s\S]*?\})\]/g;
                  if (componentRegex.test(content)) {
                    // Extract Counta components from content
                    const components: any[] = [];
                    let match;
                    
                    // Reset regex
                    componentRegex.lastIndex = 0;
                    
                    while ((match = componentRegex.exec(content)) !== null) {
                      try {
                        const component = JSON.parse(match[1]);
                        components.push(component);
                        // Remove the component tag from content
                        content = content.replace(match[0], '');
                      } catch (e) {
                        console.error('Error parsing Counta component:', e);
                      }
                    }
                    
                    // Update message with cleaned content and components
                    setMessages(prev => {
                      const updatedMessages = prev.map(msg => {
                        if (msg.id === aiMessage.id) {
                          let newContent = msg.content + content;
                          let countaMessage = msg.countaMessage;
                          
                          // Merge with existing components
                          if (components.length > 0) {
                            const existingComponents = countaMessage?.components || [];
                            const mergedComponents = createCountaMessage([...existingComponents, ...components] as any);
                            if (mergedComponents) {
                              countaMessage = mergedComponents;
                            }
                          }
                          
                          return { ...msg, content: newContent, countaMessage };
                        }
                        return msg;
                      });
                      return updatedMessages;
                    });
                  } else {
                    // No components, just update content
                    setMessages(prev => 
                      prev.map(msg => 
                        msg.id === aiMessage.id 
                          ? { ...msg, content: msg.content + parsed.content }
                          : msg
                      )
                    );
                  }
                }
                
                // Check for Counta components in separate field
                if (parsed.countaComponents && Array.isArray(parsed.countaComponents)) {
                  const countaMessage = createCountaMessage(parsed.countaComponents);
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === aiMessage.id 
                        ? { ...msg, countaMessage }
                        : msg
                    )
                  );
                }
              } catch (e) {
                console.log('JSON parse error:', e, 'for data:', data);
              }
            }
            else if (line.trim()) {
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === aiMessage.id 
                    ? { ...msg, content: msg.content + line }
                    : msg
                )
              );
            }
          }
        }
      }
    } catch (err) {
      console.error('Error submitting message:', err);
      setError('Gagal terhubung ke AI. Periksa koneksi internet atau pengaturan API.');
    } finally {
      setIsLoading(false);
    }
  };

  // Functions are now handled by useChat hook

  // Handle system operations
  const executeSystemOperation = async (operation: string, data: any) => {
    try {
      const response = await fetch('/api/ai/system-operations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation,
          data,
          companyId: 'default-company-id',
          module: currentModule
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Add success message
        const successMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `✅ **Operasi berhasil dijalankan!**

${result.result.message}

**Data yang dibuat:**
${JSON.stringify(result.result.data, null, 2)}`
        };

        setMessages(prev => [...prev, successMessage]);
        
        // Reload database context via API
        const contextResponse = await fetch('/api/ai/smart/context', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            companyId: 'default-company-id',
            module: currentModule
          }),
        });

        if (contextResponse.ok) {
          const contextData = await contextResponse.json();
          setDatabaseContext(contextData.databaseContext);
        }
      } else {
        // Add error message
        const errorMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `❌ **Operasi gagal!**

${result.error}

**Detail error:**
${result.details}`
        };

        setMessages(prev => [...prev, errorMessage]);
      }

    } catch (error) {
      console.error('Operation execution error:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `❌ **Error menjalankan operasi!**

${error instanceof Error ? error.message : 'Unknown error'}`
      };

      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // Handle document processing
  const processDocument = async (file: File) => {
    try {
      const reader = new FileReader();
      const fileData = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const response = await fetch('/api/ai/document-process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: fileData,
          companyId: 'default-company-id',
          module: currentModule
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Add document analysis message
        const analysisMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `📄 **Dokumen berhasil diproses!**

**Tipe Dokumen:** ${result.documentAnalysis.type}
**Confidence:** ${Math.round(result.documentAnalysis.confidence * 100)}%

**Data yang diekstrak:**
${Object.entries(result.documentAnalysis.extractedData).map(([key, value]) => 
  `- ${key}: ${value}`
).join('\n')}

**Saran:**
${result.suggestions.map((suggestion: string) => `- ${suggestion}`).join('\n')}

${result.accountingOperation.operation ? 
  `**Operasi yang disarankan:** ${result.accountingOperation.operation}` : 
  'Tidak ada operasi yang disarankan'
}`
        };

        setMessages(prev => [...prev, analysisMessage]);

        // If there's a suggested operation, offer to execute it
        if (result.accountingOperation.operation) {
          const operationMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `Apakah Anda ingin menjalankan operasi "${result.accountingOperation.operation}" dengan data yang diekstrak?`,
            countaMessage: {
              id: (Date.now() + 2).toString(),
              type: 'ai',
              timestamp: new Date(),
              components: [{
                type: 'action',
                variant: 'context-aware',
                title: 'Operasi yang Tersedia',
                actions: [{
                  id: 'execute-operation',
                  label: 'Jalankan Operasi',
                  action: 'execute_operation',
                  variant: 'primary'
                }]
              }]
            }
          };

          setMessages(prev => [...prev, operationMessage]);
        }
      } else {
        // Add error message
        const errorMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `❌ **Gagal memproses dokumen!**

${result.error}`
        };

        setMessages(prev => [...prev, errorMessage]);
      }

    } catch (error) {
      console.error('Document processing error:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `❌ **Error memproses dokumen!**

${error instanceof Error ? error.message : 'Unknown error'}`
      };

      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Load database context and system operations
  useEffect(() => {
    const loadSystemContext = async () => {
      try {
        const companyId = 'default-company-id';
        
        // Load database context via API
        const response = await fetch('/api/ai/smart/context', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            companyId,
            module: currentModule
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setDatabaseContext(data.databaseContext);
          setSystemOperations(data.systemOperations);
          
          console.log('✅ Database context loaded:', data.databaseContext);
          console.log('✅ System operations loaded:', data.systemOperations);
        } else {
          console.error('❌ Failed to load system context');
        }
      } catch (error) {
        console.error('❌ Error loading system context:', error);
      }
    };

    if (isOpen) {
      loadSystemContext();
    }
  }, [isOpen, currentModule]);

  // Auto-scroll to bottom when new messages arrive (only when not manually scrolling)
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  
  useEffect(() => {
    if (messagesEndRef.current && !isUserScrolling) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isUserScrolling]);

  // AI-powered form filling functionality
  useEffect(() => {
    const handleAIAction = (event: CustomEvent) => {
      const { action, data, target } = event.detail;
      console.log('AI Action received:', { action, data, target });
      
      switch (action) {
        case 'fill-form':
          // Fill form fields automatically
          if (target && data) {
            Object.keys(data).forEach(fieldName => {
              const field = document.querySelector(`[name="${fieldName}"], [id="${fieldName}"]`) as HTMLInputElement;
              if (field) {
                field.value = data[fieldName];
                field.dispatchEvent(new Event('input', { bubbles: true }));
                field.dispatchEvent(new Event('change', { bubbles: true }));
              }
            });
          }
          break;
          
        case 'navigate':
          // Navigate to specific page
          if (target) {
            window.location.href = target;
          }
          break;
          
        case 'click-button':
          // Click specific button
          if (target) {
            const button = document.querySelector(target) as HTMLButtonElement;
            if (button) {
              button.click();
            }
          }
          break;
          
        case 'select-option':
          // Select dropdown option
          if (target && data) {
            const select = document.querySelector(target) as HTMLSelectElement;
            if (select) {
              select.value = data.value;
              select.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
          break;
      }
    };

    // Listen for AI actions
    window.addEventListener('ai-action', handleAIAction as EventListener);
    
    return () => {
      window.removeEventListener('ai-action', handleAIAction as EventListener);
    };
  }, []);

  // Handle scroll events to detect manual scrolling
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = target;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    
    console.log('Scroll event:', { scrollTop, scrollHeight, clientHeight, isAtBottom });
    
    if (isAtBottom) {
      setIsUserScrolling(false);
    } else {
      setIsUserScrolling(true);
    }
  };

  const clearChat = () => {
    // Reset chat by reloading the component
    window.location.reload();
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setIsUserScrolling(false);
    }
  };

  // Get quick actions based on current module
  const getQuickActions = () => {
    const baseActions = [
      "Buat Chart of Accounts baru",
      "Tambah Customer baru", 
      "Input transaksi penjualan",
      "Generate laporan laba rugi",
      "Setup akun bank",
      "Upload dokumen (invoice/receipt)",
      "Troubleshoot error aplikasi"
    ];

    if (currentModule === 'master-data') {
      return [
        "Cek dan hapus duplikat COA",
        "Buat Chart of Accounts baru",
        "Validasi struktur COA",
        "Tambah Customer baru",
        "Tambah Vendor baru",
        "Setup akun bank",
        "Upload dokumen (invoice/receipt)"
      ];
    }

    if (currentModule === 'sales') {
      return [
        "Buat invoice baru",
        "Input transaksi penjualan",
        "Upload invoice customer",
        "Generate laporan penjualan",
        "Setup customer baru"
      ];
    }

    if (currentModule === 'purchases') {
      return [
        "Buat bill baru",
        "Input transaksi pembelian",
        "Upload bill vendor",
        "Generate laporan pembelian",
        "Setup vendor baru"
      ];
    }

    return baseActions;
  };

  const quickActions = getQuickActions();

  const handleQuickAction = async (action: string) => {
    // Set input value and let AI determine the appropriate response
    setInputValue(action);
    setTimeout(() => {
      handleFormSubmit({ preventDefault: () => {} } as any);
    }, 100);
  };

  const handleFileProcessed = async (result: any) => {
    console.log('File processed:', result);
    
    // Add user message about file upload
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: `Saya upload dokumen: ${result.fileName || 'Unknown file'}`,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setShowFileUpload(false);
    
    // Process the file with document processing AI
    if (result.file) {
      await processDocument(result.file);
    } else {
      // Fallback to old method if no file object
      setTimeout(() => {
        handleFormSubmit({ preventDefault: () => {} } as any);
      }, 100);
    }
  };

  const handleFileError = (error: string) => {
    console.error('File processing error:', error);
    setError(`Error processing file: ${error}`);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="smart-chat-title"
      aria-describedby="smart-chat-description"
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 animate-in fade-in duration-200"
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="relative w-full h-full mx-0 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <Card className="relative flex flex-col h-full bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3 px-6 flex-shrink-0 border-b bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-20 blur-lg animate-pulse" />
                <div className="relative p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
                  <Brain className="h-4 w-4 text-white drop-shadow-lg" />
                </div>
              </div>
              <div>
                <CardTitle id="smart-chat-title" className="flex items-center gap-1.5 text-sm text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                  Smart Assistant
                  <Badge className="h-5 px-2 text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-sm">
                    {currentModule}
                  </Badge>
                </CardTitle>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {isUserScrolling && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={scrollToBottom}
                  className="h-7 w-7 p-0 hover:bg-gray-100"
                  title="Scroll ke Bawah"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                className="h-7 w-7 p-0 hover:bg-gray-100"
                title="Hapus Chat"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-7 w-7 p-0 hover:bg-gray-100"
                title="Tutup"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col flex-1 p-0">
            {/* Chat Messages */}
            <div 
              className="flex-1 bg-white overflow-y-auto" 
              onScroll={handleScroll}
              onWheel={(e) => {
                console.log('Wheel event:', e.deltaY);
                // Allow wheel scrolling
              }}
              style={{ maxHeight: 'calc(100vh - 130px)' }}
            >
              <div className="p-6 space-y-4 bg-white">
                {/* Quick Actions - Show only when no messages or first message */}
                {messages.length <= 1 && (
                  <div className="mb-4 max-w-4xl mx-auto">
                    <div className="text-sm text-gray-600 mb-2">Quick Actions:</div>
                    <div className="flex flex-wrap gap-2">
                      {quickActions.map((action, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickAction(action)}
                          className="text-xs h-8"
                        >
                          {action}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  } max-w-4xl mx-auto mb-4`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm ring-2 ring-blue-100">
                      <Bot className="h-4.5 w-4.5 text-white" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[75%] rounded-2xl shadow-sm ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-blue-200'
                        : 'bg-white text-gray-900 border border-gray-100 shadow-gray-100'
                    }`}
                  >
                    {/* Message Content */}
                    <div className="px-4 py-3">
                      {message.countaMessage ? (
                        <CountaMessageRenderer 
                          message={message.countaMessage}
                          onAction={(actionId, action, data) => {
                            console.log('Counta action:', { actionId, action, data });
                            
                            // Handle execute_operation action
                            if (actionId === 'execute-operation') {
                              // Find the operation data from the message context
                              const message = messages.find(msg => msg.countaMessage?.components?.some(comp => 
                                comp.type === 'action' && comp.actions?.some(act => act.id === 'execute-operation')
                              ));
                              
                              if (message) {
                                // Extract operation from the message content
                                const operationMatch = message.content.match(/operasi "([^"]+)"/);
                                if (operationMatch) {
                                  const operation = operationMatch[1];
                                  // You would need to store the operation data somewhere accessible
                                  // For now, we'll use a placeholder
                                  executeSystemOperation(operation, {});
                                }
                              }
                              return;
                            }
                            
                            // Ensure action is defined and is a string
                            const actionStr = String(action || '');
                            
                            // Parse AI-ACTION format
                            if (actionStr && actionStr.startsWith('[AI-ACTION:')) {
                              const match = actionStr.match(/\[AI-ACTION:(\w+):"?([^"]+)"?\]/);
                              if (match) {
                                const [, actionType, value] = match;
                                if (actionType === 'navigate') {
                                  window.location.href = value;
                                }
                              }
                            } else {
                              console.log('Action is not in AI-ACTION format:', actionStr);
                            }
                          }}
                          onCellEdit={(rowId, field, value) => {
                            console.log('Counta cell edit:', { rowId, field, value });
                            // Handle cell edits here
                          }}
                        />
                      ) : (
                        <div className={`${
                          message.role === 'user' 
                            ? 'text-sm text-white whitespace-pre-wrap' 
                            : 'text-sm text-gray-800 leading-relaxed prose prose-sm max-w-none'
                        }`}>
                          {message.role === 'assistant' ? (
                            <div 
                              className="markdown-content"
                              dangerouslySetInnerHTML={{ 
                                __html: formatMarkdown(message.content) 
                              }} 
                            />
                          ) : (
                            message.content
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Timestamp */}
                    <div className={`px-4 pb-2 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                    }`}>
                      <div className="text-xs font-medium">
                        {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  {message.role === 'user' && (
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-sm ring-2 ring-gray-100">
                      <MessageSquare className="h-4.5 w-4.5 text-gray-600" />
                    </div>
                  )}
                </div>
              ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex gap-3 justify-start max-w-4xl mx-auto mb-4">
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm ring-2 ring-blue-100">
                      <Bot className="h-4.5 w-4.5 text-white" />
                    </div>
                    <div className="bg-white border border-gray-100 shadow-sm shadow-gray-100 rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex space-x-1.5">
                          <div className="w-2 h-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-sm text-gray-600 font-medium">AI sedang mengetik...</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Scroll anchor */}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="px-6 py-2 bg-red-50 border-t border-red-200">
                <div className="flex items-center gap-2 text-red-800 text-sm max-w-4xl mx-auto">
                  <X className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* File Upload Area */}
            {showFileUpload && (
              <div className="border-t p-4 bg-gray-50">
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-900">Upload Dokumen</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFileUpload(false)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <FileUpload
                    onFileProcessed={handleFileProcessed}
                    onError={handleFileError}
                    maxFiles={3}
                    acceptedTypes={['image/*', 'application/pdf', 'text/plain']}
                    maxSize={10}
                  />
                </div>
              </div>
            )}

            {/* Input Area - Compact */}
            <div className="border-t p-3 bg-white">
              <form onSubmit={handleFormSubmit} className="flex gap-2 max-w-4xl mx-auto">
                <input
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Ketik pesan Anda..."
                  disabled={isLoading}
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFileUpload(!showFileUpload)}
                  className="h-9 px-3"
                  title="Upload File"
                >
                  <Upload className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  size="sm"
                  className="h-9 px-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {isLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <MessageSquare className="h-3.5 w-3.5" />
                  )}
                </Button>
              </form>
              <div className="flex justify-between items-center mt-1.5 max-w-4xl mx-auto px-1">
                <div className="text-xs text-gray-400">
                  Enter kirim • Shift+Enter baris baru • Upload untuk dokumen
                </div>
                <div className={`text-xs ${inputValue.length > 900 ? 'text-red-500' : inputValue.length > 700 ? 'text-yellow-500' : 'text-gray-400'}`}>
                  {inputValue.length}/1000
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

