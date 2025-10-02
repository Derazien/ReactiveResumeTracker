import { t } from "@lingui/macro";
import type { UrlDto } from "@reactive-resume/dto";
import { useMutation } from "@tanstack/react-query";

import { toast } from "@/client/hooks/use-toast";
import { axios } from "@/client/libs/axios";

export const printCoverLetter = async (data: { id: string }) => {
  const response = await axios.get<UrlDto>(`/cover-letters/print/${data.id}`);

  return response.data;
};

export const usePrintCoverLetter = () => {
  const {
    error,
    isPending: loading,
    mutateAsync: printCoverLetterFn,
  } = useMutation({
    mutationFn: printCoverLetter,
    onError: (error) => {
      const message = error.message;

      toast({
        variant: "error",
        title: t`Oops, the server returned an error.`,
        description: message,
      });
    },
  });

  return { printCoverLetter: printCoverLetterFn, loading, error };
};































