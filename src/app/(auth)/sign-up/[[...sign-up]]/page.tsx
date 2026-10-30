import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";


export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <div className="flex min-h-screen items-center justify-center py-6 ">
        <SignUp signInUrl="/sign-in" forceRedirectUrl="/" />
      </div>
    </Suspense>
  );
}
