
// src/components/news/NewsArticleCard.tsx
'use client';
import { memo, useMemo } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { formatDistanceToNowStrict } from 'date-fns';
import { Globe, Newspaper } from 'lucide-react';
import { Article } from '@/app/news/page';

interface NewsArticleCardProps {
  article: Article;
}

export const NewsArticleCard = memo(({ article }: NewsArticleCardProps) => {
  const publishedTime = useMemo(() => {
    try {
      return formatDistanceToNowStrict(new Date(article.publishedAt), { addSuffix: true });
    } catch {
      return 'a while ago';
    }
  }, [article.publishedAt]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <a href={article.url} target="_blank" rel="noopener noreferrer">
        <Card className="flex flex-col h-full group overflow-hidden glass-card hover:neon-border-primary transition-all">
          <CardHeader className="p-0">
            <div className="aspect-video bg-muted/50 flex items-center justify-center relative overflow-hidden">
              {article.urlToImage ? (
                <Image
                  src={article.urlToImage}
                  alt={article.title}
                  layout="fill"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <Newspaper className="w-16 h-16 text-muted-foreground" />
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 flex-1">
            <CardTitle className="text-base font-bold line-clamp-2 leading-snug">{article.title}</CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-3 mt-2">{article.description}</p>
          </CardContent>
          <CardFooter className="p-4 pt-0 text-xs text-muted-foreground flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <Globe className="w-4 h-4" />
              <span className="truncate">{article.source.name}</span>
            </div>
            <span>{publishedTime}</span>
          </CardFooter>
        </Card>
      </a>
    </motion.div>
  );
});

NewsArticleCard.displayName = 'NewsArticleCard';
