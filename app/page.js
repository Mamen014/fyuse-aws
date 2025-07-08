// app/page.js
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function HomeRedirectPage() {
  const cookieStore = await cookies();
  const hasRegistered = cookieStore.get('hasRegistered')?.value === 'true';

  redirect(hasRegistered ? '/dashboard' : '/landing-page');
}
