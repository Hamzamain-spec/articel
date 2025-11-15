import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, FileText, Key, Sparkles, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import type { LogEntry, ArticleJob } from "@shared/schema";

export default function Home() {
  const [inputMode, setInputMode] = useState<"pairs" | "bulk">("pairs");
  const [keywordUrlPairs, setKeywordUrlPairs] = useState("");
  const [bulkKeywords, setBulkKeywords] = useState("");
  const [singleUrl, setSingleUrl] = useState("");
  const [apiProvider, setApiProvider] = useState<"groq" | "gemini">("gemini");
  const [apiKey, setApiKey] = useState("");
  const [articlesPerKeyword, setArticlesPerKeyword] = useState("1");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [totalArticles, setTotalArticles] = useState(0);
  const { toast } = useToast();
  const logsEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  const addLog = (message: string, type: LogEntry["type"] = "info") => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type,
    };
    setLogs((prev) => [...prev, newLog]);
  };

  const generateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/generate", data);
      return await response.json();
    },
    onSuccess: (data: ArticleJob) => {
      setJobId(data.id);
      setTotalArticles(data.totalArticles);
      addLog(`Starting generation of ${data.totalArticles} articles...`, "info");
      pollJobStatus(data.id);
    },
    onError: (error: any) => {
      addLog(`Error: ${error.message || "Failed to start generation"}`, "error");
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to start article generation",
        variant: "destructive",
      });
    },
  });

  const pollJobStatus = async (id: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/job/${id}`);
        const data: ArticleJob = await response.json();

        if (data.status === "completed") {
          clearInterval(interval);
          addLog(`✓ All ${data.totalArticles} articles generated successfully!`, "success");
          addLog(`✓ ZIP file created`, "success");
          setDownloadUrl(`/api/download/${id}`);
          toast({
            title: "Generation Complete",
            description: `Successfully generated ${data.totalArticles} articles`,
          });
        } else if (data.status === "failed") {
          clearInterval(interval);
          addLog(`✗ Generation failed: ${data.error}`, "error");
          toast({
            title: "Generation Failed",
            description: data.error || "An error occurred",
            variant: "destructive",
          });
        } else if (data.status === "processing") {
          if (data.completedArticles > 0) {
            addLog(`⋯ Generated article ${data.completedArticles} of ${data.totalArticles}`, "progress");
          }
        }
      } catch (error) {
        clearInterval(interval);
        addLog(`✗ Error checking status`, "error");
      }
    }, 1000);
  };

  const handleGenerate = () => {
    let parsedKeywords: Array<{ keyword: string; url: string }> = [];

    if (inputMode === "pairs") {
      const lines = keywordUrlPairs.trim().split("\n").filter(line => line.trim());
      
      if (lines.length === 0) {
        toast({
          title: "No Keywords",
          description: "Please enter at least one keyword | URL pair",
          variant: "destructive",
        });
        return;
      }

      try {
        parsedKeywords = lines.map(line => {
          const parts = line.split("|").map(p => p.trim());
          if (parts.length !== 2) {
            throw new Error(`Invalid format: "${line}". Use: keyword | URL`);
          }
          return { keyword: parts[0], url: parts[1] };
        });
      } catch (error: any) {
        toast({
          title: "Invalid Format",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
    } else {
      const keywords = bulkKeywords.trim().split("\n").filter(line => line.trim());
      
      if (keywords.length === 0) {
        toast({
          title: "No Keywords",
          description: "Please enter at least one keyword",
          variant: "destructive",
        });
        return;
      }

      if (!singleUrl.trim()) {
        toast({
          title: "URL Required",
          description: "Please enter a URL",
          variant: "destructive",
        });
        return;
      }

      parsedKeywords = keywords.map(keyword => ({
        keyword: keyword.trim(),
        url: singleUrl.trim(),
      }));
    }

    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your API key",
        variant: "destructive",
      });
      return;
    }

    const articlesPerKw = parseInt(articlesPerKeyword);
    if (isNaN(articlesPerKw) || articlesPerKw < 1 || articlesPerKw > 10) {
      toast({
        title: "Invalid Number",
        description: "Articles per keyword must be between 1 and 10",
        variant: "destructive",
      });
      return;
    }

    setLogs([]);
    setDownloadUrl(null);
    addLog("⋯ Initializing article generation...", "info");

    generateMutation.mutate({
      keywords: parsedKeywords,
      apiProvider,
      apiKey,
      articlesPerKeyword: articlesPerKw,
    });
  };

  const pairsLineCount = keywordUrlPairs.split("\n").filter(line => line.trim()).length;
  const bulkLineCount = bulkKeywords.split("\n").filter(line => line.trim()).length;

  const getLogIcon = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />;
      case "error":
        return <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />;
      case "progress":
        return <Loader2 className="h-4 w-4 text-primary animate-spin flex-shrink-0" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8 md:px-8 md:py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-semibold text-foreground">Article Generator Tool</h1>
          </div>
          <p className="text-muted-foreground">
            Generate high-quality articles automatically using AI. Supports bulk generation with automated formatting and export.
          </p>
        </div>

        <Card className="p-6 mb-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="api-provider" className="text-sm font-medium">
                  AI Provider
                </Label>
                <Select value={apiProvider} onValueChange={(value: "groq" | "gemini") => setApiProvider(value)}>
                  <SelectTrigger id="api-provider" data-testid="select-api-provider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini">Gemini API</SelectItem>
                    <SelectItem value="groq">Groq API</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-key" className="text-sm font-medium">
                  API Key
                </Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="api-key"
                    data-testid="input-api-key"
                    type="password"
                    placeholder="Enter your API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <Tabs value={inputMode} onValueChange={(value) => setInputMode(value as "pairs" | "bulk")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pairs" data-testid="tab-pairs">Keyword | URL Pairs</TabsTrigger>
                <TabsTrigger value="bulk" data-testid="tab-bulk">Multiple Keywords + Single URL</TabsTrigger>
              </TabsList>
              
              <TabsContent value="pairs" className="space-y-2 mt-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="keyword-pairs" className="text-sm font-medium">
                    Keyword | URL Pairs
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {pairsLineCount} {pairsLineCount === 1 ? "line" : "lines"}
                  </span>
                </div>
                <Textarea
                  id="keyword-pairs"
                  data-testid="textarea-keyword-pairs"
                  placeholder={`Enter one keyword | URL pair per line:\n\nExample:\nSEO optimization | https://example.com\nContent marketing | https://example.com/blog\nLink building | https://example.com/services`}
                  value={keywordUrlPairs}
                  onChange={(e) => setKeywordUrlPairs(e.target.value)}
                  className="h-48 font-mono text-sm resize-none"
                />
              </TabsContent>

              <TabsContent value="bulk" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="bulk-keywords" className="text-sm font-medium">
                      Keywords (one per line)
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      {bulkLineCount} {bulkLineCount === 1 ? "keyword" : "keywords"}
                    </span>
                  </div>
                  <Textarea
                    id="bulk-keywords"
                    data-testid="textarea-bulk-keywords"
                    placeholder={`Enter one keyword per line:\n\nExample:\nSEO optimization\nContent marketing\nLink building\nDigital strategy`}
                    value={bulkKeywords}
                    onChange={(e) => setBulkKeywords(e.target.value)}
                    className="h-32 font-mono text-sm resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="single-url" className="text-sm font-medium">
                    Single URL (for all keywords)
                  </Label>
                  <Input
                    id="single-url"
                    data-testid="input-single-url"
                    type="url"
                    placeholder="https://example.com"
                    value={singleUrl}
                    onChange={(e) => setSingleUrl(e.target.value)}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-2">
              <Label htmlFor="articles-count" className="text-sm font-medium">
                Articles per Keyword
              </Label>
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <Input
                  id="articles-count"
                  data-testid="input-articles-count"
                  type="number"
                  min="1"
                  max="10"
                  value={articlesPerKeyword}
                  onChange={(e) => setArticlesPerKeyword(e.target.value)}
                  className="max-w-xs"
                />
              </div>
            </div>

            <Button
              data-testid="button-generate"
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
              className="w-full py-6 text-base font-medium"
              size="lg"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Articles...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Generating
                </>
              )}
            </Button>
          </div>
        </Card>

        {logs.length > 0 && (
          <>
            <Separator className="my-8" />
            
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-foreground">Status Log</h2>
              
              <Card className="bg-card">
                <ScrollArea className="h-64 p-4">
                  <div className="space-y-1 font-mono text-sm">
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        data-testid={`log-entry-${log.type}`}
                        className="flex items-start gap-3 py-1"
                      >
                        {getLogIcon(log.type)}
                        <span className="text-muted-foreground text-xs mt-0.5">
                          [{log.timestamp}]
                        </span>
                        <span className={`flex-1 ${
                          log.type === "error" 
                            ? "text-destructive" 
                            : log.type === "success"
                            ? "text-green-600 dark:text-green-400"
                            : "text-foreground"
                        }`}>
                          {log.message}
                        </span>
                      </div>
                    ))}
                    <div ref={logsEndRef} />
                  </div>
                </ScrollArea>
              </Card>

              {downloadUrl && (
                <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900 dark:text-green-100">
                          Generation Complete!
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          {totalArticles} {totalArticles === 1 ? "article" : "articles"} generated and packaged
                        </p>
                      </div>
                    </div>
                    <Button
                      data-testid="button-download"
                      asChild
                      className="w-full sm:w-auto bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                    >
                      <a href={downloadUrl} download>
                        <Download className="mr-2 h-4 w-4" />
                        Download ZIP
                      </a>
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
