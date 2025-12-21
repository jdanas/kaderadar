import { JobStats } from "@/types/job";
import { Briefcase, Globe, Search } from "lucide-react";

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
        <Globe className="h-4 w-4" />
        <span>{stats.google} Google</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="font-semibold text-xs">IN</span>
        <span>{stats.indeed} Indeed</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="font-semibold text-xs">SG</span>
        <span>{stats.careersgov} Gov</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Search className="h-4 w-4" />
        <span>{stats.jobstreet + stats.mycareersfuture} Others</span>
      </div>
    </div>
  );
}
