import { apiEndpoints, axiosInstance } from '@/configs';
import { useQuery } from '@tanstack/react-query';
import { boolean, object } from 'yup';

const publicConfigResponseSchema = object({
  voiceModeEnabled: boolean().required(),
});

interface UsePublicConfigResult {
  voiceModeEnabled: boolean;
  isLoading: boolean;
}

export const usePublicConfig = (): UsePublicConfigResult => {
  const { data, isLoading } = useQuery({
    queryKey: ['public-config'],
    queryFn: async () => {
      const response = await axiosInstance.get(apiEndpoints.get.config());

      return publicConfigResponseSchema.validateSync(response.data.data, {
        stripUnknown: true,
      });
    },
  });

  // FAIL-CLOSED: voice is unavailable while loading or on error.
  return {
    voiceModeEnabled: data?.voiceModeEnabled ?? false,
    isLoading,
  };
};
