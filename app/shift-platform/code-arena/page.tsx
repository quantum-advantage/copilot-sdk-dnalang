"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Swords, Trophy, Coins, Users, Play, Clock, Flame, Crown, Target } from "lucide-react"

const leaderboard = [
  { rank: 1, name: "QuantumCoder", xp: 15420, wins: 89, streak: 12, avatar: "QC" },
  { rank: 2, name: "NeuralNinja", xp: 14890, wins: 82, streak: 8, avatar: "NN" },
  { rank: 3, name: "ByteMaster", xp: 13250, wins: 76, streak: 5, avatar: "BM" },
  { rank: 4, name: "AlgoAce", xp: 12100, wins: 71, streak: 3, avatar: "AA" },
  { rank: 5, name: "DataDragon", xp: 11500, wins: 68, streak: 7, avatar: "DD" },
]

const activeBattles = [
  {
    id: 1,
    title: "Binary Search Optimization",
    difficulty: "Medium",
    participants: 24,
    timeLeft: "12:34",
    xpReward: 500,
  },
  {
    id: 2,
    title: "Graph Traversal Challenge",
    difficulty: "Hard",
    participants: 18,
    timeLeft: "23:45",
    xpReward: 1000,
  },
  {
    id: 3,
    title: "Dynamic Programming Duel",
    difficulty: "Expert",
    participants: 12,
    timeLeft: "45:12",
    xpReward: 2000,
  },
]

const tokenomics = {
  totalSupply: 1000000,
  circulating: 456000,
  staked: 234000,
  rewards: 89000,
  earnMethods: [
    { method: "Win Battle", xp: "100-2000 XP", icon: Trophy },
    { method: "Participate", xp: "25-100 XP", icon: Users },
    { method: "Create Challenge", xp: "500 XP", icon: Target },
    { method: "Daily Streak", xp: "50 XP/day", icon: Flame },
  ],
}

export default function CodeArenaPage() {
  const [activeTab, setActiveTab] = useState("battles")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/shift-platform">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Swords className="h-5 w-5 text-destructive" />
                  Code Arena
                </h1>
                <p className="text-sm text-muted-foreground">AI Coding Battles & Challenges</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <Coins className="h-4 w-4 text-amber-400" />
                <span className="font-mono font-bold text-amber-400">2,450 XP</span>
              </div>
              <Button className="gap-2">
                <Play className="h-4 w-4" />
                Quick Match
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="battles">Active Battles</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="tokenomics">Tokenomics</TabsTrigger>
          </TabsList>

          {/* Active Battles Tab */}
          <TabsContent value="battles" className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeBattles.map((battle) => (
                <Card key={battle.id} className="card-hover group cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <Badge
                        variant={
                          battle.difficulty === "Expert"
                            ? "destructive"
                            : battle.difficulty === "Hard"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {battle.difficulty}
                      </Badge>
                      <div className="flex items-center gap-1 text-amber-400">
                        <Coins className="h-4 w-4" />
                        <span className="font-mono text-sm">{battle.xpReward}</span>
                      </div>
                    </div>
                    <CardTitle className="text-base mt-2">{battle.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {battle.participants} joined
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {battle.timeLeft}
                      </div>
                    </div>
                    <Button className="w-full group-hover:bg-primary/90">
                      <Swords className="h-4 w-4 mr-2" />
                      Join Battle
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Featured Challenge */}
            <Card className="bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 border-primary/30">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-amber-400" />
                  <Badge variant="outline" className="border-amber-400/50 text-amber-400">
                    Featured
                  </Badge>
                </div>
                <CardTitle>Weekly Championship: Quantum Algorithm Challenge</CardTitle>
                <CardDescription>
                  Implement a quantum-inspired optimization algorithm. Top 3 winners share 10,000 XP prize pool.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      156 participants
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />2 days left
                    </span>
                  </div>
                  <Button size="lg" className="gap-2">
                    <Trophy className="h-5 w-5" />
                    Enter Championship
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-400" />
                  Global Rankings
                </CardTitle>
                <CardDescription>Top performers this season</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.map((player, i) => (
                    <div
                      key={player.rank}
                      className={`flex items-center gap-4 p-3 rounded-lg ${
                        player.rank === 1
                          ? "bg-amber-500/10 border border-amber-500/30"
                          : player.rank === 2
                            ? "bg-slate-400/10 border border-slate-400/30"
                            : player.rank === 3
                              ? "bg-orange-600/10 border border-orange-600/30"
                              : "bg-muted/50"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          player.rank === 1
                            ? "bg-amber-500 text-amber-950"
                            : player.rank === 2
                              ? "bg-slate-400 text-slate-950"
                              : player.rank === 3
                                ? "bg-orange-600 text-orange-950"
                                : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {player.rank}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                        {player.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{player.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {player.wins} wins • {player.streak} streak
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-amber-400">{player.xp.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">XP</div>
                      </div>
                      {player.streak >= 5 && <Flame className="h-5 w-5 text-orange-500" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tokenomics Tab */}
          <TabsContent value="tokenomics" className="space-y-6">
            <div className="grid sm:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold font-mono">{(tokenomics.totalSupply / 1000).toFixed(0)}K</div>
                  <div className="text-sm text-muted-foreground">Total Supply</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold font-mono text-primary">
                    {(tokenomics.circulating / 1000).toFixed(0)}K
                  </div>
                  <div className="text-sm text-muted-foreground">Circulating</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold font-mono text-secondary">
                    {(tokenomics.staked / 1000).toFixed(0)}K
                  </div>
                  <div className="text-sm text-muted-foreground">Staked</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold font-mono text-amber-400">
                    {(tokenomics.rewards / 1000).toFixed(0)}K
                  </div>
                  <div className="text-sm text-muted-foreground">Rewards Pool</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-amber-400" />
                  How to Earn CodeXP
                </CardTitle>
                <CardDescription>Multiple ways to earn tokens in the arena</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {tokenomics.earnMethods.map((method) => (
                    <div key={method.method} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                      <div className="p-3 rounded-xl bg-amber-500/10">
                        <method.icon className="h-6 w-6 text-amber-400" />
                      </div>
                      <div>
                        <div className="font-medium">{method.method}</div>
                        <div className="text-sm text-amber-400 font-mono">{method.xp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
