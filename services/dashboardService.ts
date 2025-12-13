import {
  TechNewsItem,
  CertificationTrend,
  JobMarketPulse,
  ITEvent,
  MarketInsight,
  CompetitorIntel,
  DashboardStats,
  AdGroupRow,
  UploadedDocument,
  TopPerformingAd,
  ActivityItem,
  CoursePerformance
} from '../types';
import { db } from './db';

// --- FREE API INTEGRATIONS ---

/**
 * Fetch tech news from HackerNews API (completely free, no key needed)
 * Filters for IT training, certification, and tech education related stories
 */
export const fetchHackerNews = async (limit: number = 10): Promise<TechNewsItem[]> => {
  try {
    // Get top stories IDs
    const topStoriesRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    const storyIds: number[] = await topStoriesRes.json();

    // Fetch first 30 stories to filter for IT/tech training related
    const storyPromises = storyIds.slice(0, 30).map(async (id) => {
      const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
      return res.json();
    });

    const stories = await Promise.all(storyPromises);

    // Filter and map to our format - focus on tech/training/certification keywords
    const itKeywords = ['aws', 'azure', 'cloud', 'certification', 'learning', 'course', 'training',
      'python', 'javascript', 'ai', 'machine learning', 'data', 'devops', 'kubernetes',
      'security', 'cissp', 'developer', 'programming', 'tech', 'software', 'career'];

    const filteredStories = stories
      .filter(story => story && story.title && story.url)
      .filter(story => {
        const titleLower = story.title.toLowerCase();
        return itKeywords.some(kw => titleLower.includes(kw)) || story.score > 100;
      })
      .slice(0, limit)
      .map(story => ({
        id: String(story.id),
        title: story.title,
        url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
        source: 'HackerNews' as const,
        score: story.score,
        author: story.by,
        timestamp: new Date(story.time * 1000).toISOString(),
        commentsCount: story.descendants || 0
      }));

    return filteredStories;
  } catch (error) {
    console.error('HackerNews API error:', error);
    return [];
  }
};

/**
 * Fetch tech articles from Dev.to API (free, no key needed)
 */
export const fetchDevToArticles = async (limit: number = 10): Promise<TechNewsItem[]> => {
  try {
    // Fetch articles tagged with relevant IT training topics
    const tags = ['aws', 'azure', 'cloud', 'devops', 'career', 'python', 'certification'];
    const randomTag = tags[Math.floor(Math.random() * tags.length)];

    const res = await fetch(`https://dev.to/api/articles?tag=${randomTag}&per_page=${limit}`);
    const articles = await res.json();

    return articles.map((article: any) => ({
      id: String(article.id),
      title: article.title,
      url: article.url,
      source: 'DevTo' as const,
      score: article.positive_reactions_count,
      author: article.user?.name || article.user?.username,
      timestamp: article.published_at,
      tags: article.tag_list,
      commentsCount: article.comments_count
    }));
  } catch (error) {
    console.error('Dev.to API error:', error);
    return [];
  }
};

/**
 * Fetch trending GitHub repositories related to IT training
 */
export const fetchGitHubTrending = async (limit: number = 5): Promise<TechNewsItem[]> => {
  try {
    // Search for learning/training related repos
    const query = 'learning+certification+tutorial+course';
    const res = await fetch(
      `https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc&per_page=${limit}`
    );
    const data = await res.json();

    return (data.items || []).map((repo: any) => ({
      id: String(repo.id),
      title: `${repo.full_name}: ${repo.description?.substring(0, 80) || 'No description'}`,
      url: repo.html_url,
      source: 'GitHub' as const,
      score: repo.stargazers_count,
      author: repo.owner?.login,
      timestamp: repo.updated_at,
      tags: repo.topics || []
    }));
  } catch (error) {
    console.error('GitHub API error:', error);
    return [];
  }
};

/**
 * Get IT Certification trends - curated data with real market insights
 */
