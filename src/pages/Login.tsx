import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Mail, Lock, Shield, AlertCircle } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox"; 
import { toast } from "@/lib/toast";
import { useAuth } from "@/hooks/useAuth";
import { prefetchAdminRoutes } from "@/config/adminRoutes";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // Get the intended destination from location state
  const from = location.state?.from || "/admin";
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    
    try {
      const success = await login(data.email, data.password, data.rememberMe);
      
      if (success) {
        prefetchAdminRoutes();
        toast.success("Welcome to the admin dashboard!");
        navigate(from, { replace: true });
      } else {
        toast.error("Invalid login credentials. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-onerpm-dark-blue to-black">
      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-2xl">
          <div className="bg-onerpm-gray-dark/80 backdrop-blur-sm shadow-xl rounded p-8 border border-white/10">
            <div className="text-center mb-8"> 
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-white/70 mt-2">
                Sign in to your admin dashboard
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                          <Input
                            {...field}
                            type="email"
                            placeholder="your emaill address"
                            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                          <Input
                            {...field}
                            type="password"
                            placeholder="••••••••"
                            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-onerpm-orange border-white/30"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-medium text-white/80">
                          Remember me
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-onerpm-orange hover:bg-onerpm-orange/90 text-white py-6"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
