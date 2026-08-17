import { createBrowserRouter, isRouteErrorResponse, Link, useRouteError } from "react-router";
import Home from "@/app/home";
import MainLayout from "@/layouts/main";
import { ErrorBoundary } from "@/components/error-boundary";

function RouterErrorThrower(): React.ReactNode {
    const error = useRouteError();

    if (isRouteErrorResponse(error)) {
        throw new Error(`${error.status} ${error.statusText}: ${error.data}`);
    }
    
    if (error instanceof Error) {
        throw error;
    }
    
    throw new Error(typeof error === 'string' ? error : JSON.stringify(error));
}

const router = createBrowserRouter([
    {
        path: "/",
        errorElement: (
            <ErrorBoundary>
                <RouterErrorThrower />
            </ErrorBoundary>
        ),
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <Home />
            },
            {
                path: "settings",
                element: <div className="flex flex-col items-center justify-center min-h-screen">
                    <Link to="/">Home</Link>
                </div>
            }
        ]
    },
])

export default router