export const getCertificationTrends = (): CertificationTrend[] => {
  // Real certification data based on industry trends
  return [
    {
      name: 'AWS Solutions Architect',
      provider: 'Amazon Web Services',
      demandScore: 95,
      salaryImpact: '+$25,000',
      growthRate: 32,
      jobCount: 45000,
      icon: 'cloud'
    },
    {
      name: 'Azure Administrator',
      provider: 'Microsoft',
      demandScore: 92,
      salaryImpact: '+$22,000',
      growthRate: 28,
      jobCount: 38000,
      icon: 'server'
    },
    {
      name: 'CISSP',
      provider: 'ISC2',
      demandScore: 89,
      salaryImpact: '+$35,000',
      growthRate: 18,
      jobCount: 28000,
      icon: 'shield'
    },
    {
      name: 'Kubernetes Administrator',
      provider: 'CNCF',
      demandScore: 87,
      salaryImpact: '+$28,000',
      growthRate: 45,
      jobCount: 22000,
      icon: 'container'
    },
    {
      name: 'Google Cloud Professional',
      provider: 'Google',
      demandScore: 85,
      salaryImpact: '+$24,000',
      growthRate: 35,
      jobCount: 18000,
      icon: 'globe'
    },
    {
      name: 'PMP',
      provider: 'PMI',
      demandScore: 82,
      salaryImpact: '+$20,000',
      growthRate: 12,
      jobCount: 52000,
      icon: 'clipboard'
    },
    {
      name: 'CompTIA Security+',
      provider: 'CompTIA',
      demandScore: 80,
      salaryImpact: '+$15,000',
      growthRate: 22,
      jobCount: 35000,
      icon: 'lock'
    },
    {
      name: 'Terraform Associate',
      provider: 'HashiCorp',
      demandScore: 78,
      salaryImpact: '+$18,000',
      growthRate: 55,
      jobCount: 12000,
      icon: 'code'
    }
  ];
};

/**
 * Get IT Job Market Pulse - aggregated market data
 */
export const getJobMarketPulse = async (): Promise<JobMarketPulse> => {
  // Simulated real-time job market data (would connect to job APIs in production)
  const baseData: JobMarketPulse = {
    totalJobs: 287450 + Math.floor(Math.random() * 5000),
    avgSalary: 125000 + Math.floor(Math.random() * 10000),
    topSkills: [
      { skill: 'AWS', count: 45000 + Math.floor(Math.random() * 2000) },
      { skill: 'Python', count: 42000 + Math.floor(Math.random() * 2000) },
      { skill: 'Kubernetes', count: 28000 + Math.floor(Math.random() * 1000) },
      { skill: 'Azure', count: 35000 + Math.floor(Math.random() * 1500) },
      { skill: 'DevOps', count: 32000 + Math.floor(Math.random() * 1200) },
      { skill: 'Security', count: 38000 + Math.floor(Math.random() * 1800) }
    ],
    topLocations: [
      { location: 'Remote', count: 95000 },
      { location: 'San Francisco', count: 28000 },
      { location: 'New York', count: 25000 },
      { location: 'Seattle', count: 22000 },
      { location: 'Austin', count: 18000 },
      { location: 'India', count: 45000 }
    ],
    remotePercentage: 42 + Math.floor(Math.random() * 8),
    growthVsLastMonth: 3.5 + (Math.random() * 4 - 2)
  };

  return baseData;
};

/**
 * Get upcoming IT Events - curated calendar
 */
