import { useMutation } from '@tanstack/react-query';
import api from '@/api/axios';

export type CampaignImageType = 'brand_logo' | 'track_artwork';

export function useUploadCampaignImage() {
    return useMutation({
        mutationFn: async ({ file, type }: { file: Blob; type: CampaignImageType }) => {
            const formData = new FormData();
            formData.append('file', file, `${type}.webp`);

            const res = await api.post(`/uploads/campaign-image?type=${type}`, formData);

            return res.data.data as { url: string; filename: string; size: number };
        },
    });
}
