import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { signout } from "@/app/login/actions";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch experiments
  const { data: experiments } = await supabase
    .from("quantum_experiments")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch queued jobs
  const { data: jobs } = await supabase
    .from("quantum_jobs")
    .select("*")
    .order("submitted_at", { ascending: false })
    .limit(10);

  // Fetch attestations
  const { data: attestations } = await supabase
    .from("attestation_ledger")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  const isAdmin = profile?.role === "admin";

  return (
    <div className="min-h-screen bg-black text-green-400 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-green-500/20 pb-4">
          <div>
            <h1 className="text-2xl font-mono font-bold">
              ⚛️ OSIRIS Command Center
            </h1>
            <p className="text-green-500/60 text-sm font-mono">
              DNA::{"}{"}::lang v51.843 | CAGE 9HUP5
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-mono text-green-400">
              {user.email}
            </p>
            <p className="text-xs font-mono text-cyan-400">
              {isAdmin ? "👑 ADMIN" : `Role: ${profile?.role || "user"}`}
            </p>
            <form action={signout}>
              <button
                type="submit"
                className="mt-1 text-xs font-mono text-red-400/60 hover:text-red-400"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Experiments" value={experiments?.length || 0} />
          <StatCard
            label="Queued Jobs"
            value={
              experiments?.filter((e) => e.status === "queued").length || 0
            }
          />
          <StatCard
            label="Backends"
            value={3}
            sub="fez · torino · marrakesh"
          />
          <StatCard
            label="Credits"
            value={profile?.quantum_credits || 0}
          />
        </div>

        {/* Experiments Table */}
        <div className="border border-green-500/20 rounded-lg overflow-hidden">
          <div className="bg-green-500/10 px-4 py-2 border-b border-green-500/20">
            <h2 className="font-mono font-bold text-sm">
              QUANTUM EXPERIMENTS
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="text-green-500/60 border-b border-green-500/10">
                  <th className="text-left p-3">Protocol</th>
                  <th className="text-left p-3">Backend</th>
                  <th className="text-right p-3">Qubits</th>
                  <th className="text-right p-3">Φ</th>
                  <th className="text-right p-3">Γ</th>
                  <th className="text-right p-3">CCCE</th>
                  <th className="text-center p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {experiments?.map((exp) => (
                  <tr
                    key={exp.id}
                    className="border-b border-green-500/5 hover:bg-green-500/5"
                  >
                    <td className="p-3 text-green-300">
                      {exp.protocol}
                    </td>
                    <td className="p-3 text-cyan-400">{exp.backend}</td>
                    <td className="p-3 text-right">{exp.qubits_used}</td>
                    <td className="p-3 text-right">
                      {exp.phi != null ? (
                        <span
                          className={
                            exp.phi >= 0.7734
                              ? "text-green-400"
                              : "text-yellow-400"
                          }
                        >
                          {exp.phi.toFixed(4)}
                        </span>
                      ) : (
                        <span className="text-green-500/30">—</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {exp.gamma != null ? (
                        <span
                          className={
                            exp.gamma < 0.3
                              ? "text-green-400"
                              : "text-red-400"
                          }
                        >
                          {exp.gamma.toFixed(4)}
                        </span>
                      ) : (
                        <span className="text-green-500/30">—</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {exp.ccce != null ? (
                        exp.ccce.toFixed(4)
                      ) : (
                        <span className="text-green-500/30">—</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <StatusBadge status={exp.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live API Endpoints */}
        <div className="border border-green-500/20 rounded-lg overflow-hidden">
          <div className="bg-cyan-500/10 px-4 py-2 border-b border-green-500/20">
            <h2 className="font-mono font-bold text-sm text-cyan-400">
              LIVE API ENDPOINTS
            </h2>
          </div>
          <div className="p-4 space-y-2 text-sm font-mono">
            {[
              { method: "GET", path: "/api/osiris/status", desc: "Platform status" },
              { method: "GET", path: "/api/ccce/metrics", desc: "CCCE telemetry" },
              { method: "GET", path: "/api/experiments", desc: "Experiment list" },
              { method: "GET", path: "/api/workloads", desc: "Hardware workloads" },
              { method: "GET", path: "/api/ocelot", desc: "AWS Ocelot bridge" },
              { method: "POST", path: "/api/nclm/infer", desc: "NC-LM inference" },
              { method: "POST", path: "/api/attestation", desc: "SHA-256 PCRB" },
            ].map((ep) => (
              <div key={ep.path} className="flex items-center gap-3">
                <span
                  className={`px-2 py-0.5 rounded text-xs ${
                    ep.method === "GET"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-purple-500/20 text-purple-400"
                  }`}
                >
                  {ep.method}
                </span>
                <a
                  href={ep.path}
                  target="_blank"
                  className="text-cyan-400 hover:underline"
                >
                  {ep.path}
                </a>
                <span className="text-green-500/40">{ep.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Infrastructure */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-green-500/20 rounded-lg p-4">
            <h3 className="font-mono font-bold text-sm mb-3 text-green-400">
              AWS INFRASTRUCTURE
            </h3>
            <div className="space-y-1 text-xs font-mono text-green-500/80">
              <p>S3: agile-defense-quantum-results-869935102268</p>
              <p>DynamoDB: agile-defense-quantum-experiment-ledger</p>
              <p>Lambda API: mwkeczoay4.execute-api.us-east-2</p>
              <p>Region: us-east-2</p>
            </div>
          </div>
          <div className="border border-green-500/20 rounded-lg p-4">
            <h3 className="font-mono font-bold text-sm mb-3 text-cyan-400">
              SUPABASE
            </h3>
            <div className="space-y-1 text-xs font-mono text-green-500/80">
              <p>Project: trtncqkfvrtiicxxnkjd</p>
              <p>
                Tables: notes, quantum_experiments, profiles, quantum_jobs,
                attestation_ledger, activity_log
              </p>
              <p>Auth: Email/Password + RLS policies</p>
              <p>Region: us-east-1</p>
            </div>
          </div>
        </div>

        <p className="text-center text-green-500/30 text-xs font-mono">
          Zero tokens · Zero telemetry · Pure sovereignty
        </p>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: number | string;
  sub?: string;
}) {
  return (
    <div className="border border-green-500/20 rounded-lg p-4">
      <p className="text-green-500/60 text-xs font-mono">{label}</p>
      <p className="text-2xl font-mono font-bold text-green-400 mt-1">
        {value}
      </p>
      {sub && (
        <p className="text-green-500/40 text-xs font-mono mt-1">{sub}</p>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    completed: "bg-green-500/20 text-green-400",
    queued: "bg-yellow-500/20 text-yellow-400",
    running: "bg-blue-500/20 text-blue-400",
    failed: "bg-red-500/20 text-red-400",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-mono ${
        colors[status] || "bg-gray-500/20 text-gray-400"
      }`}
    >
      {status}
    </span>
  );
}
