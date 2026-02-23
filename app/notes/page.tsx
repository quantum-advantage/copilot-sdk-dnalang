import { createClient } from "@/utils/supabase/server";

export default async function NotesPage() {
  const supabase = await createClient();
  const { data: notes } = await supabase.from("notes").select();

  return (
    <div className="min-h-screen bg-black text-green-400 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-mono font-bold mb-6">
          ⚛️ Notes — Supabase Connected
        </h1>
        <div className="border border-green-500/30 rounded-lg p-4 bg-black/80">
          <pre className="font-mono text-sm text-green-300">
            {JSON.stringify(notes, null, 2)}
          </pre>
        </div>
        <p className="text-green-500/40 text-xs mt-4 font-mono">
          Data served from Supabase → trtncqkfvrtiicxxnkjd.supabase.co
        </p>
      </div>
    </div>
  );
}
