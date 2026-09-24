export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Terms of Service</h1>
      <p className="mb-2 text-xs text-slate-400">Last updated: September 25, 2026</p>

      <div className="space-y-4 text-sm leading-relaxed text-slate-700">
        <h2 className="pt-2 text-base font-semibold text-slate-900">1. Service Description</h2>
        <p>
          Ketmon is a no-contract fitness credit marketplace that connects members with fitness venues in Korea.
          Members purchase credits and use them to book individual classes at participating gyms and studios.
        </p>

        <h2 className="pt-2 text-base font-semibold text-slate-900">2. Accounts</h2>
        <p>
          You must sign in with a Google account to use Ketmon.
          You are responsible for maintaining the security of your account.
        </p>

        <h2 className="pt-2 text-base font-semibold text-slate-900">3. Credits and Bookings</h2>
        <ul className="list-inside list-disc space-y-1">
          <li>Credits are purchased in packs and used to book classes</li>
          <li>Cancellation more than 6 hours before class: full credit refund</li>
          <li>Cancellation less than 6 hours before class: credits are forfeited</li>
          <li>No-show: credits are forfeited and the gym is still compensated</li>
        </ul>

        <h2 className="pt-2 text-base font-semibold text-slate-900">4. Google Calendar</h2>
        <p>
          If you grant calendar access, Ketmon will create calendar events for your bookings and remove them upon cancellation.
          You can revoke this access at any time through your Google Account settings.
        </p>

        <h2 className="pt-2 text-base font-semibold text-slate-900">5. Limitation of Liability</h2>
        <p>
          Ketmon is provided &quot;as is&quot; without warranty of any kind.
          We are not liable for any damages arising from the use of this service.
        </p>

        <h2 className="pt-2 text-base font-semibold text-slate-900">6. Contact</h2>
        <p>For questions, contact dilmurod111804@gmail.com.</p>
      </div>
    </div>
  );
}
