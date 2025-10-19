import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FinancialCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  gradient?: boolean;
}

const FinancialCard = ({ title, description, children, className, gradient }: FinancialCardProps) => {
  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-lg",
      gradient && "gradient-card border-0",
      className
    )}>
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        {description && <CardDescription className="text-base">{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

export default FinancialCard;
