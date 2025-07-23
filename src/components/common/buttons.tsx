import { Button } from "../ui/button"
import { cn } from "@/lib/utils"

import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    className?: string;
}

export const ActionButton = ({ children, className, ...props }: ButtonProps) => {
    return (
        <Button 
            {...props} 
            className={cn(
                "bg-indigo-500 hover:bg-indigo-600 transition-all duration-200 ease-in-out", 
                className
            )}
        >
            {children}
        </Button>
    )
}