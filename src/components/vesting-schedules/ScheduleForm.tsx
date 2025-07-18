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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Schedule Details */}
      <Card>
        <CardHeader><CardTitle>Schedule Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register('name', { required: true })} />
            {errors.name && <p className="text-red-500">Required</p>}
          </div>
          <div>
            <Label htmlFor="totalQuantity">Total Quantity</Label>
            <Input
              id="totalQuantity"
              type="number"
              {...register('totalQuantity', { valueAsNumber: true, required: true })}
            />
            {errors.totalQuantity && <p className="text-red-500">Required</p>}
          </div>
          <div>
            <Label htmlFor="purchasePrice">Purchase Price (USD)</Label>
            <Input
              id="purchasePrice"
              type="number"
              step="0.01"
              {...register('purchasePrice', { valueAsNumber: true })}
            />
          </div>
          <div>
            <Label>Purchase Date</Label>
            <Controller
              control={control}
              name="purchaseDate"
              render={({ field }) => (
                <DatePicker
                  selected={field.value}
                  onChange={field.onChange}
                  className="w-full border rounded p-2"
                />
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Unlock Events */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Unlock Events</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => append({ unlockDate: new Date(), amount: 0, frequency: 'cliff' })}
          >
            + Add Event
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, idx) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <Controller
                control={control}
                name={`unlockEvents.${idx}.unlockDate`}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value}
                    onChange={field.onChange}
                    className="w-full border rounded p-2"
                  />
                )}
              />
              <Input
                type="number"
                step="0.01"
                {...register(`unlockEvents.${idx}.amount`, { valueAsNumber: true, required: true })}
                placeholder="Amount"
              />
              <select
                {...register(`unlockEvents.${idx}.frequency`)}
                className="w-full border rounded p-2"
              >
                <option value="cliff">Cliff</option>
                <option value="daily">Daily</option>
                <option value="monthly">Monthly</option>
              </select>
              <Button variant="ghost" size="sm" className="text-red-500" onClick={() => remove(idx)}>
                Remove
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="text-right">
        <Button type="submit">Calculate</Button>
      </div>
    </form>
  );
}