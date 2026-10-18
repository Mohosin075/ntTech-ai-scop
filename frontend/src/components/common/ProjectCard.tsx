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
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 flex flex-col justify-between hover:border-zinc-700 transition">
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-sm text-zinc-100 line-clamp-1">
            {project.title}
          </h4>
          <StatusBadge status={project.status} />
        </div>

        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
          {project.executiveSummary}
        </p>

        <div className="pt-2 flex items-center justify-between border-t border-zinc-800 text-xs">
          <StatusBadge risk={project.riskLevel} />
          <span className="text-zinc-500 font-mono text-[11px] flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(project.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
          <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 block uppercase">Quote</span>
            <span className="font-bold text-emerald-400 flex items-center text-sm">
              <DollarSign className="w-3.5 h-3.5 -mr-0.5" />
              {project.finalTotalCost.toLocaleString()}
            </span>
          </div>
          <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 block uppercase">Timeline</span>
            <span className="font-medium text-zinc-300 flex items-center gap-1 text-xs mt-0.5">
              <Clock className="w-3 h-3 text-zinc-400" />
              {project.totalHours}h ({project.estimatedWeeks}w)
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-zinc-800">
        <Link
          href={`/projects/${project.id}`}
          className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-medium text-zinc-200 transition"
        >
          <span>Open Workspace</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;
