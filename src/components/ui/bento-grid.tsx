import { ReactNode } from "react";
import { ArrowRightIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const BentoGrid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[22rem] grid-cols-3 gap-4",
        className,
      )}
    >
      {children}
    </div>
  );
};

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
  noHover,
}: {
  name: string;
  className: string;
  background: ReactNode;
  Icon: any;
  description: string;
  href: string;
  cta: string;
  noHover?: boolean;
}) => (
  <div
    key={name}
    className={cn(
      "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-xl",
      // Dark space theme styles
      "bg-gradient-to-br from-card/60 to-background/80 border border-primary/20",
      "[box-shadow:0_0_0_1px_rgba(155,135,245,0.1),0_4px_20px_rgba(0,0,0,0.6),0_16px_40px_rgba(0,0,0,0.4)]",
      "backdrop-blur-sm",
      !noHover && "hover:border-primary/40 hover:shadow-[0_0_0_1px_rgba(155,135,245,0.2),0_8px_32px_rgba(0,0,0,0.8)]",
      "transition-all duration-300",
      className,
    )}
  >
    <div>{background}</div>
    <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-1 p-6 transition-all duration-300 group-hover:-translate-y-10">
      <Icon className="h-12 w-12 origin-left transform-gpu text-primary transition-all duration-300 ease-in-out group-hover:scale-75" />
      <h3 className="text-xl font-semibold text-white">
        {name}
      </h3>
      <p className="max-w-lg text-white/70">{description}</p>
    </div>

    <div
      className={cn(
        "pointer-events-none absolute bottom-0 flex w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300",
        !noHover && "group-hover:translate-y-0 group-hover:opacity-100",
      )}
    >
      {href && cta && (
        <Button variant="ghost" asChild size="sm" className="pointer-events-auto text-primary hover:text-primary/80 hover:bg-primary/10">
          <a href={href}>
            {cta}
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </a>
        </Button>
      )}
    </div>
    <div className={cn(
      "pointer-events-none absolute inset-0 transform-gpu transition-all duration-300",
      !noHover && "group-hover:bg-primary/5"
    )} />
  </div>
);

export { BentoCard, BentoGrid };
