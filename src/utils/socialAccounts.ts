export function getInstagramOAuthErrorMessage(
    error: string | null,
    errorDescription: string | null,
): string | null {
    if (errorDescription) {
        return errorDescription;
    }

    if (!error) {
        return null;
    }

    if (error === 'instagram_graph_access_denied') {
        return (
            'Instagram login succeeded, but Meta rejected API access for this account. '
            + 'The app must be Live with Advanced Access approved for instagram_business_basic, '
            + 'instagram_business_manage_insights and instagram_business_content_publish, and your Instagram account must be a '
            + 'Professional (Business or Creator) account.'
        );
    }

    return error.replace(/_/g, ' ');
}

export function clearInstagramOAuthSearchParams(params: URLSearchParams) {
    params.delete('success');
    params.delete('error');
    params.delete('error_description');
    params.delete('error_code');
}
