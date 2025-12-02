
// src/components/news/BreakingNewsNotifier.tsx
'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Article } from '@/app/news/page';
import { formatDistanceToNowStrict } from 'date-fns';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';

export default function BreakingNewsNotifier() {
  const { toast } = useToast();
  const [lastArticleUrl, setLastArticleUrl] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Fetch initial breaking news to set a baseline
    const fetchInitialNews = async () => {
      try {
        const response = await fetch('/api/news?category=general&pageSize=1');
        const data = await response.json();
        if (data.articles && data.articles.length > 0) {
          setLastArticleUrl(data.articles[0].url);
        }
      } catch (error) {
        console.error('Failed to fetch initial news:', error);
      }
    };
    fetchInitialNews();

    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/news?category=general&pageSize=1');
        const data = await response.json();
        const latestArticle: Article = data.articles?.[0];

        if (latestArticle && latestArticle.url !== lastArticleUrl) {
          setLastArticleUrl(latestArticle.url);
          toast({
            duration: 8000,
            title: `BREAKING: ${latestArticle.title}`,
            description: `${latestArticle.source.name} - ${formatDistanceToNowStrict(new Date(latestArticle.publishedAt), { addSuffix: true })}`,
            action: (
              <Button variant="secondary" size="sm" onClick={() => router.push(latestArticle.url)}>
                Read Now
              </Button>
            ),
          });
          // Here you would also trigger a sound and native browser notification if enabled
        }
      } catch (error) {
        console.error('Failed to poll for breaking news:', error);
      }
    }, 300000); // Poll every 5 minutes

    return () => clearInterval(interval);
  }, [lastArticleUrl, toast, router]);

  return null; // This component doesn't render anything itself
}

    