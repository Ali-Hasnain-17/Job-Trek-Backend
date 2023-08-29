import { Response } from "express";
import asyncHandler from "express-async-handler";

import { CustomRequest } from "../types";
import { CreateJobRequest } from "../types/JobTypes";
import { prisma } from "../db";

export const createJob = asyncHandler(async (req: CustomRequest, res: Response) => {
  const { title, description, experienceLevel, companyName, type, city, country, applyUrl } =
    req.body as CreateJobRequest;

  const job = await prisma.job.create({
    data: {
      title,
      description,
      experienceLevel,
      companyName,
      type,
      city,
      country,
      applyUrl,
    },
  });

  if (job) {
    res.status(201).json(job);
  } else {
    res.status(400);
    throw new Error("Failed to create Job");
  }
});

export const getAllJobs = asyncHandler(async (req: CustomRequest, res: Response) => {
  const { searchQuery, companyName, experienceLevel, location, applicants, type } = req.query;

  let whereClause: any = {};

  if (searchQuery) {
    if (whereClause.AND == undefined) {
      whereClause.AND = [];
    }

    let orClause = [];
    orClause.push({
      title: {
        contains: searchQuery.toString().toLowerCase(),
      },
    });
    orClause.push({
      description: {
        contains: searchQuery.toString().toLowerCase(),
      },
    });

    whereClause.AND?.push({ OR: orClause });
  }

  if (companyName) {
    whereClause.companyName = {
      contains: companyName.toString(),
    };
  }

  if (experienceLevel) {
    whereClause.experienceLevel = {
      greaterThanOrEqual: +experienceLevel.toString(),
    };
  }

  if (location) {
    if (whereClause.AND == undefined) {
      whereClause.AND = [];
    }

    let orClause = [];
    orClause.push({
      city: {
        contains: location.toString(),
      },
    });
    orClause.push({
      country: {
        contains: location.toString(),
      },
    });

    whereClause.AND?.push({ OR: orClause });
  }

  if (applicants) {
    whereClause.applicants = {
      greaterThanOrEqual: +applicants.toString(),
    };
  }

  if (type) {
    whereClause.type = {
      equals: type.toString(),
    };
  }

  const jobs = await prisma.job.findMany({
    where: whereClause,
  });

  res.json(jobs);
});

export const getJobById = asyncHandler(async (req: CustomRequest, res: Response) => {
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
});
