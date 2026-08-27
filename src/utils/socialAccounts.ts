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

    if (error === 'no_instagram_page') {
        return (
            'Facebook login succeeded, but no Instagram Professional account is linked to a Facebook Page. '
            + 'Convert the Instagram account to Professional, link it to a Facebook Page, then connect again.'
        );
    }

    if (error === 'instagram_graph_access_denied') {
        return (
            'Facebook login succeeded, but Meta rejected Instagram API access. '
            + 'The app must be Live with Advanced Access for pages_show_list, instagram_basic, '
            + 'instagram_manage_insights and instagram_content_publish. Your Instagram account must be Professional and linked to a Facebook Page.'
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
