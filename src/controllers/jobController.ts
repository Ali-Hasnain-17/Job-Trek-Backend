import { Response } from "express";
import asyncHandler from "express-async-handler";
import { v2 as cloudinary } from "cloudinary";

import { CustomRequest } from "../types";
import { CreateJobRequest, JobApplicationRequest } from "../types/JobTypes";
import { prisma } from "../db";
import { fail } from "assert";

export const createJob = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const {
      title,
      shortDescription,
      detailedDescription,
      experience,
      companyName,
      type,
      location,
      mode,
    } = req.body as CreateJobRequest;

    const job = await prisma.job.create({
      data: {
        title,
        shortDescription,
        detailedDescription,
        experience,
        mode,
        type,
        location,
        companyName,
      },
    });

    if (job) {
      res.status(201).json(job);
    } else {
      res.status(400);
      throw new Error("Failed to create Job");
    }
  }
);

export const getAllJobs = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { mode, type, applicants, experience } = req.query;
    let whereClause: any = {};

    if (mode) {
      whereClause.mode = mode;
    }

    if (type) {
      whereClause.type = type;
    }

    if (applicants) {
      const [min, max] = getApplicantRange(applicants as string);
      whereClause.applicants = {};
      whereClause.applicants.gte = min;
      if (max !== -1) {
        whereClause.applicants.lt = max;
      }
    }

    if (experience) {
      whereClause.experience = experience;
    }

    const jobs = await prisma.job.findMany({
      where: whereClause,
    });

    res.json(jobs);
  }
);

export const getJobById = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const id = req.params.id;

    const job = await prisma.job.findUnique({
      where: {
        id,
      },
    });

    if (!job) {
      throw new Error("No Job Found with id " + id);
    }

    res.json(job);
  }
);

export const searchJob = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { job, location } = req.query;

    let whereClause: any = {};

    if (job) {
      whereClause.OR = [
        { title: { contains: job as string, mode: "insensitive" } },
        { shortDescription: { contains: job as string, mode: "insensitive" } },
        {
          detailedDescription: { contains: job as string, mode: "insensitive" },
        },
      ];
    }

    if (location) {
      whereClause.location = { contains: location, mode: "insensitive" };
    }

    const jobs = await prisma.job.findMany({
      where: whereClause,
    });

    res.json(jobs);
  }
);

export const uploadResume = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    if (!req.file) {
      res.status(400);
      throw new Error("No file found");
    }

    cloudinary.uploader
      .upload_stream({ resource_type: "auto" }, (error, result) => {
        if (error) {
          res.status(500);
          throw new Error("Error while uploading file");
        }
        res.json({ resumeUrl: result.url });
      })
      .end(req.file.buffer);
  }
);

export const applyForJob = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { jobId } = req.params;
    const {
      name,
      experience: applicantExperience,
      githubUrl,
      linkedinUrl,
      resumeUrl,
    } = req.body as JobApplicationRequest;

    const alreadyAppledUser = await prisma.jobApplication.findFirst({
      where: {
        userId: req.user.id,
      },
    });

    if (alreadyAppledUser) {
      res.status(400);
      throw new Error("You Have already applied for this job");
    }

    const application = await prisma.jobApplication.create({
      data: {
        name,
        applicantExperience,
        githubUrl: githubUrl || null,
        linkedinUrl: linkedinUrl || null,
        resumeUrl,
        jobId,
        userId: req.user.id,
      },
    });

    if (!application) {
      res.status(400);
      throw new Error("Failed to apply for job");
    }

    await prisma.job.update({
      where: {
        id: jobId,
      },
      data: {
        applicants: {
          increment: 1,
        },
      },
    });

    res.json(application);
  }
);

function getApplicantRange(applicants: string) {
  switch (applicants) {
    case "0-10":
      return [0, 10];
    case "10-50":
      return [10, 50];
    case "50-100":
      return [50, 100];
    case ">100":
      return [100, -1];
  }
}
