import { login, signup } from "./actions";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  return (
    <div className="min-h-screen bg-black text-green-400 flex items-center justify-center">
      <div className="w-full max-w-md p-8 border border-green-500/30 rounded-lg bg-black/80">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-mono font-bold text-green-400">
            ⚛️ OSIRIS
          </h1>
          <p className="text-green-500/60 text-sm mt-2 font-mono">
            DNA::{"}{"}::lang v51.843 | Sovereign Platform
          </p>
          <p className="text-green-500/40 text-xs mt-1 font-mono">
            CAGE 9HUP5 | Agile Defense Systems
          </p>
        </div>

        <form className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-mono text-green-500/80 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-4 py-2 bg-black border border-green-500/30 rounded text-green-400 font-mono focus:border-green-400 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-mono text-green-500/80 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-4 py-2 bg-black border border-green-500/30 rounded text-green-400 font-mono focus:border-green-400 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              formAction={login}
              className="flex-1 py-2 bg-green-500/20 border border-green-500/50 rounded text-green-400 font-mono hover:bg-green-500/30 transition-colors"
            >
              Sign In
            </button>
            <button
              formAction={signup}
              className="flex-1 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded text-cyan-400 font-mono hover:bg-cyan-500/30 transition-colors"
            >
              Sign Up
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-green-500/40 text-xs font-mono">
            Zero tokens · Zero telemetry · Pure sovereignty
          </p>
        </div>
      </div>
    </div>
  );
}
