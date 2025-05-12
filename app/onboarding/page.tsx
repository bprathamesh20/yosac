import { auth } from '@/app/(auth)/auth';
import { redirect } from 'next/navigation';
import { isStudentProfileComplete } from '@/app/(auth)/actions';
import OnboardingForm from '@/components/onboarding-form';

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const isComplete = await isStudentProfileComplete(session.user.id);

  if (isComplete) {
    redirect('/');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl space-y-8 flex flex-col items-center">
        <div className="text-center w-full">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-2">
                Complete Your Profile
            </h1>
            <p className="text-muted-foreground">
                Please provide your academic information to help us personalize your experience.
            </p>
        </div>
        <OnboardingForm userId={session.user.id} />
      </div>
    </div>
  );
}
