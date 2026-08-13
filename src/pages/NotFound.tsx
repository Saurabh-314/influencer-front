import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {

    return (
        <div className="container flex flex-col items-center justify-center py-24 px-4 text-center">
            <p className="text-7xl font-bold text-primary/20 select-none">404</p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-2">Page not found</h1>
            <p className="text-muted-foreground mt-3 max-w-md leading-relaxed">
                The page you're looking for doesn't exist or may have been moved.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-8">
                <Button asChild>
                    <Link to="/">
                        <Home className="h-4 w-4" />
                        Go to Homepage
                    </Link>
                </Button>
            </div>
        </div>
    );
}
