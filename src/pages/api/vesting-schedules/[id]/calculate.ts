import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Prisma } from '@prisma/client';
import { getSpotPriceUSD, getAnnualizedVolatility } from '@/lib/marketData';
import { blackScholesPut } from '@/lib/optionPricing';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  const { id } = req.query as { id: string };

  if (req.method === 'POST') {

    // Fetch the schedule and its unlockEvents
    const schedule = await prisma.vestingSchedule.findUnique({
      where: { id },
      include: { unlockEvents: true },
    });

    if (!schedule) {
      return res.status(404).json({ error: 'VestingSchedule not found' });
    }

    // 2) Apply DLOM to calculate discounted token value
    const spot = getSpotPriceUSD('SOL');
    const vol  = getAnnualizedVolatility('SOL');
    const r    = 0.03; // 3% risk-free rate

    const results = schedule.unlockEvents.map(ev => {
      // time to expiry in years
      const T = Math.max(
        (ev.unlockDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 365), 0
      );
      const premium  = blackScholesPut(spot, spot, r, vol, T);
      const discount = premium / spot;

      return {
        date: ev.unlockDate,
        unlockAmount: ev.amount,
        premium,
        discount,
      };
    });

    const totalUnlocked    = results.reduce((sum, r) => sum + r.unlockAmount, 0);
    const totalLocked      = schedule.totalQuantity - totalUnlocked;
    const discountPercent  = results.length > 0 ? results[results.length - 1].discount * 100 : 0;
    const discountedValue  = totalUnlocked * spot * (1 - (results[results.length - 1]?.discount ?? 0));

    // 3) Create & store DLOM Calculation with error handling
    try {
      
      const calc = await prisma.dLOMCalculation.create({
        data: {
          vestingScheduleId: id,
          totalUnlocked,
          totalLocked,
          discountPercent,
          discountedValue,
          resultsJson: results,
        },
      });

      return res.status(201).json(calc);

    } catch (err) {

      console.error('Error creating DLOMCalculation:', err);

      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
          case 'P2025':
            // Parent VestingSchedule record not found
            return res.status(404).json({ error: 'Related record not found' });
          case 'P2002':
            // unique constraint violation
            return res.status(409).json({ error: 'Calculation already exists' });
          default:
            // other Prisma client errors (bad input, etc.)
            return res.status(400).json({ error: err.meta ?? err.message });
        }
      }

      // Anything else → 500
      return res
        .status(500)
        .json({ error: 'Unexpected error while creating calculation.' });
    }
  }

  // Only POST allowed here
  res.setHeader('Allow', ['POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}