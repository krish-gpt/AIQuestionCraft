import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Survey, Response } from "@shared/schema";
import { Link } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import {
  Share2,
  Loader2,
  TrendingUp,
  MessageSquare,
  Brain,
  ArrowLeft,
} from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

// Define the structure of survey answers
interface SurveyAnswers {
  [questionId: string]: string;
}

interface InsightData {
  sentiment_analysis: {
    rating: number;
    confidence: number;
    aspects: {
      category: string;
      sentiment: "positive" | "negative" | "neutral";
      score: number;
      key_phrases: string[];
    }[];
    summary: string;
  };
  trends: {
    overall_trends: {
      topic: string;
      trend: "increasing" | "decreasing" | "stable";
      significance: number;
      supporting_evidence: string[];
    }[];
    key_insights: string[];
    recommendations: string[];
  };
  overallSentiment?: {
    averageRating: number;
    responseCount: number;
  };
}

interface ResponseSentiment {
  rating: number;
  confidence: number;
  aspects: {
    category: string;
    sentiment: "positive" | "negative" | "neutral";
    score: number;
    key_phrases: string[];
  }[];
  summary: string;
}

// Extend the Response type to include properly typed answers and sentiment
interface ExtendedResponse extends Omit<Response, "answers" | "sentiment"> {
  answers: SurveyAnswers;
  sentiment?: ResponseSentiment;
}

const calculateAverageSentiment = (responses: ExtendedResponse[] | undefined): number => {
  if (!responses || responses.length === 0) return 0;

  const total = responses.reduce((sum, response) => {
    // Ensure we have a number, defaulting to 0 if sentiment or rating is undefined
    const rating = typeof response.sentiment?.rating === 'number' ? response.sentiment?.rating : 0;
    return sum + rating;
  }, 0);

  return Number((total / responses.length).toFixed(1));
};

