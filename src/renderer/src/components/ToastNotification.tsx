import { toast } from "sonner";

interface ToastNotificationProps {
    title: string;
    description: string;
    Icon: React.FC<React.SVGProps<SVGSVGElement>>;
    label?: string;
    onAction?: () => void;
}

const ToastNotification = ({ title, description, Icon, label, onAction }: ToastNotificationProps) => {
    return toast(title, {
        description: description,
        action: {
            label: label ? label : "Close",
            onClick: () => onAction ? onAction() : console.log("Closed"),
        },
        icon: <Icon />,
        className: "flex gap-4"
    })
};

export default ToastNotification;
