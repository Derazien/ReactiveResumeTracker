import type { JobApplicationDto } from "@reactive-resume/dto";

import { axios } from "../libs/axios";

export const findJobApplicationById = async ({
  id,
}: {
  id: string;
}): Promise<JobApplicationDto> => {
  const response = await axios.get(`/job-applications/${id}`);
  return response.data;
};

export const findJobApplicationByIdWithEnhancedData = async ({
  id,
}: {
  id: string;
}): Promise<JobApplicationDto> => {
  const response = await axios.get(`/job-applications/${id}/enhanced`);
  return response.data;
};

export const generateEnhancedCoverLetter = async ({
  id,
  templateName,
  tone,
}: {
  id: string;
  templateName: string;
  tone: string;
}): Promise<{ content: string }> => {
  const response = await axios.post(`/job-applications/${id}/generate-enhanced-cover-letter`, {
    templateName,
    tone,
  });
  return response.data;
};

export const conductInterview = async ({
  id,
  interviewType,
}: {
  id: string;
  interviewType: string;
}): Promise<{ questions: string[] }> => {
  const response = await axios.post(`/job-applications/${id}/conduct-interview`, {
    interviewType,
  });
  return response.data;
};

export const generateContactMessage = async ({
  id,
  contactId,
  messageType,
  instructions,
}: {
  id: string;
  contactId: string;
  messageType: string;
  instructions?: string;
}): Promise<{ content: string }> => {
  const response = await axios.post(`/job-applications/${id}/generate-contact-message`, {
    contactId,
    messageType,
    instructions,
  });
  return response.data;
};

export const analyzeCompany = async ({
  id,
}: {
  id: string;
}): Promise<{ company: Record<string, unknown> }> => {
  const response = await axios.post(`/job-applications/${id}/analyze-company`);
  return response.data;
};
