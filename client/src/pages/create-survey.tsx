import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSurveySchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import { Loader2, GripVertical, Wand2, Plus, Trash2, ArrowLeft, Eye } from "lucide-react";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function CreateSurvey() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { user } = useAuth();

  const form = useForm({
    resolver: zodResolver(insertSurveySchema),
    defaultValues: {
      title: "",
      description: "",
      questions: [],
    },
  });

  const createSurveyMutation = useMutation({
    mutationFn: async (data) => {
      const res = await apiRequest("POST", "/api/surveys", data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Survey created",
        description: "Your survey is now ready to share",
      });
      navigate(`/analytics/${data.id}`);
    },
  });

  const generateQuestions = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to generate questions",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!form.getValues("title")) {
      toast({
        title: "Title required",
        description: "Please enter a survey title first",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const res = await apiRequest(
        "POST",
        "/api/generate-questions",
        { topic: form.getValues("title") }
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to generate questions");
      }
      const questions = await res.json();
      form.setValue("questions", questions);
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate questions",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const questions = form.getValues("questions");
    const [reorderedItem] = questions.splice(result.source.index, 1);
    questions.splice(result.destination.index, 0, reorderedItem);
    form.setValue("questions", questions);
  };

  const addQuestion = () => {
    const questions = form.getValues("questions") || [];
    form.setValue("questions", [
      ...questions,
      {
        id: crypto.randomUUID(),
        text: "",
        type: "text",
        options: [],
      },
    ]);
  };

  const PreviewSurvey = () => {
    const formData = form.getValues();

    return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{formData.title}</CardTitle>
            {formData.description && (
              <CardDescription>{formData.description}</CardDescription>
            )}
          </CardHeader>
        </Card>

        {formData.questions.map((question) => (
          <Card key={question.id}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Label>{question.text}</Label>
                {question.type === "text" ? (
                  <Textarea disabled placeholder="Text answer" />
                ) : question.type === "multiple_choice" ? (
                  <RadioGroup disabled>
                    {question.options?.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={option} />
                        <Label htmlFor={option}>{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : question.type === "rating" ? (
                  <RadioGroup className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <div key={rating} className="flex flex-col items-center">
                        <RadioGroupItem
                          value={rating.toString()}
                          id={`rating-${rating}`}
                          disabled
                        />
                        <Label htmlFor={`rating-${rating}`}>{rating}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="container max-w-3xl py-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => createSurveyMutation.mutate(data))}>
          <div className="space-y-8">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold mb-2">Create Survey</h1>
                <p className="text-muted-foreground">
                  Design your survey or let AI help you generate questions
                </p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Survey Details</CardTitle>
                <CardDescription>
                  Basic information about your survey
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Questions</CardTitle>
                  <CardDescription>
                    Add or generate survey questions
                  </CardDescription>
                </div>
                <div className="space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateQuestions}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="mr-2 h-4 w-4" />
                    )}
                    Generate Questions
                  </Button>
                  <Button type="button" onClick={addQuestion}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Question
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="questions">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-4"
                      >
                        {form.watch("questions")?.map((_, index) => (
                          <Draggable
                            key={form.getValues(`questions.${index}.id`)}
                            draggableId={form.getValues(`questions.${index}.id`)}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="flex items-start space-x-4 bg-muted/50 p-4 rounded-lg"
                              >
                                <div
                                  {...provided.dragHandleProps}
                                  className="mt-4"
                                >
                                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="flex-1 space-y-4">
                                  <FormField
                                    control={form.control}
                                    name={`questions.${index}.text`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Question Text</FormLabel>
                                        <FormControl>
                                          <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name={`questions.${index}.type`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Question Type</FormLabel>
                                        <Select
                                          onValueChange={field.onChange}
                                          defaultValue={field.value}
                                        >
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            <SelectItem value="text">Text</SelectItem>
                                            <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                            <SelectItem value="rating">Rating</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  {form.watch(`questions.${index}.type`) === "multiple_choice" && (
                                    <FormField
                                      control={form.control}
                                      name={`questions.${index}.options`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Options (one per line)</FormLabel>
                                          <FormControl>
                                            <Textarea
                                              {...field}
                                              value={(field.value || []).join("\n")}
                                              onChange={(e) =>
                                                field.onChange(
                                                  e.target.value
                                                    .split("\n")
                                                    .filter(Boolean)
                                                )
                                              }
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  )}
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive"
                                  onClick={() => {
                                    const questions = form.getValues("questions");
                                    questions.splice(index, 1);
                                    form.setValue("questions", questions);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-2">
              <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview Survey
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Survey Preview</DialogTitle>
                    <DialogDescription>
                      Here's how your survey will look to respondents
                    </DialogDescription>
                  </DialogHeader>
                  <PreviewSurvey />
                </DialogContent>
              </Dialog>

              <Button
                type="submit"
                size="lg"
                disabled={createSurveyMutation.isPending}
              >
                {createSurveyMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Survey...
                  </>
                ) : (
                  "Create Survey"
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}