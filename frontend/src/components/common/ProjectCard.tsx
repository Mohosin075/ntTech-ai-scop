import React from 'react';
import Link from 'next/link';
import { Project } from '@/types';
import StatusBadge from '@/components/common/StatusBadge';
import { ArrowRight, Calendar, Clock, DollarSign } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const statusBorderColor =
    project.status === 'APPROVED'
      ? 'border-l-emerald-500'
      : project.status === 'UNDER_REVIEW'
      ? 'border-l-amber-500'
      : project.status === 'REJECTED'
      ? 'border-l-rose-500'
      : 'border-l-blue-500';

  return (
    <div
      className={`rounded-lg bg-[#121214] hover:bg-[#18181B] border border-[#27272A] border-l-2 ${statusBorderColor} p-4 flex flex-col justify-between transition-colors group`}
    >
      <div className="space-y-2.5">
        {/* Top Row: Title + Status Badge */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-sm text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
            {project.title}
          </h4>
          <StatusBadge status={project.status} />
        </div>

        {/* Middle: 1-line description */}
        <p className="text-zinc-400 text-xs line-clamp-1 leading-relaxed font-sans">
          {project.executiveSummary}
        </p>

        {/* Bottom Metrics: Flex in one line */}
        <div className="pt-2 border-t border-[#27272A] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500 font-sans">Quote:</span>
            <span className="font-mono text-emerald-400 font-medium">
              ${project.finalTotalCost.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500 font-sans">Timeline:</span>
            <span className="font-mono text-zinc-300 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              {project.totalHours}h ({project.estimatedWeeks}w)
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3.5 pt-2.5 border-t border-[#27272A]">
        <Link
          href={`/projects/${project.id}`}
          className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md bg-[#18181B] hover:bg-[#27272A] hover:text-white border border-[#27272A] text-xs font-medium text-zinc-300 transition-colors"
        >
          <span>Open workspace</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;
