const axios = require('axios');

class YouTubeService {
  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY;
    this.baseURL = 'https://www.googleapis.com/youtube/v3';
  }

  async getChannelData(channelId) {
    try {
      const response = await axios.get(`${this.baseURL}/channels`, {
        params: {
          part: 'snippet,statistics',
          id: channelId,
          key: this.apiKey
        }
      });

      if (response.data.items.length === 0) {
        throw new Error('Channel not found');
      }

      const channel = response.data.items[0];
      return {
        id: channel.id,
        title: channel.snippet.title,
        subscriberCount: parseInt(channel.statistics.subscriberCount),
        videoCount: parseInt(channel.statistics.videoCount),
        viewCount: parseInt(channel.statistics.viewCount)
      };
    } catch (error) {
      console.error('YouTube API error:', error.response?.data || error.message);
      throw error;
    }
  }

  calculateEngagementRate(viewCount, subscriberCount) {
    return subscriberCount > 0 ? (viewCount / subscriberCount) * 0.05 : 0;
  }
}

module.exports = new YouTubeService();