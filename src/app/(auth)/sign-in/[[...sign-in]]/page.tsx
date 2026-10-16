import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <div className="flex min-h-screen items-center justify-center py-6">
        <SignIn signUpUrl="/sign-up" forceRedirectUrl={"/"} />
      </div>
    </Suspense>
  );
}
