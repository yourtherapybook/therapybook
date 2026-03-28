import Link from 'next/link';
import { Video } from 'lucide-react';

export default function SessionIndexPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="max-w-xl rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-subtle">
        <Video className="mx-auto h-10 w-10 text-primary-500 mb-4" />
        <h1 className="text-2xl font-semibold text-neutral-900 mb-2">Session link required</h1>
        <p className="text-neutral-600 mb-6">
          TherapyBook session rooms are available only through the unique link attached to a booked session.
        </p>
        <Link href="/booking" className="inline-flex items-center justify-center rounded-lg bg-primary-500 px-4 py-2 text-white hover:bg-primary-600">
          Go to booking
        </Link>
      </div>
    </div>
  );
}
