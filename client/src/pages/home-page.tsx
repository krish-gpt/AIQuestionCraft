import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Survey } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, BarChart3, Share2, ClipboardList, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const { data: surveys, isLoading } = useQuery<Survey[]>({
    queryKey: ["/api/surveys"],
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <ClipboardList className="h-12 w-12 text-primary" />
              <div>
                <h1 className="text-4xl font-bold">Home Page</h1>
                <p className="text-xl text-muted-foreground">
                  Hello, {user?.username}!
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? (
                "Logging out..."
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </>
              )}
            </Button>
          </div>
          <p className="text-xl text-muted-foreground mb-6">
            Create and analyze surveys with AI-powered insights.
          </p>
          <Button asChild size="lg">
            <Link href="/create">
              <Plus className="mr-2 h-5 w-5" />
              Create New Survey
            </Link>
          </Button>
        </div>

        {/* Surveys Section */}
        <Card>
          <CardHeader>
            <CardTitle>Your Surveys</CardTitle>
            <CardDescription>
              View, manage, and analyze your surveys
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : surveys?.length === 0 ? (
              <div className="text-center py-16">
                <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No surveys yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first survey to get started with collecting responses and insights.
                </p>
                <Button asChild>
                  <Link href="/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Survey
                  </Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {surveys?.map((survey) => (
                    <TableRow key={survey.id}>
                      <TableCell className="font-medium">
                        {survey.title}
                      </TableCell>
                      <TableCell className="max-w-md truncate">
                        {survey.description}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            survey.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {survey.isActive ? "Active" : "Closed"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="inline-flex items-center"
                        >
                          <Link href={`/analytics/${survey.id}`}>
                            <BarChart3 className="h-4 w-4 mr-1" />
                            Analytics
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const url = `${window.location.origin}/survey/${survey.id}`;
                            navigator.clipboard.writeText(url);
                            toast({
                              title: "Link copied",
                              description: "Survey link copied to clipboard",
                            });
                          }}
                          className="inline-flex items-center"
                        >
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}