// src/services/news-service.ts
'use server';

const API_KEY = process.env.NEWSAPI_ORG_API_KEY;
const TOP_HEADLINES_URL = 'https://newsapi.org/v2/top-headlines';
const EVERYTHING_URL = 'https://newsapi.org/v2/everything';

interface FetchNewsParams {
  category?: string;
  q?: string;
  page?: string;
  country?: string;
  pageSize?: string;
}

export async function fetchNews(params: FetchNewsParams) {
  if (!API_KEY) {
    throw new Error('Newsapi.org API key is not configured.');
  }

  let baseUrl: string;
  const queryParams = new URLSearchParams({
    apiKey: API_KEY,
  });

  if (params.q) {
    // Search queries use the /everything endpoint and should not include country or category
    baseUrl = EVERYTHING_URL;
    queryParams.append('q', params.q);
    queryParams.append('sortBy', 'publishedAt'); // Sort by most recent for searches
  } else {
    // Category browsing uses the /top-headlines endpoint
    baseUrl = TOP_HEADLINES_URL;
    if (params.category) {
      queryParams.append('category', params.category);
    }
    // The 'country' parameter cannot be mixed with the 'sources' parameter. 
    // As we are not using sources, it is safe to add the country.
    // However, it should not be included in a 'q' search.
    queryParams.append('country', params.country || 'us');
  }
  
  if (params.page) queryParams.append('page', params.page);
  if (params.pageSize) queryParams.append('pageSize', params.pageSize);


  try {
    const url = `${baseUrl}?${queryParams.toString()}`;
    console.log(`Fetching news from: ${url}`);
    const response = await fetch(url, { next: { revalidate: 3600 } }); // Revalidate every hour

    if (!response.ok) {
      const errorData = await response.json();
      console.error('News API Error Response:', errorData);
      throw new Error(`News API error: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Failed to fetch news:', error);
    // Re-throw the error to be handled by the API route
    throw error;
  }
}
