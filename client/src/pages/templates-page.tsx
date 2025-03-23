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
import { ClipboardList } from "lucide-react";

export default function TemplatesPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: templates, isLoading } = useQuery<SurveyTemplate[]>({
    queryKey: ["/api/templates"],
  });

  const handleUseTemplate = (template: SurveyTemplate) => {
    // Instead of creating the survey directly, redirect to create page with template data
    setLocation(`/create?template=${encodeURIComponent(JSON.stringify(template))}`);
  };

  return (
    <div className="container py-8">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates?.map((template) => (
            <Card key={template.id} className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>{template.title}</CardTitle>
                <CardDescription>
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <p className="text-sm text-muted-foreground mb-4">
                  {template.questions.length} questions
                </p>
                <Button
                  className="w-full mt-auto"
                  onClick={() => handleUseTemplate(template)}
                >
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Use Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}