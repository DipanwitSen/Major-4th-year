import AuthLayout from "@/components/auth/AuthLayout";
import SignupForm from "@/components/auth/SignupForm";

const Signup = () => {
  return (
    <AuthLayout
      title="Welcome! 🌸"
      subtitle="Create your account to get started"
    >
      <SignupForm />
    </AuthLayout>
  );
};

export default Signup;
