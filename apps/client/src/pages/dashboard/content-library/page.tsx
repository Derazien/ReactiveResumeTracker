import { useState } from "react";
import { Plus, Upload, MagnifyingGlass, Funnel } from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@reactive-resume/ui";
import { Button } from "@reactive-resume/ui";
import { Input } from "@reactive-resume/ui";
import { Badge } from "@reactive-resume/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@reactive-resume/ui";

import { useContentLibrary } from "@/client/services/content-library/content-library";
import { CVUploadDialog } from "./_components/cv-upload-dialog";

const ContentLibraryPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const { data: content, isLoading, error } = useContentLibrary();

  // Content type categories
  const contentTypes = [
    { key: "all", label: "All Content", count: content?.length || 0 },
    { key: "WORK_EXPERIENCE", label: "Work Experience", count: 0 },
    { key: "PROJECT", label: "Projects", count: 0 },
    { key: "TECHNICAL_SKILL", label: "Technical Skills", count: 0 },
    { key: "SOFT_SKILL", label: "Soft Skills", count: 0 },
    { key: "EDUCATION", label: "Education", count: 0 },
    { key: "CERTIFICATION", label: "Certifications", count: 0 },
  ];

  // Count content by type
  if (content) {
    contentTypes.forEach((type) => {
      if (type.key !== "all") {
        type.count = content.filter((item) => item.type === type.key).length;
      }
    });
  }

  // Filter content based on search and type
  const filteredContent = content?.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      item.skills?.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = selectedType === "all" || item.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p>Loading your content library...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Failed to load content library</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Content Library</h1>
          <p className="text-muted-foreground">
            Manage your professional content for CV generation
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            className="flex items-center gap-2"
            onClick={() => setUploadDialogOpen(true)}
          >
            <Upload className="h-4 w-4" />
            Upload CV
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Content
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <MagnifyingGlass className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="secondary" className="flex items-center gap-2">
              <Funnel className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs value={selectedType} onValueChange={setSelectedType}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
          {contentTypes.map((type) => (
            <TabsTrigger key={type.key} value={type.key} className="text-sm">
              <div className="flex flex-col items-center">
                <span>{type.label}</span>
                <Badge variant="secondary" className="text-xs mt-1">
                  {type.count}
                </Badge>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        {contentTypes.map((type) => (
          <TabsContent key={type.key} value={type.key} className="mt-6">
            <ContentGrid 
              content={filteredContent || []} 
              type={type.key === "all" ? undefined : type.key}
            />
          </TabsContent>
        ))}
      </Tabs>

      {/* CV Upload Dialog */}
      <CVUploadDialog 
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
      />
    </div>
  );
};

// Content Grid Component
const ContentGrid = ({ content, type }: { content: any[], type?: string }) => {
  const displayContent = type ? content.filter(item => item.type === type) : content;

  if (displayContent.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">
          <p className="text-lg mb-2">No content found</p>
          <p className="text-sm">
            {type ? `Add some ${type.toLowerCase()} content` : "Start by uploading a CV or adding content manually"}
          </p>
        </div>
        <Button className="mt-4">
          <Plus className="h-4 w-4 mr-2" />
          Add Content
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayContent.map((item) => (
        <ContentCard key={item.id} item={item} />
      ))}
    </div>
  );
};

// Content Card Component
const ContentCard = ({ item }: { item: any }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "WORK_EXPERIENCE": return "💼";
      case "PROJECT": return "🚀";
      case "TECHNICAL_SKILL": return "💻";
      case "SOFT_SKILL": return "🤝";
      case "EDUCATION": return "🎓";
      case "CERTIFICATION": return "📜";
      default: return "📄";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "WORK_EXPERIENCE": return "bg-blue-50 text-blue-700 border-blue-200";
      case "PROJECT": return "bg-green-50 text-green-700 border-green-200";
      case "TECHNICAL_SKILL": return "bg-purple-50 text-purple-700 border-purple-200";
      case "SOFT_SKILL": return "bg-orange-50 text-orange-700 border-orange-200";
      case "EDUCATION": return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "CERTIFICATION": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // Ensure skills is always an array
  const skills = Array.isArray(item.skills) ? item.skills : [];

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getTypeIcon(item.type)}</span>
            <div>
              <CardTitle className="text-lg line-clamp-1">{item.title}</CardTitle>
              <Badge 
                variant="secondary" 
                className={`text-xs mt-1 ${getTypeColor(item.type)}`}
              >
                {item.type.replace("_", " ")}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {item.description || "No description available"}
        </p>
        
        {/* Skills/Tags */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {skills.slice(0, 3).map((skill: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {skills.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{skills.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Company/Date info */}
        {(item.company || item.position) && (
          <div className="text-xs text-muted-foreground">
            {item.company && <span>{item.company}</span>}
            {item.company && item.position && <span> • </span>}
            {item.position && <span>{item.position}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContentLibraryPage; 