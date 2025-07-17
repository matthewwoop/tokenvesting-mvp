import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET': {
      // Fetch all VestingSchedules
      const schedules = await prisma.vestingSchedule.findMany();
      return res.status(200).json(schedules);
    }
    case 'POST': {
      // Create a new VestingSchedule
      // Expects a JSON body with { name, totalQuantity, purchasePrice?, purchaseDate? }
      const { name, totalQuantity, purchasePrice, purchaseDate } = req.body;
      const schedule = await prisma.vestingSchedule.create({
        data: {
          name,
          totalQuantity,
          purchasePrice: purchasePrice ?? undefined,
          purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
        },
      });
      return res.status(201).json(schedule);
    }
    default:
      // Return 405 for any other HTTP method
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}