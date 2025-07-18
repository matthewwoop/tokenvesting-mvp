import ScheduleForm from '@/components/vesting-schedules/ScheduleForm';

export default function NewVestingSchedulePage() {
  return (
    <main className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-semibold">New Vesting Schedule</h1>
      <ScheduleForm />
    </main>
  );
}