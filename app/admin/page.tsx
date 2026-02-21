import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { MarketControls } from "@/components/dashboard/market-controls";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

export const revalidate = 0; // always fresh for admin

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch Markets
  const { data: markets } = await supabase
    .from("markets")
    .select("*")
    .order("open_time");

  // Fetch Today's Bets
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: bets } = await supabase
    .from("bets")
    .select(
      `
      id,
      game_type,
      number,
      amount,
      status,
      created_at,
      profiles ( phone_number ),
      markets ( name )
    `,
    )
    .gte("created_at", today.toISOString())
    .order("created_at", { ascending: false });

  const totalBetsAmount =
    bets?.reduce((sum, bet) => sum + Number(bet.amount), 0) || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Dashboard Overview
          </h1>
          <p className="text-neutral-400 mt-1">
            Manage markets and monitor live activity.
          </p>
        </div>
        <div className="bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-xl">
          <p className="text-sm font-medium text-indigo-400">
            Total Volume Today
          </p>
          <p className="text-2xl font-bold text-white">
            ₹{totalBetsAmount.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Markets */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white">Market Controls</CardTitle>
              <CardDescription>
                Open/close markets and declare winners.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MarketControls initialMarkets={markets || []} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Live Feed */}
        <div className="lg:col-span-2">
          <Card className="bg-neutral-900 border-neutral-800 overflow-hidden">
            <CardHeader className="border-b border-neutral-800 bg-neutral-900/50">
              <CardTitle className="text-white flex justify-between items-center">
                <span>Live Feed (Today's Bets)</span>
                <span className="text-sm font-normal text-neutral-400 bg-neutral-800 px-2.5 py-1 rounded-full">
                  {bets?.length || 0} total bets
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-auto">
                <Table>
                  <TableHeader className="bg-neutral-950 sticky top-0 z-10">
                    <TableRow className="border-neutral-800 hover:bg-neutral-950">
                      <TableHead className="text-neutral-400">Time</TableHead>
                      <TableHead className="text-neutral-400">User</TableHead>
                      <TableHead className="text-neutral-400">Market</TableHead>
                      <TableHead className="text-neutral-400">
                        Game & Number
                      </TableHead>
                      <TableHead className="text-right text-neutral-400">
                        Amount
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!bets?.length ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-8 text-neutral-500"
                        >
                          No bets placed today yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      bets.map((bet: any) => (
                        <TableRow
                          key={bet.id}
                          className="border-neutral-800 hover:bg-neutral-800/50"
                        >
                          <TableCell className="text-sm text-neutral-400 whitespace-nowrap">
                            {format(new Date(bet.created_at), "HH:mm:ss")}
                          </TableCell>
                          <TableCell className="text-neutral-300 font-mono text-sm">
                            {bet.profiles?.phone_number || "Unknown"}
                          </TableCell>
                          <TableCell className="text-neutral-300">
                            {bet.markets?.name || "Unknown"}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-xs text-neutral-500 uppercase tracking-wider">
                                {bet.game_type.replace("_", " ")}
                              </span>
                              <span className="font-bold text-emerald-400 tracking-widest">
                                {bet.number}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium text-white">
                            ₹{Number(bet.amount).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
