import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "../ui/alert-dialog";

interface AlertProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAction: () => void;
    title: string;
    description: string;
    actionText: string;
}

export default function Alert({ open, onOpenChange, onAction, title, description, actionText }: AlertProps) {
    return (
        <AlertDialog 
            open={open} 
            onOpenChange={onOpenChange}
        >
            <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{title}</AlertDialogTitle>
                <AlertDialogDescription>
                {description}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                    onClick={onAction}
                    className="bg-red-400 hover:bg-red-500"
                >
                    {actionText}
                </AlertDialogAction>
            </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}