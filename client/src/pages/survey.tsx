import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Survey, insertResponseSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function SurveyPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const surveyId = parseInt(params.id);

  const { data: survey, isLoading } = useQuery<Survey>({
    queryKey: [`/api/surveys/${surveyId}`],
  });

  const form = useForm({
    resolver: zodResolver(insertResponseSchema),
    defaultValues: {
      surveyId,
      answers: {},
    },
  });

  useEffect(() => {
    if (survey) {
      const defaultAnswers = Object.fromEntries(
        survey.questions.map((q) => [q.id, ""])
      );
      form.reset({ surveyId, answers: defaultAnswers });
    }
  }, [survey, surveyId, form]);

  const submitResponse = useMutation({
    mutationFn: async (data) => {
      const res = await apiRequest(
        "POST",
        `/api/surveys/${surveyId}/responses`,
        data
      );
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Response submitted",
        description: "Thank you for completing the survey!",
      });
      form.reset();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="container max-w-3xl py-8">
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
    <div className="container max-w-3xl py-8">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => submitResponse.mutate(data))}
          className="space-y-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>{survey.title}</CardTitle>
              {survey.description && (
                <CardDescription>{survey.description}</CardDescription>
              )}
            </CardHeader>
          </Card>

          {survey.questions.map((question) => (
            <Card key={question.id}>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name={`answers.${question.id}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{question.text}</FormLabel>
                      <FormControl>
                        {question.type === "text" ? (
                          <Textarea {...field} />
                        ) : question.type === "multiple_choice" ? (
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            {question.options?.map((option) => (
                              <div
                                key={option}
                                className="flex items-center space-x-2"
                              >
                                <RadioGroupItem value={option} id={option} />
                                <Label htmlFor={option}>{option}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        ) : question.type === "rating" ? (
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex space-x-2"
                          >
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <div key={rating} className="flex flex-col items-center">
                                <RadioGroupItem
                                  value={rating.toString()}
                                  id={`rating-${rating}`}
                                />
                                <Label htmlFor={`rating-${rating}`}>{rating}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        ) : null}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              disabled={submitResponse.isPending}
            >
              {submitResponse.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Survey"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
