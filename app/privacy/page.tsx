export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Privacy Policy</h1>
      <p className="mb-2 text-xs text-slate-400">Last updated: September 25, 2026</p>

      <div className="space-y-4 text-sm leading-relaxed text-slate-700">
        <p>
          Ketmon (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) operates the Ketmon web application.
          This page informs you of our policies regarding the collection, use, and disclosure of personal data.
        </p>

        <h2 className="pt-2 text-base font-semibold text-slate-900">Information We Collect</h2>
        <p>
          When you sign in with Google, we receive your email address, display name, and profile picture.
          If you grant calendar access, we create and delete events in your Google Calendar on your behalf when you book or cancel classes.
        </p>

        <h2 className="pt-2 text-base font-semibold text-slate-900">How We Use Your Information</h2>
        <ul className="list-inside list-disc space-y-1">
          <li>To create and manage your Ketmon account</li>
          <li>To process class bookings and credit transactions</li>
          <li>To add booking reminders to your Google Calendar</li>
          <li>To display nearby fitness venues based on your location</li>
        </ul>

        <h2 className="pt-2 text-base font-semibold text-slate-900">Data Storage</h2>
        <p>
          Your data is stored securely on Supabase (PostgreSQL) hosted in the ap-northeast-2 (Seoul) region.
          We do not sell, trade, or transfer your personal information to third parties.
        </p>

        <h2 className="pt-2 text-base font-semibold text-slate-900">Google API Services</h2>
        <p>
          Ketmon&apos;s use and transfer of information received from Google APIs adheres to the
          Google API Services User Data Policy, including the Limited Use requirements.
        </p>

        <h2 className="pt-2 text-base font-semibold text-slate-900">Data Deletion</h2>
        <p>
          You may request deletion of your account and all associated data by contacting us at dilmurod111804@gmail.com.
        </p>

        <h2 className="pt-2 text-base font-semibold text-slate-900">Contact</h2>
        <p>For questions about this policy, contact dilmurod111804@gmail.com.</p>
      </div>
    </div>
  );
}
