import { Job } from "@/types/job";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, MapPin, Building2, Banknote, CheckCircle } from "lucide-react";

interface JobCardProps {
  job: Job;
  isApplied?: boolean;
  onApply?: () => void;
}

export function JobCard({ job, isApplied = false, onApply }: JobCardProps) {
  return (
    <Card className={`hover:shadow-md transition-shadow ${isApplied ? 'border-green-200 bg-green-50/10' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-lg leading-tight">
              {job.title}
            </CardTitle>
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <Building2 className="h-3.5 w-3.5" />
              <span>{job.company}</span>
            </div>
          </div>
          <Badge variant="outline" className="shrink-0">
            {job.source_platform}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            <span>{job.location}</span>
          </div>
          {job.salary && (
            <div className="flex items-center gap-1">
              <Banknote className="h-3.5 w-3.5" />
              <span>{job.salary}</span>
            </div>
          )}
        </div>

        {job.job_type && (
          <Badge variant="secondary" className="text-xs">
            {job.job_type}
          </Badge>
        )}

        {job.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {job.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-2">
          {job.posted_date && (
            <span className="text-xs text-muted-foreground">
              Posted: {job.posted_date}
            </span>
          )}
          <Button 
            variant={isApplied ? "secondary" : "outline"} 
            size="sm" 
            asChild={!isApplied}
            className="ml-auto"
            onClick={onApply}
            disabled={isApplied}
          >
            {isApplied ? (
              <span>Applied</span>
            ) : (
              <a href={job.source_url} target="_blank" rel="noopener noreferrer">
                Apply <ExternalLink className="h-3.5 w-3.5 ml-2" />
              </a>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
