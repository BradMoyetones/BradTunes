import { cn } from '@xtunes/ui';
import * as React from 'react';

const CustomToast = React.forwardRef<HTMLLIElement, React.HTMLAttributes<HTMLLIElement> & { type?: string }>(
    ({ className, type = 'default', ...props }, ref) => {
        return (
            <li
                ref={ref}
                className={cn('cn-toast flex flex-col items-start gap-4 w-full', className)}
                data-sonner-toast=""
                data-styled="true"
                data-mounted="true"
                data-promise="false"
                data-swiped="false"
                data-removed="false"
                data-visible="true"
                data-y-position="bottom"
                data-x-position="right"
                data-index="0"
                data-front="true"
                data-swiping="false"
                data-dismissible="true"
                data-type={type}
                data-swipe-out="false"
                data-expanded="false"
                {...props}
            />
        );
    }
);
CustomToast.displayName = 'CustomToast';

const CustomToastHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => <div ref={ref} className={cn('flex gap-2 w-full', className)} {...props} />
);
CustomToastHeader.displayName = 'CustomToastHeader';

const CustomToastIcon = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} data-icon="" className={cn('shrink-0 mt-0.5', className)} {...props} />
    )
);
CustomToastIcon.displayName = 'CustomToastIcon';

const CustomToastContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} data-content="" className={cn('flex flex-col gap-1 w-full', className)} {...props} />
    )
);
CustomToastContent.displayName = 'CustomToastContent';

const CustomToastTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} data-title="" className={cn('text-sm font-semibold', className)} {...props} />
    )
);
CustomToastTitle.displayName = 'CustomToastTitle';

const CustomToastDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} data-description="" className={cn('text-sm opacity-90', className)} {...props} />
    )
);
CustomToastDescription.displayName = 'CustomToastDescription';

const CustomToastActions = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => <div ref={ref} className={cn('flex gap-2 w-fit ml-auto', className)} {...props} />
);
CustomToastActions.displayName = 'CustomToastActions';

export {
    CustomToast,
    CustomToastHeader,
    CustomToastIcon,
    CustomToastContent,
    CustomToastTitle,
    CustomToastDescription,
    CustomToastActions,
};
