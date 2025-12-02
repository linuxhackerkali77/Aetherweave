const EMOJI_API_KEY = 'b0f1a008330800f6a150c296aa66148e97404be9';
const EMOJI_API_URL = 'https://emoji-api.com/emojis';

export interface Emoji {
  slug: string;
  character: string;
  unicodeName: string;
  codePoint: string;
  group: string;
  subGroup: string;
}

class EmojiService {
  private emojis: Emoji[] = [];
  private loading = false;

  async getEmojis(): Promise<Emoji[]> {
    if (this.emojis.length > 0) {
      return this.emojis;
    }

    if (this.loading) {
      return [];
    }

    this.loading = true;
    try {
      const response = await fetch(`${EMOJI_API_URL}?access_key=${EMOJI_API_KEY}`);
      const data = await response.json();
      this.emojis = data || [];
      return this.emojis;
    } catch (error) {
      console.error('Failed to fetch emojis:', error);
      return [];
    } finally {
      this.loading = false;
    }
  }

  getEmojisByGroup(group: string): Emoji[] {
    return this.emojis.filter(emoji => emoji.group === group);
  }

  searchEmojis(query: string): Emoji[] {
    const searchTerm = query.toLowerCase();
    return this.emojis.filter(emoji => 
      emoji.unicodeName.toLowerCase().includes(searchTerm) ||
      emoji.slug.toLowerCase().includes(searchTerm)
    );
  }

  getEmojiGroups(): string[] {
    const groups = [...new Set(this.emojis.map(emoji => emoji.group))];
    return groups.filter(Boolean);
  }
}

export const emojiService = new EmojiService();
export default emojiService;