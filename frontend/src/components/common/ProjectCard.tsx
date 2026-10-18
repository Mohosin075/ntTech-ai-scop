import React from 'react';
import Link from 'next/link';
import { Project } from '@/types';
import StatusBadge from '@/components/common/StatusBadge';
import { ArrowRight, Calendar, Clock, DollarSign } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <div className="border-l-2 border-l-emerald-500 bg-zinc-900/30 border-y border-r border-zinc-800/80 p-4 flex flex-col justify-between hover:bg-zinc-900/60 transition-colors">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-sm text-zinc-100 line-clamp-1">
            {project.title}
          </h4>
          <StatusBadge status={project.status} />
        </div>

        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed font-sans">
          {project.executiveSummary}
        </p>

        <div className="pt-2 flex items-center justify-between border-t border-zinc-800/70 text-xs">
          <StatusBadge risk={project.riskLevel} />
          <span className="text-zinc-500 font-mono text-[11px] flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(project.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
          <div className="p-2 bg-zinc-950/70 border-l border-zinc-800">
            <span className="text-xs text-zinc-500 block font-sans">Quote</span>
            <span className="font-semibold text-emerald-400 flex items-center text-sm mt-0.5">
              <DollarSign className="w-3.5 h-3.5 -mr-0.5" />
              {project.finalTotalCost.toLocaleString()}
            </span>
          </div>
          <div className="p-2 bg-zinc-950/70 border-l border-zinc-800">
            <span className="text-xs text-zinc-500 block font-sans">Timeline</span>
            <span className="font-medium text-zinc-300 flex items-center gap-1 text-xs mt-0.5">
              <Clock className="w-3 h-3 text-zinc-400" />
              {project.totalHours}h ({project.estimatedWeeks}w)
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-zinc-800/70">
        <Link
          href={`/projects/${project.id}`}
          className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-medium text-zinc-200 transition-colors"
        >
          <span>Open workspace</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;
