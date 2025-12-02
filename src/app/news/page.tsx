
// src/app/news/page.tsx
'use client';
import { useState, useEffect, useCallback, memo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Search, Settings } from 'lucide-react';
import { NewsArticleCard } from '@/components/news/NewsArticleCard';
import { useInView } from 'react-intersection-observer';

export type Article = {
  title: string;
  url: string;
  description: string;
  urlToImage: string | null;
  publishedAt: string;
  source: {
    id: string | null;
    name: string;
  };
};

const categories = [
  { id: 'general', name: 'Breaking News' },
  { id: 'world', name: 'World' },
  { id: 'technology', name: 'Tech' },
  { id: 'sports', name: 'Sports' },
  { id: 'entertainment', name: 'Entertainment' },
  { id: 'business', name: 'Business' },
  { id: 'science', name: 'Science' },
];

const MemoizedNewsArticleCard = memo(NewsArticleCard);
MemoizedNewsArticleCard.displayName = "MemoizedNewsArticleCard";

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('general');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [currentSearch, setCurrentSearch] = useState('');

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 1.0,
  });

  const fetchArticles = useCallback(async (category: string, query?: string, pageNum: number = 1) => {
    setLoading(true);
    setError(null);
    if (pageNum === 1) {
      setArticles([]);
    }

    try {
      const params: any = { page: String(pageNum), pageSize: '20' };
      if (query) {
        params.q = query;
      } else {
        params.category = category;
      }
      
      const response = await fetch(`/api/news?${new URLSearchParams(params).toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch news');
      }
      const data = await response.json();
      
      setArticles(prev => pageNum > 1 ? [...prev, ...data.articles] : data.articles);
      setTotalResults(data.totalResults);
      setPage(pageNum);

    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect for initial load and category/search changes
  useEffect(() => {
    fetchArticles(activeCategory, currentSearch, 1);
  }, [activeCategory, currentSearch, fetchArticles]);

  // Effect for infinite scroll
  useEffect(() => {
    const hasMore = articles.length < totalResults;
    if (inView && !loading && hasMore) {
      fetchArticles(activeCategory, currentSearch, page + 1);
    }
  }, [inView, loading, articles.length, totalResults, page, activeCategory, currentSearch, fetchArticles]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentSearch(searchTerm);
    setActiveCategory(''); // Reset category when searching
  };
  
  const handleCategoryChange = (value: string) => {
    setSearchTerm('');
    setCurrentSearch('');
    setActiveCategory(value);
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <header className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-headline text-glow">News Feed</h1>
        <div className="flex w-full md:w-auto items-center gap-2">
           <form onSubmit={handleSearch} className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
             <Input 
                name="search" 
                placeholder="Search news..." 
                className="pl-10 bg-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
           </form>
           <Button variant="outline" size="icon"><Settings/></Button>
        </div>
      </header>

      <Tabs value={activeCategory} onValueChange={handleCategoryChange}>
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-7">
          {categories.map(cat => (
            <TabsTrigger key={cat.id} value={cat.id}>{cat.name}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex-1 overflow-y-auto custom-scroll pr-4 -mr-4">
        {error && <div className="text-center text-destructive">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {articles.map((article, index) => (
            <MemoizedNewsArticleCard key={article.url + index} article={article} />
          ))}
        </div>
        
        {loading && (
           <div className="flex justify-center items-center py-8">
             <Loader2 className="w-8 h-8 animate-spin text-primary"/>
           </div>
        )}

        { !loading && articles.length > 0 && articles.length < totalResults && (
          <div ref={loadMoreRef} className="h-10" />
        )}
        
        {!loading && articles.length > 0 && articles.length >= totalResults && (
          <p className="text-center text-muted-foreground py-8">End of results.</p>
        )}
      </div>
    </div>
  );
}