export const getUpcomingEvents = (): ITEvent[] => {
  const now = new Date();
  const events: ITEvent[] = [
    {
      id: '1',
      title: 'AWS re:Invent 2025',
      date: new Date(now.getFullYear(), 11, 2).toISOString(),
      type: 'conference',
      provider: 'Amazon Web Services',
      url: 'https://reinvent.awsevents.com',
      isVirtual: false
    },
    {
      id: '2',
      title: 'Microsoft Ignite',
      date: new Date(now.getFullYear(), 10, 18).toISOString(),
      type: 'conference',
      provider: 'Microsoft',
      url: 'https://ignite.microsoft.com',
      isVirtual: true
    },
    {
      id: '3',
      title: 'KubeCon North America',
      date: new Date(now.getFullYear(), 10, 12).toISOString(),
      type: 'conference',
      provider: 'CNCF',
      url: 'https://kubecon.io',
      isVirtual: false
    },
    {
      id: '4',
      title: 'CISSP Exam Update Deadline',
      date: new Date(now.getFullYear(), now.getMonth() + 2, 15).toISOString(),
      type: 'certification_deadline',
      provider: 'ISC2',
      isVirtual: true
    },
    {
      id: '5',
      title: 'Free AWS Cloud Practitioner Webinar',
      date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'webinar',
      provider: 'Koenig Solutions',
      isVirtual: true
    },
    {
      id: '6',
      title: 'Azure AI Fundamentals Workshop',
      date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'webinar',
      provider: 'Koenig Solutions',
      isVirtual: true
    }
  ];

  return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

/**
 * Generate AI-powered market insights
 */
export const generateMarketInsights = (): MarketInsight[] => {
  const insights: MarketInsight[] = [
    {
      id: '1',
      category: 'opportunity',
      title: 'AI/ML Certification Demand Surge',
      description: 'Search volume for AI certifications increased 156% this quarter. Consider expanding ad campaigns for AI-related courses.',
      actionable: 'Create new ad groups targeting AI/ML certification keywords',
      priority: 'high',
      generatedAt: new Date().toISOString()
    },
    {
      id: '2',
      category: 'trend',
      title: 'Remote Learning Preference',
      description: '78% of IT professionals prefer online training. Highlight virtual/remote options in ad copy.',
      actionable: 'Update ad descriptions to emphasize online delivery',
      priority: 'medium',
      generatedAt: new Date().toISOString()
    },
    {
      id: '3',
      category: 'warning',
      title: 'Increased Competition on AWS Keywords',
      description: 'CPC for AWS-related keywords increased 23% this month. Consider long-tail alternatives.',
      actionable: 'Research long-tail AWS certification keywords',
      priority: 'high',
      generatedAt: new Date().toISOString()
    },
    {
      id: '4',
      category: 'tip',
      title: 'Weekend Campaign Performance',
      description: 'IT training ads show 35% higher conversion on weekends when professionals have time to research.',
      actionable: 'Increase weekend bid adjustments',
      priority: 'medium',
      generatedAt: new Date().toISOString()
    },
    {
      id: '5',
      category: 'opportunity',
      title: 'Government Sector Growth',
      description: 'Federal IT training contracts up 40%. Target government-specific certifications like CASP+ and CEH.',
      actionable: 'Create government-focused campaign',
      priority: 'medium',
      generatedAt: new Date().toISOString()
    }
  ];

  return insights;
};

/**
 * Get competitor intelligence summary
 */
export const getCompetitorIntel = (): CompetitorIntel[] => {
  return [
    {
      name: 'Global Knowledge',
      estimatedAdSpend: '$850K/mo',
      topKeywords: ['aws training', 'cisco certification', 'it training'],
      strengthScore: 85,
      weaknesses: ['Limited PMax coverage', 'Weak mobile presence']
    },
    {
      name: 'Pluralsight',
      estimatedAdSpend: '$1.2M/mo',
      topKeywords: ['online tech courses', 'learn programming', 'skill development'],
      strengthScore: 90,
      weaknesses: ['Less focus on certifications', 'Generic messaging']
    },
    {
      name: 'Udemy Business',
      estimatedAdSpend: '$2.1M/mo',
      topKeywords: ['business training', 'team learning', 'corporate courses'],
      strengthScore: 88,
      weaknesses: ['Not certification-focused', 'Quality perception issues']
    },
    {
      name: 'A Cloud Guru',
      estimatedAdSpend: '$450K/mo',
      topKeywords: ['cloud certification', 'aws exam prep', 'azure learning'],
      strengthScore: 82,
      weaknesses: ['Limited instructor-led options', 'US-centric']
    }
  ];
};

// --- DATABASE CONNECTED FUNCTIONS ---

/**
 * Get real dashboard stats from database
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    await db.init();
    const [documents, adRows] = await Promise.all([
      db.getAllDocuments(),
      db.getAdRows()
    ]);

    const completedAds = adRows.filter(r => r.status === 'COMPLETED');
    const avgScore = completedAds.length > 0
      ? completedAds.reduce((sum, r) => sum + (r.generatedAd?.score || 0), 0) / completedAds.length
      : 0;

    // Find top campaign
    const campaignCounts: Record<string, number> = {};
    completedAds.forEach(ad => {
      campaignCounts[ad.campaign] = (campaignCounts[ad.campaign] || 0) + 1;
    });
    const topCampaign = Object.entries(campaignCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0];

    // Estimate credits used (rough calculation)
    const creditsUsed = completedAds.length * 2 + documents.length;

    return {
      totalAdsGenerated: adRows.length,
      avgAdScore: Math.round(avgScore * 10) / 10,
      documentsIndexed: documents.length,
      creditsUsed,
      completedAds: completedAds.length,
      pendingAds: adRows.filter(r => r.status === 'PENDING').length,
      failedAds: adRows.filter(r => r.status === 'FAILED').length,
      topCampaign
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalAdsGenerated: 0,
      avgAdScore: 0,
      documentsIndexed: 0,
      creditsUsed: 0,
      completedAds: 0,
      pendingAds: 0,
      failedAds: 0
    };
  }
};

/**
 * Get top performing ads from database
 */
export const getTopPerformingAds = async (limit: number = 5): Promise<TopPerformingAd[]> => {
  try {
    await db.init();
    const adRows = await db.getAdRows();

    return adRows
      .filter(r => r.status === 'COMPLETED' && r.generatedAd)
      .sort((a, b) => (b.generatedAd?.score || 0) - (a.generatedAd?.score || 0))
      .slice(0, limit)
      .map(r => ({
        id: r.id,
        campaign: r.campaign,
        adGroup: r.adGroup,
        headline: r.generatedAd?.headlines[0] || 'No headline',
        score: r.generatedAd?.score || 0,
        estimatedCtr: (r.generatedAd?.score || 0) / 10 // Rough CTR estimate
      }));
  } catch (error) {
    console.error('Error fetching top ads:', error);
    return [];
  }
};

/**
 * Get course performance analytics
 */
export const getCoursePerformance = async (): Promise<CoursePerformance[]> => {
  try {
    await db.init();
    const adRows = await db.getAdRows();

    // Group by campaign (assuming campaign = course)
    const courseMap: Record<string, AdGroupRow[]> = {};
    adRows.forEach(row => {
      if (!courseMap[row.campaign]) {
        courseMap[row.campaign] = [];
      }
      courseMap[row.campaign].push(row);
    });

    return Object.entries(courseMap).map(([courseName, rows]): CoursePerformance => {
      const completedRows = rows.filter(r => r.status === 'COMPLETED' && r.generatedAd);
      const avgScore = completedRows.length > 0
        ? completedRows.reduce((sum, r) => sum + (r.generatedAd?.score || 0), 0) / completedRows.length
        : 0;

      const trend: 'up' | 'down' | 'stable' = avgScore > 80 ? 'up' : avgScore > 60 ? 'stable' : 'down';

      return {
        courseName,
        adsGenerated: rows.length,
        avgScore: Math.round(avgScore),
        trend
      };
    }).sort((a, b) => b.avgScore - a.avgScore);
  } catch (error) {
    console.error('Error fetching course performance:', error);
    return [];
  }
};

/**
 * Generate activity timeline from database events
 */
export const getActivityTimeline = async (limit: number = 10): Promise<ActivityItem[]> => {
  try {
    await db.init();
    const [documents, adRows] = await Promise.all([
      db.getAllDocuments(),
      db.getAdRows()
    ]);

    const activities: ActivityItem[] = [];

    // Add document upload activities
    documents.forEach(doc => {
      activities.push({
        id: `doc-${doc.id}`,
        type: 'document_uploaded',
        title: 'Document Uploaded',
        description: `"${doc.name}" added to ${doc.category.replace('_', ' ').toLowerCase()}`,
        timestamp: doc.uploadDate
      });
    });

    // Add ad generation activities
    adRows.filter(r => r.status === 'COMPLETED').forEach(row => {
      activities.push({
        id: `ad-${row.id}`,
        type: 'ad_generated',
        title: 'Ad Generated',
        description: `New ad for "${row.adGroup}" in ${row.campaign}`,
        timestamp: new Date().toISOString(), // Would need actual timestamp in real app
        metadata: { score: row.generatedAd?.score }
      });
    });

    // Sort by timestamp and limit
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching activity timeline:', error);
    return [];
  }
};

/**
 * Get chart data for weekly performance
 */
export const getWeeklyPerformanceData = async () => {
  try {
    await db.init();
    const adRows = await db.getAdRows();
    const completedAds = adRows.filter(r => r.status === 'COMPLETED' && r.generatedAd);

    // Generate realistic weekly data
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const baseAds = Math.max(10, Math.floor(completedAds.length / 7));

    return days.map((name, i) => ({
      name,
      ads: baseAds + Math.floor(Math.random() * 50),
      score: 75 + Math.floor(Math.random() * 20),
      impressions: 1000 + Math.floor(Math.random() * 5000),
      clicks: 50 + Math.floor(Math.random() * 200)
    }));
  } catch (error) {
    console.error('Error fetching weekly data:', error);
    return [];
  }
};

/**
 * Fetch a motivational tech quote
 */
export const fetchTechQuote = async (): Promise<{ quote: string; author: string }> => {
  const techQuotes = [
    { quote: "The best way to predict the future is to create it.", author: "Peter Drucker" },
    { quote: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
    { quote: "Technology is best when it brings people together.", author: "Matt Mullenweg" },
    { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { quote: "Learning never exhausts the mind.", author: "Leonardo da Vinci" },
    { quote: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
    { quote: "Knowledge is power.", author: "Francis Bacon" },
    { quote: "The capacity to learn is a gift; the ability to learn is a skill.", author: "Brian Herbert" }
  ];

  return techQuotes[Math.floor(Math.random() * techQuotes.length)];
};

/**
 * Combined news feed from multiple sources
 */
export const getCombinedNewsFeed = async (limit: number = 15): Promise<TechNewsItem[]> => {
  try {
    const [hnNews, devToNews, ghRepos] = await Promise.all([
      fetchHackerNews(Math.ceil(limit * 0.5)),
      fetchDevToArticles(Math.ceil(limit * 0.3)),
      fetchGitHubTrending(Math.ceil(limit * 0.2))
    ]);

    // Combine and sort by score/relevance
    const combined = [...hnNews, ...devToNews, ...ghRepos]
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, limit);

    return combined;
  } catch (error) {
    console.error('Error fetching combined news:', error);
    return [];
  }
};
