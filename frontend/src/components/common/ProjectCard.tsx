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
    <div className="rounded-2xl border border-gray-800 bg-[#111827] p-5 flex flex-col justify-between hover:border-gray-700 hover:shadow-xl transition group relative overflow-hidden">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-sm text-gray-50 line-clamp-1 group-hover:text-indigo-400 transition">
            {project.title}
          </h4>
          <StatusBadge status={project.status} />
        </div>

        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
          {project.executiveSummary}
        </p>

        <div className="pt-2 flex items-center justify-between border-t border-gray-800/80 text-xs">
          <StatusBadge risk={project.riskLevel} />
          <span className="text-gray-400 font-mono text-[11px] flex items-center gap-1">
            <Calendar className="w-3 h-3 text-gray-500" />
            {new Date(project.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
          <div className="p-2 rounded-lg bg-[#090D16] border border-gray-800/80">
            <span className="text-[10px] text-gray-500 block uppercase">Total Cost</span>
            <span className="font-bold text-gray-50 flex items-center text-sm text-emerald-400">
              <DollarSign className="w-3.5 h-3.5 -mr-0.5" />
              {project.finalTotalCost.toLocaleString()}
            </span>
          </div>
          <div className="p-2 rounded-lg bg-[#090D16] border border-gray-800/80">
            <span className="text-[10px] text-gray-500 block uppercase">Timeline</span>
            <span className="font-medium text-gray-300 flex items-center gap-1 text-xs mt-0.5">
              <Clock className="w-3 h-3 text-sky-400" />
              {project.totalHours}h • {project.estimatedWeeks}w
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-800/80">
        <Link
          href={`/projects/${project.id}`}
          className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gray-800/80 hover:bg-indigo-600 text-xs font-semibold text-gray-200 hover:text-white transition group-hover:bg-indigo-600"
        >
          <span>View Workspace</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;
