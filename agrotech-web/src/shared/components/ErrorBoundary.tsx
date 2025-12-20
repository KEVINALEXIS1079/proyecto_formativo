import React, { Component, type ReactNode } from 'react';
import { Card, CardBody, Button } from '@heroui/react';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing
 * the entire application.
 * 
 * Usage:
 * <ErrorBoundary>
 *   <ComponentThatMightError />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        // Update state so the next render will show the fallback UI
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error details to console for debugging
        console.error('Error Boundary caught an error:', error, errorInfo);
    }

    handleReset = () => {
        // Reset error state to allow retry
        this.setState({
            hasError: false,
            error: null,
        });
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback UI
            return (
                <Card className="border-2 border-danger-200 bg-danger-50/50">
                    <CardBody className="text-center py-8">
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-danger-100 rounded-full">
                                <AlertTriangle className="h-8 w-8 text-danger-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-danger-900 mb-2">
                                    Algo salió mal
                                </h3>
                                <p className="text-sm text-danger-700 mb-4">
                                    {this.state.error?.message || 'Ha ocurrido un error inesperado'}
                                </p>
                                <Button
                                    color="danger"
                                    variant="flat"
                                    onPress={this.handleReset}
                                    size="sm"
                                >
                                    Intentar de nuevo
                                </Button>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            );
        }

        return this.props.children;
    }
}
