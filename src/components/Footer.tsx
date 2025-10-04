'use client';
import React from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Rocket, Database, BookOpen, GithubIcon, TwitterIcon, LinkedinIcon, YoutubeIcon } from 'lucide-react';

interface FooterLink {
	title: string;
	href: string;
	icon?: React.ComponentType<{ className?: string }>;
}

interface FooterSection {
	label: string;
	links: FooterLink[];
}

const footerLinks: FooterSection[] = [
	{
		label: 'Exoplanet Data',
		links: [
			{ title: 'K2 Dataset', href: '#k2' },
			{ title: 'Kepler Dataset', href: '#kepler' },
			{ title: 'TESS Dataset', href: '#tess' },
			{ title: 'Data Sources', href: '/sources' },
		],
	},
	{
		label: 'AI Classification',
		links: [
			{ title: 'How It Works', href: '/how-it-works' },
			{ title: 'ML Models', href: '/models' },
			{ title: 'Accuracy', href: '/accuracy' },
			{ title: 'Research Papers', href: '/papers' },
		],
	},
	{
		label: 'Resources',
		links: [
			{ title: 'Documentation', href: '/docs' },
			{ title: 'API Reference', href: '/api' },
			{ title: 'Tutorials', href: '/tutorials' },
			{ title: 'Community', href: '/community' },
		],
	},
	{
		label: 'Connect',
		links: [
			{ title: 'GitHub', href: '#', icon: GithubIcon },
			{ title: 'Twitter', href: '#', icon: TwitterIcon },
			{ title: 'YouTube', href: '#', icon: YoutubeIcon },
			{ title: 'LinkedIn', href: '#', icon: LinkedinIcon },
		],
	},
];

export function Footer() {
	return (
		<footer className="md:rounded-t-6xl relative w-full flex flex-col items-center justify-center rounded-t-4xl border-t border-primary/20 bg-gradient-to-b from-card/50 to-background/80 px-6 py-12 lg:py-16">
			<div className="bg-primary/30 absolute top-0 right-1/2 left-1/2 h-px w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full blur" />

			<div className="grid w-full max-w-6xl mx-auto gap-8 xl:grid-cols-3 xl:gap-8">
				<AnimatedContainer className="space-y-4">
					<div className="flex items-center gap-2">
						<Rocket className="size-8 text-primary" />
						<span className="text-xl font-bold text-primary">ExoClass</span>
					</div>
					<p className="text-muted-foreground mt-8 text-sm md:mt-0">
						Discover exoplanets with AI-powered classification using NASA's K2, Kepler, and TESS datasets.
					</p>
					<p className="text-muted-foreground text-xs">
						© {new Date().getFullYear()} ExoClass. All rights reserved.
					</p>
				</AnimatedContainer>

				<div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4 xl:col-span-2 xl:mt-0">
					{footerLinks.map((section, index) => (
						<AnimatedContainer key={section.label} delay={0.1 + index * 0.1}>
							<div className="mb-10 md:mb-0">
								<h3 className="text-xs font-semibold text-primary mb-4">{section.label}</h3>
								<ul className="text-muted-foreground mt-4 space-y-2 text-sm">
									{section.links.map((link) => (
										<li key={link.title}>
											<a
												href={link.href}
												className="hover:text-primary inline-flex items-center transition-all duration-300 hover:translate-x-1"
											>
												{link.icon && <link.icon className="me-2 size-4" />}
												{link.title}
											</a>
										</li>
									))}
								</ul>
							</div>
						</AnimatedContainer>
					))}
				</div>
			</div>

			{/* Additional space-themed decoration */}
			<div className="mt-8 flex items-center gap-4 text-xs text-muted-foreground">
				<div className="flex items-center gap-1">
					<span>Powered by NASA Data</span>
				</div>
				<div className="w-px h-4 bg-border" />
				<div className="flex items-center gap-1">
					<Database className="size-3" />
					<span>Machine Learning</span>
				</div>
				<div className="w-px h-4 bg-border" />
				<div className="flex items-center gap-1">
					<BookOpen className="size-3" />
					<span>Open Source</span>
				</div>
			</div>
		</footer>
	);
};

type ViewAnimationProps = {
	delay?: number;
	className?: ComponentProps<typeof motion.div>['className'];
	children: ReactNode;
};

function AnimatedContainer({ className, delay = 0.1, children }: ViewAnimationProps) {
	const shouldReduceMotion = useReducedMotion();

	if (shouldReduceMotion) {
		return children;
	}

	return (
		<motion.div
			initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
			whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
			viewport={{ once: true }}
			transition={{ delay, duration: 0.8 }}
			className={className}
		>
			{children}
		</motion.div>
	);
};
