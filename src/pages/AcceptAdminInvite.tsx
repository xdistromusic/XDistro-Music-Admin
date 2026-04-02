import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";

export default function AcceptAdminInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  useEffect(() => {
    // Validate token format on mount
    if (!token) {
      setError("No invitation token provided. Please check your email for the invitation link.");
      setIsValidating(false);
    } else {
      setIsValidating(false);
    }
  }, [token]);

  const validatePassword = (pwd: string): string[] => {
    const errors: string[] = [];

    if (pwd.length < 8) {
      errors.push("Password must be at least 8 characters");
    }
    if (!/[A-Z]/.test(pwd)) {
      errors.push("Password must contain an uppercase letter");
    }
    if (!/[a-z]/.test(pwd)) {
      errors.push("Password must contain a lowercase letter");
    }
    if (!/[0-9]/.test(pwd)) {
      errors.push("Password must contain a number");
    }
    if (!/[!@#$%^&*]/.test(pwd)) {
      errors.push("Password must contain a special character (!@#$%^&*)");
    }

    return errors;
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (value.length > 0) {
      setPasswordErrors(validatePassword(value));
    } else {
      setPasswordErrors([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("No invitation token provided.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    const validationErrors = validatePassword(password);
    if (validationErrors.length > 0) {
      setError("Password does not meet requirements");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/accept-admin-invite`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          setError("Invitation not found or has already been used. Please request a new invitation.");
        } else if (response.status === 410) {
          setError(
            data.message || "This invitation has expired. Please request a new invitation."
          );
        } else if (response.status === 409) {
          setError("An account with this email already exists.");
        } else {
          setError(data.message || "Failed to accept invitation. Please try again.");
        }
        return;
      }

      setSuccess(true);
      toast.success("Welcome to XDistro Admin!");
      toast.success("Your account has been created. Redirecting to login...");

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (err) {
      console.error("Error accepting invitation:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-700 to-slate-600 px-8 py-12 text-center">
            <div className="inline-block p-3 bg-onerpm-orange/20 rounded-lg mb-4">
              <CheckCircle2 className="w-8 h-8 text-onerpm-orange" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Create Your Admin Account
            </h1>
            <p className="text-slate-300 text-sm">
              Set your password to get started
            </p>
          </div>

          <div className="px-8 py-8">
            {isValidating ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin">
                  <div className="w-8 h-8 border-4 border-slate-600 border-t-onerpm-orange rounded-full"></div>
                </div>
                <p className="text-slate-300 mt-4">Validating invitation...</p>
              </div>
            ) : error ? (
              <div className="space-y-4">
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
                <Button
                  onClick={() => navigate("/login")}
                  variant="outline"
                  className="w-full"
                >
                  Go to Login
                </Button>
              </div>
            ) : success ? (
              <div className="text-center space-y-4">
                <div className="inline-block p-3 bg-green-500/20 rounded-lg mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-white">
                  Account Created!
                </h2>
                <p className="text-slate-300 text-sm">
                  Your admin account is ready. Redirecting to login...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-200">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter a strong password"
                      value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      disabled={isLoading}
                      className={`pr-10 bg-slate-700 border ${
                        passwordErrors.length > 0 ? "border-red-500" : "border-slate-600"
                      } text-white placeholder-slate-400`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {passwordErrors.length > 0 && (
                    <div className="text-sm space-y-1">
                      {passwordErrors.map((err, idx) => (
                        <p key={idx} className="text-red-400">
                          • {err}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-slate-200"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      className={`pr-10 bg-slate-700 border ${
                        password &&
                        confirmPassword &&
                        password !== confirmPassword
                          ? "border-red-500"
                          : "border-slate-600"
                      } text-white placeholder-slate-400`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {password &&
                    confirmPassword &&
                    password !== confirmPassword && (
                      <p className="text-sm text-red-400">
                        Passwords do not match
                      </p>
                    )}
                </div>

                <Button
                  type="submit"
                  disabled={
                    isLoading ||
                    !password ||
                    !confirmPassword ||
                    passwordErrors.length > 0 ||
                    password !== confirmPassword
                  }
                  className="w-full bg-onerpm-orange hover:bg-onerpm-orange/90 text-slate-900 font-semibold"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mr-2" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Admin Account"
                  )}
                </Button>

                <p className="text-xs text-slate-400 text-center">
                  This invitation link expires in 7 days
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