export default function Analytics({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const surveyId = params?.id ? parseInt(params.id) : null;

  const { data: survey, isLoading: surveyLoading } = useQuery<Survey>({
    queryKey: [`/api/surveys/${surveyId}`],
    enabled: !!surveyId,
    queryFn: async () => {
      const res = await fetch(`/api/surveys/${surveyId}`);
      if (!res.ok) throw new Error("Failed to fetch survey");
      return res.json();
    },
  });

  const { data: responses, isLoading: responsesLoading } = useQuery<ExtendedResponse[]>({
    queryKey: [`/api/surveys/${surveyId}/responses`],
    enabled: !!surveyId,
    queryFn: async () => {
      const res = await fetch(`/api/surveys/${surveyId}/responses`);
      if (!res.ok) throw new Error("Failed to fetch responses");
      return res.json();
    },
  });

  const { data: insights, isLoading: insightsLoading } = useQuery<InsightData>({
    queryKey: [`/api/surveys/${surveyId}/insights`],
    enabled: !!surveyId && responses ? responses.length > 0 : false,
    queryFn: async () => {
      const res = await fetch(`/api/surveys/${surveyId}/insights`);
      if (!res.ok) throw new Error("Failed to fetch insights");
      return res.json();
    },
  });

  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      if (!surveyId) return;
      const res = await fetch(`/api/surveys/${surveyId}/insights`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error("Failed to generate insights");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/surveys/${surveyId}/insights`],
      });
      toast({
        title: "Success",
        description: "AI insights have been generated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to generate insights",
        variant: "destructive",
      });
    },
  });

  const getQuestionStats = (questionId: string) => {
    if (!responses || !survey?.questions) return [];

    const question = survey.questions.find((q) => q.id === questionId);
    if (!question) return [];

    // For multiple choice questions
    if (question.type === "multiple_choice" && question.options) {
      const counts: Record<string, number> = {};

      // Initialize counts for all options
      question.options.forEach((option) => {
        counts[option] = 0;
      });

      // Count responses
      responses.forEach((response) => {
        const answer = response.answers[questionId];
        if (answer && typeof answer === "string") {
          counts[answer] = (counts[answer] || 0) + 1;
        }
      });

      return Object.entries(counts).map(([name, value]) => ({
        name,
        value,
      }));
    }

    // For rating questions
    if (question.type === "rating") {
      const counts: Record<string, number> = {};

      // Initialize counts for ratings 1-5
      for (let i = 1; i <= 5; i++) {
        counts[i.toString()] = 0;
      }

      // Count responses
      responses.forEach((response) => {
        const answer = response.answers[questionId];
        if (answer && typeof answer === "string") {
          counts[answer] = (counts[answer] || 0) + 1;
        }
      });

      return Array.from({ length: 5 }, (_, i) => i + 1).map((rating) => ({
        name: rating.toString(),
        value: counts[rating.toString()] || 0,
      }));
    }

    return [];
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800";
      case "negative":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return "↗";
      case "decreasing":
        return "↘";
      default:
        return "→";
    }
  };

  // If no valid survey ID, show error
  if (!surveyId) {
    return (
      <div className="container max-w-6xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Invalid Survey</CardTitle>
            <CardDescription>No valid survey ID provided.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (surveyLoading || responsesLoading || insightsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="container max-w-6xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Survey Not Found</CardTitle>
            <CardDescription>
              The survey you're looking for doesn't exist or has been removed.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }


  return (
    <div className="container max-w-6xl py-8">
      <div className="flex items-center space-x-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{survey?.title}</h1>
          <p className="text-muted-foreground">{survey?.description}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            navigator.clipboard.writeText(
              `${window.location.origin}/survey/${survey?.id}`,
            );
            toast({
              title: "Link copied",
              description: "Survey link copied to clipboard",
            });
          }}
        >
          <Share2 className="mr-2 h-4 w-4" />
          Share Survey
        </Button>
      </div>

      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{responses?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                survey?.isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {survey?.isActive ? "Active" : "Closed"}
            </span>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="responses">
        <TabsList>
          <TabsTrigger value="responses">
            <MessageSquare className="w-4 h-4 mr-2" />
            Individual Responses
          </TabsTrigger>
          <TabsTrigger value="charts">
            <TrendingUp className="w-4 h-4 mr-2" />
            Charts
          </TabsTrigger>
          <TabsTrigger value="insights">
            <Brain className="w-4 h-4 mr-2" />
            AI Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="responses">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Submitted At</TableHead>
                    <TableHead>Sentiment</TableHead>
                    {survey?.questions.map((question) => (
                      <TableHead key={question.id}>{question.text}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {responses?.map((response) => (
                    <TableRow key={response.id}>
                      <TableCell>
                        {format(new Date(response.submittedAt), "PPp")}
                      </TableCell>
                      <TableCell>
                        {response.sentiment ? (
                          <span>
                            {response.sentiment.rating} / 5
                            <span className="text-xs text-muted-foreground ml-1">
                              (
                              {(response.sentiment.confidence * 100).toFixed(0)}
                              % confidence)
                            </span>
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                      {survey?.questions.map((question) => (
                        <TableCell key={question.id}>
                          {response.answers[question.id]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts" className="space-y-8">
          {!responses?.length ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  No responses yet to generate charts.
                </div>
              </CardContent>
            </Card>
          ) : (
            survey?.questions
              ?.filter(
                (q) => q.type === "multiple_choice" || q.type === "rating",
              )
              .map((question) => {
                const data = getQuestionStats(question.id);
                return (
                  <Card key={question.id}>
                    <CardHeader>
                      <CardTitle>{question.text}</CardTitle>
                      <CardDescription>
                        {question.type === "rating"
                          ? "Rating distribution"
                          : "Response distribution"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="value" fill="hsl(var(--primary))" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-8">
          {!responses?.length ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  No responses yet to generate insights.
                </div>
              </CardContent>
            </Card>
          ) : !insights ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center space-y-4">
                  <Brain className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">
                    No AI Insights Generated Yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Generate AI-powered insights from your survey responses to
                    understand trends and sentiment.
                  </p>
                  <Button
                    onClick={() => generateInsightsMutation.mutate()}
                    disabled={generateInsightsMutation.isPending}
                  >
                    {generateInsightsMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Insights...
                      </>
                    ) : (
                      <>
                        <Brain className="mr-2 h-4 w-4" />
                        Generate Insights
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">AI Insights</h2>
                <Button
                  variant="outline"
                  onClick={() => generateInsightsMutation.mutate()}
                  disabled={generateInsightsMutation.isPending}
                >
                  {generateInsightsMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Regenerate Insights
                    </>
                  )}
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Overall Sentiment</CardTitle>
                  <CardDescription>
                    AI-powered analysis of response sentiments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <AlertTitle>Average Sentiment</AlertTitle>
                    <AlertDescription>
                      Average Rating: {calculateAverageSentiment(responses)} / 5
                      <br />
                      Based on {responses?.length || 0} responses
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Overall Trends</CardTitle>
                  <CardDescription>
                    Key trends and patterns identified across all responses
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    {insights.trends.overall_trends.map((trend, idx) => (
                      <div
                        key={idx}
                        className="border rounded-lg p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{trend.topic}</p>
                          <span className="text-lg">
                            {getTrendIcon(trend.trend)}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {trend.supporting_evidence.map(
                            (evidence, evidenceIdx) => (
                              <p
                                key={evidenceIdx}
                                className="text-sm text-muted-foreground"
                              >
                                • {evidence}
                              </p>
                            ),
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {insights.trends.key_insights &&
                    insights.trends.key_insights.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          Key Insights
                        </h3>
                        <div className="space-y-2">
                          {insights.trends.key_insights.map((insight, idx) => (
                            <Alert key={idx}>
                              <AlertTitle>Insight {idx + 1}</AlertTitle>
                              <AlertDescription>{insight}</AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </div>
                    )}

                  {insights.trends.recommendations &&
                    insights.trends.recommendations.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          Recommendations
                        </h3>
                        <div className="space-y-2">
                          {insights.trends.recommendations.map((rec, idx) => (
                            <Alert key={idx}>
                              <AlertTitle>Recommendation {idx + 1}</AlertTitle>
                              <AlertDescription>{rec}</AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sentiment Analysis</CardTitle>
                  <CardDescription>
                    AI-powered analysis of text responses
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Alert>
                    <AlertTitle>Overall Sentiment</AlertTitle>
                    <AlertDescription>
                      Average Rating: {calculateAverageSentiment(responses)} / 5
                      <br />
                      Based on {responses?.length || 0} responses
                    </AlertDescription>
                  </Alert>
                  {responses?.map(
                    (response, idx) =>
                      response.sentiment && (
                        <div key={idx} className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">
                                Response {idx + 1}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {response.sentiment.summary}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold">
                                {response.sentiment.rating}/5
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {(response.sentiment.confidence * 100).toFixed(
                                  0,
                                )}
                                % confidence
                              </p>
                            </div>
                          </div>

                          {response.sentiment.aspects &&
                            response.sentiment.aspects.length > 0 && (
                              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                                {response.sentiment.aspects.map(
                                  (aspect, aspectIdx) => (
                                    <div
                                      key={aspectIdx}
                                      className="border rounded-lg p-4 space-y-2"
                                    >
                                      <div className="flex items-center justify-between">
                                        <p className="font-medium">
                                          {aspect.category}
                                        </p>
                                        <span
                                          className={`px-2 py-1 rounded-full text-xs ${getSentimentColor(
                                            aspect.sentiment,
                                          )}`}
                                        >
                                          {aspect.sentiment}
                                        </span>
                                      </div>
                                      <div className="space-y-1">
                                        {aspect.key_phrases.map(
                                          (phrase, phraseIdx) => (
                                            <p
                                              key={phraseIdx}
                                              className="text-sm text-muted-foreground"
                                            >
                                              • {phrase}
                                            </p>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>
                            )}
                        </div>
                      ),
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}