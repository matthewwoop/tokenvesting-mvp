'use client';

import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';


type UnlockEvent = {
  unlockDate: Date;
  amount: number;
  frequency: 'cliff' | 'daily' | 'monthly';
};

type FormValues = {
  name: string;
  totalQuantity: number;
  purchasePrice?: number;
  purchaseDate: Date;
  unlockEvents: UnlockEvent[];
};


export default function ScheduleForm() {
  const router = useRouter();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      totalQuantity: 0,
      purchasePrice: undefined,
      purchaseDate: new Date(),
      unlockEvents: []
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'unlockEvents'
  });

  const onSubmit = async (data: FormValues) => {

    // Create schedule
    const createRes = await fetch('/api/vesting-schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        totalQuantity: data.totalQuantity,
        purchasePrice: data.purchasePrice,
        purchaseDate: data.purchaseDate.toISOString()
      }),
    });
    const { id } = await createRes.json();

    // POST events
    await Promise.all(
      data.unlockEvents.map(ev =>
        fetch(`/api/vesting-schedules/${id}/unlock-events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            unlockDate: ev.unlockDate.toISOString(),
            amount: ev.amount,
            frequency: ev.frequency
          }),
        })
      )
    );

    // Trigger calculation
    await fetch(`/api/vesting-schedules/${id}/calculate`, { method: 'POST' });

    // Redirect to results
    router.push(`/vesting-schedules/${id}`);
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="max-w-3xl mx-auto mt-10 shadow">
        <CardHeader>
          <CardTitle className="text-2xl">Create a Vesting Schedule</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* --- Schedule Details --- */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Schedule Name</Label>
              <Input
                id="name"
                placeholder="e.g. Team Grant"
                {...register("name")}
              />
            </div>

            <div>
              <Label htmlFor="totalQuantity">Total Quantity</Label>
              <Input
                id="totalQuantity"
                type="number"
                {...register("totalQuantity", { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* --- Price & Dates --- */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="purchasePrice">Purchase Price (USD)</Label>
              <Input
                id="purchasePrice"
                type="number"
                {...register("purchasePrice", { valueAsNumber: true })}
              />
            </div>

            <div>
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input
                id="purchaseDate"
                type="date"
                {...register("purchaseDate", { valueAsDate: true })}
              />
            </div>
          </div>

          {/* --- Unlock Events --- */}
          <div className="space-y-4">
            <Label>Unlock Events</Label>

            {fields.map((field, idx) => (
              <div
                key={field.id}
                className="grid gap-4 sm:grid-cols-3 items-end"
              >
                <div>
                  <Label htmlFor={`unlockEvents.${idx}.unlockDate`}>
                    Unlock Date
                  </Label>
                  <Popover>
                    {/* DatePicker for unlockEvents[idx].unlockDate */}
                  </Popover>
                </div>

                <div>
                  <Label htmlFor={`unlockEvents.${idx}.amount`}>
                    Amount
                  </Label>
                  <Input
                    id={`unlockEvents.${idx}.amount`}
                    type="number"
                    {...register(
                      `unlockEvents.${idx}.amount` as const,
                      { valueAsNumber: true }
                    )}
                  />
                </div>

                <div>
                  <Label htmlFor={`unlockEvents.${idx}.frequency`}>
                    Frequency (days)
                  </Label>
                  <Input
                    id={`unlockEvents.${idx}.frequency`}
                    type="number"
                    {...register(
                      `unlockEvents.${idx}.frequency` as const,
                      { valueAsNumber: true }
                    )}
                  />
                </div>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => remove(idx)}
                >
                  Remove
                </Button>
              </div>
            ))}

            <Button
              type="button"
              size="sm"
              onClick={() =>
                append({ unlockDate: new Date(), amount: 0, frequency: 0 })
              }
            >
              + Add Event
            </Button>
          </div>

          {/* --- Submit --- */}
          <Button type="submit" className="w-full">
            Create Schedule
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}