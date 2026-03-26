"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  createEmptyLearningProfile,
  fetchLearningProfile,
  getLearningSummary,
  persistLearningReset,
  persistLearningToggle
} from "@/lib/remix-learning";

export function LearningSettings() {
  const [enabled, setEnabled] = useState(true);
  const [summary, setSummary] = useState(getLearningSummary(createEmptyLearningProfile()));

  useEffect(() => {
    let active = true;

    fetchLearningProfile()
      .then((profile) => {
        if (!active) return;
        setEnabled(profile.enabled);
        setSummary(getLearningSummary(profile));
      })
      .catch(() => {
        if (!active) return;
        const profile = createEmptyLearningProfile();
        setEnabled(profile.enabled);
        setSummary(getLearningSummary(profile));
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleToggle() {
    const profile = await persistLearningToggle(!enabled);
    setEnabled(profile.enabled);
    setSummary(getLearningSummary(profile));
  }

  async function handleReset() {
    const profile = await persistLearningReset();
    setEnabled(profile.enabled);
    setSummary(getLearningSummary(profile));
  }

  return (
    <Card>
      <CardTitle>Learning</CardTitle>
      <CardDescription className="mt-2">
        Controlled backend learning that adapts prompts from your behavior without changing core logic.
      </CardDescription>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button variant={enabled ? "default" : "secondary"} onClick={handleToggle}>
          Learning: {enabled ? "On" : "Off"}
        </Button>
        <Button variant="ghost" onClick={handleReset}>
          Reset learned preferences
        </Button>
      </div>
      <div className="mt-4 grid gap-2 text-sm">
        <div>Favorite tone: {summary.favoriteTone}</div>
        <div>Favorite hook style: {summary.favoriteHookStyle}</div>
        <div>Preferred caption length: {summary.preferredCaptionLength}</div>
        <div>Preferred CTA style: {summary.preferredCtaStyle}</div>
        <div>Most used platform: {summary.mostUsedPlatform}</div>
        <div>Top topic pattern: {summary.topTopicPattern}</div>
        <div>Best saved style examples: {summary.topExamples.length}</div>
      </div>
    </Card>
  );
}
