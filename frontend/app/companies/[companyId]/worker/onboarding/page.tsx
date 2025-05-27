import PersonalDetails from "@/app/onboarding/PersonalDetails";
import OnboardingLayout from "@/app/onboarding/layout";
import { OnboardingProvider } from "@/app/onboarding/context";
import { steps } from ".";

export default function Page() {
  return (
    <OnboardingProvider
      steps={steps}
      stepIndex={1}
      title="Let's get to know you"
      subtitle="We're eager to learn more about you, starting with your legal name and the place where you reside."
    >
      <OnboardingLayout>
        <PersonalDetails />
      </OnboardingLayout>
    </OnboardingProvider>
  );
}
