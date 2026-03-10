"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, LucideIcon } from "lucide-react";

interface AdminPageHeaderProps {
	title: string;
	subtitle?: string;
	backHref: string;
	action?: React.ReactNode;
}

export function AdminPageHeader({
	title,
	subtitle,
	backHref,
	action
}: AdminPageHeaderProps) {
	return (
		<div className="flex flex-col gap-6 mb-8">
			<div className="flex items-center justify-between">
				<Link
					href={backHref}
					className="text-[#999] hover:text-[#1a1a2e] flex items-center gap-2 transition-colors text-[0.85rem] no-underline group"
				>
					<div className="w-8 h-8 rounded-full bg-white border border-[#eaedf0] flex items-center justify-center group-hover:border-[#e20074] group-hover:text-[#e20074] transition-all">
						<ArrowLeft className="w-4 h-4" />
					</div>
					Zurück zur Übersicht
				</Link>
				{action}
			</div>

			<div>
				<h1 className="text-[1.8rem] font-extrabold text-[#1a1a2e] tracking-tight m-0">
					{title}
				</h1>
				{subtitle && (
					<p className="text-[0.95rem] text-[#999] mt-1 m-0">{subtitle}</p>
				)}
			</div>
		</div>
	);
}

interface AdminFormContainerProps {
	children: React.ReactNode;
}

export function AdminFormContainer({ children }: AdminFormContainerProps) {
	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
			<div className="lg:col-span-2 space-y-8">{children}</div>
			{/* Right sidebar space for future metadata/hints if needed */}
			<div className="hidden lg:block space-y-6">
				<div className="bg-[#f0f2f5]/50 border border-dashed border-[#eaedf0] rounded-3xl p-6">
					<h4 className="text-[0.85rem] font-bold text-[#1a1a2e] mb-3">
						Hinweise
					</h4>
					<p className="text-[0.78rem] text-[#888] leading-relaxed">
						Änderungen werden sofort im System übernommen und sind für alle
						berechtigten Benutzer sichtbar. Bitte prüfe die Eingaben vor dem
						Speichern.
					</p>
				</div>
			</div>
		</div>
	);
}

interface AdminFormSectionProps {
	title: string;
	description?: string;
	children: React.ReactNode;
	icon?: LucideIcon;
	action?: React.ReactNode;
}

export function AdminFormSection({
	title,
	description,
	children,
	icon: Icon,
	action
}: AdminFormSectionProps) {
	return (
		<div className="bg-white rounded-[2rem] border border-[#eaedf0] shadow-sm overflow-hidden">
			<div className="px-8 py-6 border-b border-[#f7f8fa] flex items-center justify-between">
				<div className="flex items-center gap-3">
					{Icon && (
						<div className="p-2 rounded-xl bg-[#e20074]/5 text-[#e20074]">
							<Icon className="w-4 h-4" />
						</div>
					)}
					<div>
						<h3 className="text-[1.05rem] font-bold text-[#1a1a2e] m-0">
							{title}
						</h3>
						{description && (
							<p className="text-[0.78rem] text-[#999] mt-0.5 m-0 font-medium">
								{description}
							</p>
						)}
					</div>
				</div>
				{action && <div>{action}</div>}
			</div>
			<div className="p-8 space-y-6">{children}</div>
		</div>
	);
}
