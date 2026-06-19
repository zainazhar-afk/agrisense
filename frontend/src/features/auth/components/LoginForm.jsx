import Button from "@/components/ui/Button";

export const LoginForm = ({ onSubmit, loading = false }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Email Address
        </label>
        <input
          type="email"
          name="email"
          required
          className="field-input"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Password
        </label>
        <input
          type="password"
          name="password"
          required
          className="field-input"
          placeholder="********"
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Logging in..." : "Log In"}
      </Button>
    </form>
  );
};
