import React from 'react';
import Link from 'next/link';
import { Project } from '@/types';
import StatusBadge from '@/components/common/StatusBadge';
import { formatProjectTitle } from '@/lib/formatProjectTitle';
import { ArrowRight, Clock } from 'lucide-react';

const getDistinctSummary = (title: string, summary?: string) => {
  const clean = formatProjectTitle((summary || '')
    .replace(/^estimate\s+for\s+/i, '')
    .replace(/^["'“”]+|["'“”]+$/g, '')
    .replace(/^(?:the|a|an)\s+/i, '')
    .trim());
  if (!clean) return 'Open this estimate to review its scope and delivery plan.';

  const normalizedTitle = formatProjectTitle(title).replace(/^(?:the|a|an)\s+/i, '');
  const titleWords = normalizedTitle.toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
  const summaryWords = clean.toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
  let overlap = 0;
  while (overlap < titleWords.length && overlap < summaryWords.length && titleWords[overlap] === summaryWords[overlap]) {
    overlap += 1;
  }

  if (overlap >= 3) {
    const remaining = clean.split(/\s+/).slice(overlap).join(' ').replace(/^[\s:,.|—-]+/, '').trim();
    if (!remaining) return 'Review the detailed scope, features, and delivery plan.';
    const concise = remaining.replace(/^is\s+(?=(?:designed|built|intended)\s+to\b)/i, '');
    return concise.charAt(0).toUpperCase() + concise.slice(1);
  }

  return clean.charAt(0).toUpperCase() + clean.slice(1);
};

interface ProjectCardProps {
  project: Project;
  showCreator?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, showCreator = false }) => {
  const title = formatProjectTitle(project.title);
  const summary = getDistinctSummary(project.title, project.executiveSummary);

  return (
    <div
      className="rounded-2xl bg-white border border-[#d5deda] p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:border-[#a9c1bb] hover:shadow-lg hover:shadow-[#173f52]/[0.06] group"
    >
      <div className="space-y-2.5 sm:space-y-3">
        {/* Top Row: Title + Status Badge */}
        <div className="flex flex-col items-start gap-2">
          <h4 className="min-h-0 sm:min-h-14 font-semibold text-base sm:text-lg leading-6 sm:leading-7 text-[#182b39] transition-colors line-clamp-2">
            {title}
          </h4>
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge status={project.status} />
            <StatusBadge risk={project.riskLevel} />
            {showCreator && project.createdBy?.name && (
              <span className="text-xs text-[#65717a]">By {project.createdBy.name}</span>
            )}
          </div>
        </div>

        {/* Distinct project summary */}
        <p className="min-h-0 sm:min-h-12 text-[#526270] text-xs sm:text-sm line-clamp-2 leading-5 sm:leading-6 font-sans">
          {summary}
        </p>

        {/* Bottom Metrics: Flex in one line */}
        <div className="pt-2.5 sm:pt-3 border-t border-[#d5deda] flex items-center justify-between gap-2 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-[#65717a] font-sans">Project fee:</span>
            <span className="text-[#182b39] font-semibold">
              ${project.finalTotalCost.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[#65717a] font-sans hidden xs:inline">Effort:</span>
            <span className="text-[#304756] font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#65717a]" />
              {project.totalHours}h ({project.estimatedWeeks}w)
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-[#d5deda]">
        <Link
          href={`/projects/${project.id}`}
          className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 sm:py-3 px-3 rounded-xl bg-[#edf4f2] hover:bg-[#e2eeea] border border-[#d5e2dd] hover:border-[#a9c1bb] text-sm sm:text-base font-semibold text-[#173f52] transition-colors"
        >
          <span>View estimate</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;
