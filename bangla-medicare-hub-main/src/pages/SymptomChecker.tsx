import { useState } from "react";
import { PageTransition } from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Brain, Loader2, Stethoscope, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface SymptomResult {
  urgency: "normal" | "urgent" | "emergency";
  recommended_doctor: string;
  recommended_doctor_bn: string;
  explanation_en: string;
  explanation_bn: string;
  disclaimer_en: string;
  disclaimer_bn: string;
}

const URGENCY_CONFIG = {
  normal: { label: "সাধারণ / Normal", color: "bg-green-100 text-green-800 border-green-300", icon: Stethoscope },
  urgent: { label: "জরুরি / Urgent", color: "bg-yellow-100 text-yellow-800 border-yellow-300", icon: AlertTriangle },
  emergency: { label: "জরুরি অবস্থা / Emergency", color: "bg-red-100 text-red-800 border-red-300", icon: ShieldAlert },
};

export default function SymptomChecker() {
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SymptomResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("symptom-checker", {
        body: { symptoms: symptoms.trim() },
      });

      if (fnError) throw new Error(fnError.message);
      setResult(data as SymptomResult);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const urgency = result ? URGENCY_CONFIG[result.urgency] : null;
  const UrgencyIcon = urgency?.icon || Stethoscope;

  return (
    <PageTransition>
      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">এআই লক্ষণ পরীক্ষা / AI Symptom Checker</h1>
            <p className="text-sm text-muted-foreground">আপনার লক্ষণ লিখুন, আমরা সঠিক ডাক্তার সাজেস্ট করব</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">লক্ষণ বর্ণনা করুন / Describe Your Symptoms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="যেমন: মাথা ব্যথা, জ্বর ৩ দিন ধরে... / e.g. Headache, fever for 3 days..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="min-h-[120px]"
            />
            <Button onClick={handleCheck} disabled={loading || !symptoms.trim()} className="w-full md:w-auto" size="lg">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  বিশ্লেষণ চলছে / Analyzing...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  লক্ষণ পরীক্ষা করুন / Check Symptoms
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-destructive">
            <CardContent className="p-4 text-destructive text-sm">
              ত্রুটি / Error: {error}
            </CardContent>
          </Card>
        )}

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">

              {/* Emergency Alert */}
              {result.urgency === "emergency" && (
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="rounded-lg border-2 border-red-500 bg-red-50 p-6 text-center space-y-2"
                >
                  <ShieldAlert className="mx-auto h-12 w-12 text-red-600 animate-pulse" />
                  <h2 className="text-xl font-bold text-red-700">জরুরি অবস্থা! / EMERGENCY!</h2>
                  <p className="text-red-600 font-medium">অনুগ্রহ করে অবিলম্বে জরুরি বিভাগে যান।</p>
                  <p className="text-red-600">Please go to the Emergency Department immediately.</p>
                </motion.div>
              )}

              {/* Result Card */}
              <Card className="shadow-lg">
                <CardContent className="p-6 space-y-5">
                  {/* Urgency Badge */}
                  <div className="flex items-center gap-3">
                    <UrgencyIcon className="h-6 w-6" />
                    <div>
                      <p className="text-xs text-muted-foreground">জরুরিতা / Urgency Level</p>
                      <Badge className={`${urgency?.color} text-sm px-3 py-1`}>{urgency?.label}</Badge>
                    </div>
                  </div>

                  {/* Doctor Recommendation */}
                  <div className="bg-secondary rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">প্রস্তাবিত ডাক্তার / Recommended Doctor</p>
                    <p className="text-xl font-bold text-primary">
                      {result.recommended_doctor_bn} / {result.recommended_doctor}
                    </p>
                  </div>

                  {/* Explanation */}
                  <div className="space-y-2">
                    <p className="text-sm text-foreground leading-relaxed">{result.explanation_bn}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{result.explanation_en}</p>
                  </div>

                  {/* Disclaimer */}
                  <div className="border-t pt-4">
                    <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted rounded-md p-3">
                      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                      <div>
                        <p>{result.disclaimer_bn}</p>
                        <p>{result.disclaimer_en}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
