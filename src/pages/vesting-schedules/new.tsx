import ScheduleForm from '@/components/vesting-schedules/ScheduleForm';

export default function NewVestingSchedulePage() {
  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">New Vesting Schedule</h1>
      <ScheduleForm />
    </main>
  );
}