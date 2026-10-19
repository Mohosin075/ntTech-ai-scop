import React from 'react';
import Link from 'next/link';
import { Project } from '@/types';
import StatusBadge from '@/components/common/StatusBadge';
import { ArrowRight, Clock } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <div
      className="rounded-2xl bg-white border border-[#d5deda] p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:border-[#a9c1bb] hover:shadow-lg hover:shadow-[#173f52]/[0.06] group"
    >
      <div className="space-y-2.5">
        {/* Top Row: Title + Status Badge */}
        <div className="flex flex-col items-start gap-2">
          <h4 className="font-semibold text-lg text-[#182b39] transition-colors line-clamp-1">
            {project.title}
          </h4>
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge status={project.status} />
            <StatusBadge risk={project.riskLevel} />
          </div>
        </div>

        {/* Middle: 1-line description */}
        <p className="text-[#526270] text-base line-clamp-1 leading-relaxed font-sans">
          {project.executiveSummary}
        </p>

        {/* Bottom Metrics: Flex in one line */}
        <div className="pt-3 border-t border-[#d5deda] flex items-center justify-between text-base">
          <div className="flex items-center gap-1.5">
            <span className="text-[#65717a] font-sans">Estimate:</span>
            <span className="text-[#182b39] font-medium">
              ${project.finalTotalCost.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#65717a] font-sans">Timeline:</span>
            <span className="text-[#304756] font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#65717a]" />
              {project.totalHours}h ({project.estimatedWeeks}w)
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3.5 pt-2.5 border-t border-[#d5deda]">
        <Link
          href={`/projects/${project.id}`}
          className="w-full inline-flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-[#edf4f2] hover:bg-[#e2eeea] border border-[#d5e2dd] hover:border-[#a9c1bb] text-base font-semibold text-[#173f52] transition-colors"
        >
          <span>View estimate</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;
