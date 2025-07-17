import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };

  if (req.method === 'GET') {

    // Fetch one schedule with its unlock events
    const schedule = await prisma.vestingSchedule.findUnique({
      where: { id },
      include: { 
        unlockEvents: true, 
        dlomCalculations: true 
      },
    });

    if (!schedule) {
      return res.status(404).json({ error: 'VestingSchedule not found' });
    }

    return res.status(200).json(schedule);
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}