export interface CreateJobRequest {
  title: string;
  shortDescription: string;
  detailedDescription: string;
  experience: string;
  companyName: string;
  location: string;
  type: string;
  mode: string;
}

export interface JobApplicationRequest {
  name: string;
  experience: number;
  githubUrl?: string;
  linkedinUrl?: string;
  resumeUrl: string;
}
