import { useQuery } from "@tanstack/react-query";
import { SurveyTemplate } from "@shared/schema";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ClipboardList } from "lucide-react";

export default function TemplatesPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: templates, isLoading } = useQuery<SurveyTemplate[]>({
    queryKey: ["/api/templates"],
  });

  const handleUseTemplate = async (template: SurveyTemplate) => {
    try {
      const res = await apiRequest("POST", "/api/surveys", {
        title: template.title,
        description: template.description,
        questions: template.questions,
      });

      if (res.ok) {
        const survey = await res.json();
        toast({
          title: "Template used successfully",
          description: "Your new survey has been created from the template.",
        });
        setLocation(`/survey/${survey.id}`);
      }
    } catch (error) {
      toast({
        title: "Error using template",
        description: "Failed to create survey from template",
        variant: "destructive",
      });
    }
  };

  const templateCategories = templates
    ? [...new Set(templates.map((t) => t.category))]
    : [];

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Survey Templates</h1>
        <p className="text-muted-foreground">
          Choose from our pre-made templates to quickly create your survey
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : templates?.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No templates available</CardTitle>
            <CardDescription>
              Please check back later for survey templates
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-8">
          {templateCategories.map((category) => (
            <div key={category}>
              <h2 className="text-2xl font-semibold mb-4">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates
                  ?.filter((t) => t.category === category)
                  .map((template) => (
                    <Card key={template.id}>
                      <CardHeader>
                        <CardTitle>{template.title}</CardTitle>
                        <CardDescription>
                          {template.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          {template.questions.length} questions
                        </p>
                        <Button
                          className="w-full"
                          onClick={() => handleUseTemplate(template)}
                        >
                          Use Template
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}