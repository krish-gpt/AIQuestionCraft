import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Survey, Response } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import { Button } from "@/components/ui/button";
import { Share2, Loader2 } from "lucide-react";

export default function Analytics({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const surveyId = parseInt(params.id);

  const { data: survey, isLoading: surveyLoading } = useQuery<Survey>({
    queryKey: [`/api/surveys/${surveyId}`],
  });

  const { data: responses, isLoading: responsesLoading } = useQuery<Response[]>({
    queryKey: [`/api/surveys/${surveyId}/responses`],
  });

  if (surveyLoading || responsesLoading) {
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

  const getQuestionStats = (questionId: string) => {
    if (!responses) return [];

    const question = survey.questions.find((q) => q.id === questionId);
    if (!question) return [];

    if (question.type === "multiple_choice") {
      const counts = responses.reduce((acc, response) => {
        const answer = response.answers[questionId];
        acc[answer] = (acc[answer] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(counts).map(([name, value]) => ({
        name,
        value,
      }));
    }

    if (question.type === "rating") {
      const counts = responses.reduce((acc, response) => {
        const answer = response.answers[questionId];
        acc[answer] = (acc[answer] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return [1, 2, 3, 4, 5].map((rating) => ({
        name: rating.toString(),
        value: counts[rating.toString()] || 0,
      }));
    }

    return [];
  };

  const averageSentiment = responses?.reduce((sum, response) => {
    return sum + (response.sentiment?.rating || 0);
  }, 0) / (responses?.length || 1);

  return (
    <div className="container max-w-6xl py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{survey.title}</h1>
          <p className="text-muted-foreground">
            {survey.description}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            navigator.clipboard.writeText(
              `${window.location.origin}/survey/${survey.id}`,
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

      <div className="grid gap-8 grid-cols-1 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {responses?.length || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average Sentiment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {averageSentiment.toFixed(1)} / 5
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                survey.isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {survey.isActive ? "Active" : "Closed"}
            </span>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="charts">
        <TabsList>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="responses">Individual Responses</TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-8">
          {survey.questions
            .filter((q) => q.type !== "text")
            .map((question) => (
              <Card key={question.id}>
                <CardHeader>
                  <CardTitle>{question.text}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getQuestionStats(question.id)}>
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
            ))}
        </TabsContent>

        <TabsContent value="responses">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Submitted At</TableHead>
                    <TableHead>Sentiment</TableHead>
                    {survey.questions.map((question) => (
                      <TableHead key={question.id}>
                        {question.text}
                      </TableHead>
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
                              ({(response.sentiment.confidence * 100).toFixed(0)}% confidence)
                            </span>
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                      {survey.questions.map((question) => (
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
      </Tabs>
    </div>
  );
}
