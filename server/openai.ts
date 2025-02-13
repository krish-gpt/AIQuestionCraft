import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateSurveyQuestions(topic: string, count: number = 5) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
            "You are a survey design expert. Generate survey questions that are clear, unbiased, and effective at gathering insights. Include a mix of multiple choice and open-ended questions. Format response as JSON array of questions.",
        },
        {
          role: "user",
          content: `Generate ${count} survey questions about ${topic}. Include question text, type (multiple_choice/text/rating), and options for multiple choice questions.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result.questions;
  } catch (error) {
    throw new Error("Failed to generate questions: " + error.message);
  }
}

interface SentimentAnalysis {
  rating: number;
  confidence: number;
  aspects: {
    category: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    score: number;
    key_phrases: string[];
  }[];
  summary: string;
}

export async function analyzeSentiment(text: string): Promise<SentimentAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a sentiment analysis expert. Analyze the text for detailed sentiment insights. Break down the analysis by different aspects mentioned in the text. Provide a summary, overall rating, confidence score, and aspect-based analysis. Format the response as JSON with this structure: { rating: number 1-5, confidence: 0-1, aspects: Array<{category: string, sentiment: 'positive'|'negative'|'neutral', score: number 0-1, key_phrases: string[]}>, summary: string }",
        },
        {
          role: "user",
          content: text,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      rating: Math.max(1, Math.min(5, Math.round(result.rating))),
      confidence: Math.max(0, Math.min(1, result.confidence)),
      aspects: result.aspects,
      summary: result.summary,
    };
  } catch (error) {
    throw new Error("Failed to analyze sentiment: " + error.message);
  }
}

interface TrendAnalysis {
  overall_trends: {
    topic: string;
    trend: 'increasing' | 'decreasing' | 'stable';
    significance: number;
    supporting_evidence: string[];
  }[];
  key_insights: string[];
  recommendations: string[];
}

export async function analyzeTrends(responses: any[]): Promise<TrendAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a data analysis expert. Analyze the survey responses for trends, patterns, and insights. Focus on identifying meaningful trends and providing actionable recommendations. Format response as JSON.",
        },
        {
          role: "user",
          content: `Analyze these survey responses and identify key trends: ${JSON.stringify(responses)}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    throw new Error("Failed to analyze trends: " + error.message);
  }
}