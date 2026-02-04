"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AIAssistantDashboard } from "@/components/ai/ai-assistant-dashboard"
import { Brain, Zap, Target, Shield, TrendingUp, Users } from "lucide-react"

export default function AIAssistantPage() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null)

  const aiFeatures = [
    {
      icon: <Brain className="h-8 w-8 text-blue-600" />,
      title: "Predictive Analytics",
      description: "Advanced algorithms forecast patient needs, complications, and resource requirements",
      benefits: ["94% prediction accuracy", "Early intervention alerts", "Resource optimization"],
      impact: "30% reduction in adverse events",
    },
    {
      icon: <Target className="h-8 w-8 text-green-600" />,
      title: "Personalized Treatment",
      description: "AI-driven treatment recommendations based on genomic data and clinical evidence",
      benefits: ["Genomic-guided therapy", "Evidence-based protocols", "Outcome optimization"],
      impact: "25% improvement in treatment response",
    },
    {
      icon: <Zap className="h-8 w-8 text-purple-600" />,
      title: "Workflow Automation",
      description: "Intelligent systems streamline administrative tasks and clinical workflows",
      benefits: ["89% task automation", "Error reduction", "Time savings"],
      impact: "14+ hours saved daily",
    },
    {
      icon: <Shield className="h-8 w-8 text-red-600" />,
      title: "Real-time Monitoring",
      description: "Continuous patient monitoring with intelligent alerting for critical changes",
      benefits: ["24/7 monitoring", "Instant alerts", "Proactive interventions"],
      impact: "40% faster response times",
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-orange-600" />,
      title: "Outcome Analytics",
      description: "Comprehensive reporting and analytics to track and improve patient outcomes",
      benefits: ["KPI tracking", "Performance insights", "Quality improvement"],
      impact: "18% outcome improvement",
    },
    {
      icon: <Users className="h-8 w-8 text-teal-600" />,
      title: "System Integration",
      description: "Seamless integration with existing hospital systems and workflows",
      benefits: ["EHR integration", "Interoperability", "Data accessibility"],
      impact: "100% system compatibility",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">AI-Powered Healthcare Assistant</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Revolutionary AI technology designed to transform hospital operations, improve patient outcomes, and deliver
          measurable results that surpass current healthcare offerings.
        </p>
        <div className="flex justify-center space-x-4">
          <Badge className="bg-green-100 text-green-800 px-4 py-2">94% Predictive Accuracy</Badge>
          <Badge className="bg-blue-100 text-blue-800 px-4 py-2">18% Outcome Improvement</Badge>
          <Badge className="bg-purple-100 text-purple-800 px-4 py-2">$47K Monthly Savings</Badge>
        </div>
      </div>

      {/* Key Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {aiFeatures.map((feature, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                {feature.icon}
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">{feature.description}</p>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Key Benefits:</h4>
                <ul className="text-sm space-y-1">
                  {feature.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-800">Impact: {feature.impact}</p>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setActiveDemo(activeDemo === feature.title ? null : feature.title)}
              >
                {activeDemo === feature.title ? "Hide Demo" : "View Demo"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Competitive Advantages */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Competitive Advantages</CardTitle>
          <p className="text-gray-600">
            Our AI assistant delivers superior performance compared to existing healthcare solutions
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-blue-600">3x</div>
              <div className="text-sm text-gray-600">Faster than traditional risk assessment</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-green-600">94%</div>
              <div className="text-sm text-gray-600">Prediction accuracy for 24h outcomes</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-purple-600">89%</div>
              <div className="text-sm text-gray-600">Workflow automation rate</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-orange-600">$47K</div>
              <div className="text-sm text-gray-600">Monthly cost savings</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Evidence-Based Results */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Evidence-Based Results</CardTitle>
          <p className="text-gray-600">Measurable improvements in patient care and operational efficiency</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Patient Outcomes</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Adverse Events</span>
                  <span className="font-medium text-green-600">-23%</span>
                </div>
                <div className="flex justify-between">
                  <span>Readmission Rate</span>
                  <span className="font-medium text-green-600">-18%</span>
                </div>
                <div className="flex justify-between">
                  <span>Length of Stay</span>
                  <span className="font-medium text-green-600">-15%</span>
                </div>
                <div className="flex justify-between">
                  <span>Patient Satisfaction</span>
                  <span className="font-medium text-green-600">+22%</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Operational Efficiency</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Documentation Time</span>
                  <span className="font-medium text-blue-600">-45%</span>
                </div>
                <div className="flex justify-between">
                  <span>Workflow Errors</span>
                  <span className="font-medium text-blue-600">-67%</span>
                </div>
                <div className="flex justify-between">
                  <span>Resource Utilization</span>
                  <span className="font-medium text-blue-600">+31%</span>
                </div>
                <div className="flex justify-between">
                  <span>Staff Productivity</span>
                  <span className="font-medium text-blue-600">+28%</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Financial Impact</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Labor Costs</span>
                  <span className="font-medium text-purple-600">-$32K/mo</span>
                </div>
                <div className="flex justify-between">
                  <span>Error Prevention</span>
                  <span className="font-medium text-purple-600">-$9K/mo</span>
                </div>
                <div className="flex justify-between">
                  <span>Efficiency Gains</span>
                  <span className="font-medium text-purple-600">-$6K/mo</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Savings</span>
                  <span className="font-medium text-purple-600">$47K/mo</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Dashboard */}
      <AIAssistantDashboard />
    </div>
  )
}
