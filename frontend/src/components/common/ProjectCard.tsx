import React from 'react';
import Link from 'next/link';
import { Project } from '@/types';
import { formatProjectTitle } from '@/lib/formatProjectTitle';
import { ArrowRight } from 'lucide-react';

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
  const status = {
    APPROVED: { label: 'Approved', color: 'text-[#28715f]', dot: 'bg-[#37836e]' },
    UNDER_REVIEW: { label: 'In review', color: 'text-[#8c6416]', dot: 'bg-[#d49b2b]' },
    REJECTED: { label: 'Changes requested', color: 'text-[#a44949]', dot: 'bg-[#c96b68]' },
    AI_ESTIMATED: { label: 'Draft', color: 'text-[#536b7c]', dot: 'bg-[#70899a]' },
  }[project.status] || { label: 'Draft', color: 'text-[#536b7c]', dot: 'bg-[#70899a]' };
  const risk = {
    LOW: { label: 'Low risk · 5%', color: 'text-[#53766a]', dot: 'bg-[#83a293]' },
    MEDIUM: { label: 'Medium risk · 12%', color: 'text-[#8c7042]', dot: 'bg-[#c6a15a]' },
    HIGH: { label: 'High risk · 20%', color: 'text-[#98605c]', dot: 'bg-[#c7837b]' },
  }[project.riskLevel] || { label: 'Medium risk · 12%', color: 'text-[#8c7042]', dot: 'bg-[#c6a15a]' };

  return (
    <div
      className="group flex flex-col justify-between rounded-2xl border border-[#e0e6e1] bg-white p-4 transition-colors duration-200 hover:border-[#bfd0c8] hover:shadow-[0_12px_32px_-26px_rgba(32,51,47,0.38)] sm:p-5"
    >
      <div className="space-y-3">
        <div className="space-y-2">
          <h4 className="line-clamp-3 min-h-0 font-semibold text-[17px] leading-6 text-[#20332f] transition-colors sm:line-clamp-2 sm:min-h-14 sm:text-lg sm:leading-7">
            {title}
          </h4>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-medium">
            <span className={`inline-flex items-center gap-1.5 ${status.color}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
            <span className={`inline-flex items-center gap-1.5 ${risk.color}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${risk.dot}`} />
              {risk.label}
            </span>
          </div>
        </div>

        <p className="line-clamp-2 min-h-0 font-sans text-sm leading-[1.375rem] text-[#68766f] sm:min-h-12 sm:leading-6">
          {summary}
        </p>

        {showCreator && project.createdBy?.name && (
          <p className="font-sans text-xs text-[#7b8781]">Created by {project.createdBy.name}</p>
        )}

        <div className="grid grid-cols-2 gap-3 border-t border-[#e5e9e5] pt-3">
          <div className="min-w-0">
            <p className="font-sans text-xs text-[#7b8781]">Project fee</p>
            <p className="mt-0.5 truncate text-base font-semibold text-[#20332f]">${project.finalTotalCost.toLocaleString()}</p>
          </div>
          <div className="min-w-0">
            <p className="font-sans text-xs text-[#7b8781]">Estimated effort</p>
            <p className="mt-0.5 truncate text-sm font-medium text-[#40534c]">{project.totalHours}h <span className="font-normal text-[#7b8781]">· {project.estimatedWeeks} weeks</span></p>
          </div>
        </div>
      </div>

      <div className="mt-3 border-t border-[#e5e9e5] pt-3">
        <Link
          href={`/projects/${project.id}`}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#f3f6f3] px-3 py-2.5 text-sm font-semibold text-[#29483f] transition-colors hover:bg-[#eaf1ec] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#43877a]/15 sm:text-base"
        >
          <span>Open estimate</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;
