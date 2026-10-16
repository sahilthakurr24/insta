import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUp />
    </Suspense>
  );
}
