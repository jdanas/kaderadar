import { JobStats } from "@/types/job";
import { Briefcase, Linkedin } from "lucide-react";

interface StatsBarProps {
  stats: JobStats | null;
}

export function StatsBar({ stats }: StatsBarProps) {
  if (!stats) return null;

  return (
    <div className="flex items-center gap-6 text-sm text-muted-foreground">
      <div className="flex items-center gap-1.5">
        <Briefcase className="h-4 w-4" />
        <span>{stats.total} jobs</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Linkedin className="h-4 w-4" />
        <span>{stats.linkedin} from LinkedIn</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="font-semibold text-xs">IN</span>
        <span>{stats.indeed} from Indeed</span>
      </div>
    </div>
  );
}
